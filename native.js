/* ProF Controller — ponte com recursos nativos (Android e iOS, via Capacitor).
 *
 * No navegador e no Electron este arquivo não faz nada: window.ProfNative.isNative
 * fica false e o app segue usando as APIs da web (WebAuthn, download por link etc.).
 *
 * No app nativo ele cuida de:
 *   - biometria com o segredo guardado no Keystore (Android) / Keychain (iOS),
 *     preso à biometria cadastrada no aparelho (não dá para ler sem digital/rosto);
 *   - salvar/compartilhar arquivos (backup, CSV, imagem), já que o WebView não baixa arquivos;
 *   - abrir links externos no navegador do sistema;
 *   - barra de status, área segura (notch) e botão "voltar" do Android;
 *   - lembretes locais de vencimento de contas.
 *
 * Carregado ANTES do app.js. Não usa bundler: acessa os plugins pelo window.Capacitor
 * que o próprio app nativo injeta.
 */
(function () {
  'use strict';

  const Cap = window.Capacitor;
  const isNative = !!(Cap && typeof Cap.isNativePlatform === 'function' && Cap.isNativePlatform());
  const platform = isNative ? Cap.getPlatform() : (navigator.userAgent.includes('Electron') ? 'electron' : 'web');

  const plugin = (name) => {
    if (!isNative) return null;
    if (Cap.Plugins && Cap.Plugins[name]) return Cap.Plugins[name];
    try { return Cap.registerPlugin(name); } catch (e) { return null; }
  };

  const api = { isNative, platform };
  window.ProfNative = api;

  document.documentElement.classList.add('platform-' + platform);
  if (isNative) document.documentElement.classList.add('native');
  if (!isNative) return;

  const Browser = plugin('Browser');
  const App = plugin('App');
  const StatusBar = plugin('StatusBar');
  const SplashScreen = plugin('SplashScreen');
  const Filesystem = plugin('Filesystem');
  const Share = plugin('Share');
  const Bio = plugin('NativeBiometric');
  const Notif = plugin('LocalNotifications');

  /* ---------------- Barra de status ---------------- */
  // O conteúdo passa por baixo da barra de status; o CSS usa env(safe-area-inset-*)
  // para empurrar o cabeçalho para baixo do relógio/notch.
  const isDark = () => {
    const tema = document.body && document.body.getAttribute('data-theme');
    return tema !== 'light';
  };
  async function syncStatusBar() {
    if (!StatusBar) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      // Style "DARK" = ícones claros (para fundo escuro); "LIGHT" = ícones escuros.
      await StatusBar.setStyle({ style: isDark() ? 'DARK' : 'LIGHT' });
    } catch (e) { /* iOS não tem setOverlaysWebView: ignora */ }
  }
  document.addEventListener('DOMContentLoaded', () => {
    syncStatusBar();
    if (document.body) new MutationObserver(syncStatusBar).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    if (SplashScreen) setTimeout(() => SplashScreen.hide().catch(() => {}), 300);
  });

  /* ---------------- Links externos ---------------- */
  // Dentro do app, um link comum trocaria a tela do app pelo site. Aqui todo link
  // http(s) para fora do app abre no navegador do sistema (Chrome Custom Tab / Safari).
  const ehExterno = (href) => {
    try {
      const u = new URL(href, location.href);
      return /^https?:$/.test(u.protocol) && u.origin !== location.origin;
    } catch (e) { return false; }
  };
  api.openExternal = (url) => (Browser ? Browser.open({ url }) : Promise.resolve(window.open(url, '_system')));

  document.addEventListener('click', (ev) => {
    const a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || !ehExterno(href)) return;
    ev.preventDefault();
    api.openExternal(new URL(href, location.href).href);
  }, true);

  const openOriginal = window.open ? window.open.bind(window) : null;
  window.open = function (url, target, features) {
    if (url && ehExterno(String(url))) { api.openExternal(new URL(String(url), location.href).href); return null; }
    return openOriginal ? openOriginal(url, target, features) : null;
  };

  /* ---------------- Botão "voltar" do Android ---------------- */
  if (App && platform === 'android') {
    App.addListener('backButton', () => {
      const sec = document.getElementById('secOverlay');
      if (sec && !sec.classList.contains('hidden')) return; // tela de senha: não fecha
      const modal = document.getElementById('modal');
      if (modal && !modal.classList.contains('hidden') && typeof window.closeModal === 'function') { window.closeModal(); return; }
      const menu = document.querySelector('.gear-menu:not(.hidden)');
      if (menu) { menu.classList.add('hidden'); return; }
      App.minimizeApp();
    });
  }

  /* ---------------- Salvar / compartilhar arquivos ---------------- */
  const blobToBase64 = (blob) => new Promise((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(',')[1] || '');
    r.onerror = () => erro(r.error);
    r.readAsDataURL(blob);
  });

  // Grava o arquivo na pasta de cache do app e abre a folha de compartilhamento do
  // sistema: a pessoa escolhe salvar em Arquivos/Drive, mandar por e-mail etc.
  api.saveFile = async (filename, content, type) => {
    if (!Filesystem || !Share) throw new Error('Plugins de arquivo indisponíveis');
    const blob = content instanceof Blob ? content : new Blob([content], { type: type || 'application/octet-stream' });
    const nome = String(filename).replace(/[\\/:*?"<>|]+/g, '_');
    const data = await blobToBase64(blob);
    const res = await Filesystem.writeFile({ path: nome, data, directory: 'CACHE' });
    try {
      await Share.share({ title: nome, files: [res.uri], dialogTitle: nome });
    } catch (e) {
      if (!/cancel/i.test(String(e && (e.message || e)))) throw e; // cancelar não é erro
    }
  };

  /* ---------------- Biometria ---------------- */
  // O segredo de 32 bytes que embrulha a chave de dados fica no Keystore/Keychain com
  // controle de acesso BIOMETRY_CURRENT_SET: o sistema só entrega o valor depois de
  // uma digital/rosto válidos, e invalida o item se a biometria do aparelho mudar
  // (nova digital cadastrada). Não é só uma tela: sem a biometria, o segredo não sai.
  const BIO_KEY = 'prof-controller.vault-bio';
  const ACCESS_BIOMETRY_CURRENT_SET = 1;
  const ERR_NO_PROTECTED_DATA = 21;

  api.biometric = {
    async available() {
      if (!Bio) return false;
      try {
        const r = await Bio.isAvailable({ useFallback: false });
        return !!(r && r.isAvailable);
      } catch (e) { return false; }
    },
    async store(secretB64, textos) {
      await Bio.deleteData({ key: BIO_KEY }).catch(() => {});
      await Bio.setData({
        key: BIO_KEY,
        value: secretB64,
        accessControl: ACCESS_BIOMETRY_CURRENT_SET,
        title: (textos && textos.title) || 'ProF Controller',
        negativeButtonText: (textos && textos.cancel) || 'Cancelar',
      });
    },
    async retrieve(textos) {
      try {
        const r = await Bio.getSecureData({
          key: BIO_KEY,
          reason: (textos && textos.reason) || 'ProF Controller',
          title: (textos && textos.title) || 'ProF Controller',
          negativeButtonText: (textos && textos.cancel) || 'Cancelar',
        });
        return r.value;
      } catch (e) {
        const code = Number(e && (e.code ?? (e.data && e.data.code)));
        if (code === ERR_NO_PROTECTED_DATA || /No protected/i.test(String(e && e.message))) {
          const erro = new Error('BIO_INVALIDATED'); erro.cause = e; throw erro;
        }
        throw e;
      }
    },
    async remove() {
      if (Bio) await Bio.deleteData({ key: BIO_KEY }).catch(() => {});
    },
  };

  /* ---------------- Lembretes locais ---------------- */
  // Recebe a lista de vencimentos [{id, title, body, at: Date}] e reagenda tudo.
  // Os IDs ficam numa faixa própria para não apagar outros avisos.
  const NOTIF_BASE = 700000;
  api.notifications = {
    async permission(pedir) {
      if (!Notif) return 'denied';
      let st = await Notif.checkPermissions();
      if (st.display === 'prompt' && pedir) st = await Notif.requestPermissions();
      return st.display;
    },
    async replaceAll(itens, pedirPermissao) {
      if (!Notif) return 0;
      const perm = await api.notifications.permission(pedirPermissao);
      const pendentes = await Notif.getPending().catch(() => ({ notifications: [] }));
      const nossos = (pendentes.notifications || []).filter((n) => n.id >= NOTIF_BASE && n.id < NOTIF_BASE + 100000);
      if (nossos.length) await Notif.cancel({ notifications: nossos.map((n) => ({ id: n.id })) });
      if (perm !== 'granted') return 0;
      const agora = Date.now();
      const lista = itens
        .filter((i) => i.at instanceof Date && i.at.getTime() > agora)
        .slice(0, 60) // iOS aceita no máximo 64 pendentes
        .map((i, n) => ({
          id: NOTIF_BASE + n,
          title: i.title,
          body: i.body,
          schedule: { at: i.at, allowWhileIdle: true },
          smallIcon: 'ic_stat_notify',
          extra: { tab: i.tab || 'lancamentos' },
        }));
      if (lista.length) await Notif.schedule({ notifications: lista });
      return lista.length;
    },
  };
})();
