/* ============================================================
   ProF Controller 1.3.2 — ajustes de interface

   - "+ Nova conta" do Dashboard abre o mesmo formulário de Cadastros → Contas.
   - "Atualizar tudo" ao lado de "Seu Patrimônio": câmbio, cotações,
     notícias e verificação de versão do app.
   - X para fechar Preferências, Configurações avançadas e Notícias.
   - Simulador de câmbio em painel próprio (ícone de moedas no topo).

   Tudo roda no aparelho. A única consulta extra é a versão publicada
   (package.json do repositório público), sem enviar nenhum dado.
   Textos entram só com textContent (nada de HTML vindo de fora).
   ============================================================ */
(function () {
  'use strict';

  const STORE_URL = 'https://play.google.com/store/apps/details?id=com.profcontroller.app';
  const VERSION_URL = 'https://raw.githubusercontent.com/ferpa2505-art/prof-controller/main/package.json';
  const VERSION_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}$/;

  const TXT = {
    'pt-BR': {
      close: 'Fechar', updateAll: 'Atualizar tudo', updating: 'Atualizando câmbio, cotações e notícias…',
      checking: 'Verificando a versão do app…', upToDate: 'Tudo atualizado. Você já está na versão {v}.',
      newer: 'Nova versão {n} disponível (você tem a {v}).', openStore: 'Abrir Play Store',
      reload: 'Recarregar agora', storeHint: 'Se a Play Store ainda não mostrar, a atualização chega em breve.',
      offline: 'Não deu para verificar a versão do app agora (sem internet?).',
      fxsim: 'Simulador de câmbio'
    },
    en: {
      close: 'Close', updateAll: 'Update all', updating: 'Updating FX, quotes and news…',
      checking: 'Checking the app version…', upToDate: 'All up to date. You are on version {v}.',
      newer: 'New version {n} available (you have {v}).', openStore: 'Open Play Store',
      reload: 'Reload now', storeHint: 'If the Play Store does not show it yet, the update is on its way.',
      offline: 'Could not check the app version right now (no internet?).',
      fxsim: 'Currency simulator'
    },
    es: {
      close: 'Cerrar', updateAll: 'Actualizar todo', updating: 'Actualizando cambio, cotizaciones y noticias…',
      checking: 'Verificando la versión de la app…', upToDate: 'Todo actualizado. Ya tienes la versión {v}.',
      newer: 'Nueva versión {n} disponible (tienes la {v}).', openStore: 'Abrir Play Store',
      reload: 'Recargar ahora', storeHint: 'Si la Play Store aún no la muestra, la actualización llega pronto.',
      offline: 'No se pudo verificar la versión de la app ahora (¿sin internet?).',
      fxsim: 'Simulador de cambio'
    }
  };

  const $ = (id) => document.getElementById(id);

  function lang() {
    try { if (typeof state !== 'undefined' && state && state.settings && state.settings.lang) return state.settings.lang; } catch (e) { /* sem state */ }
    return document.documentElement.lang || 'pt-BR';
  }
  function T(k, vars) {
    const l = lang();
    const pack = TXT[l] || TXT[l.slice(0, 2)] || TXT['pt-BR'];
    let s = pack[k] != null ? pack[k] : TXT['pt-BR'][k];
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.split('{' + a + '}').join(String(b));
    return s;
  }

  /* ---------- Fechar painéis ---------- */

  function goDashboard() {
    const tab = document.querySelector('#mainTabs .tab[data-group="dashboard"]');
    if (tab) tab.click();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function closeGear() {
    const menu = $('gearMenu');
    const btn = $('btnGear');
    if (!menu || menu.classList.contains('hidden')) return;
    // Usa o próprio botão da engrenagem para o app.js manter o estado certo.
    if (btn) btn.click();
    if (!menu.classList.contains('hidden')) menu.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  /* ---------- Simulador em painel próprio ---------- */

  let lastFocus = null;
  function simPanel() { return $('fxSimPanel'); }
  function openSim() {
    const panel = simPanel();
    if (!panel) return;
    closeGear();
    lastFocus = document.activeElement;
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('fxsim-panel-open');
    const x = $('fxSimClose');
    if (x) x.focus();
  }
  function closeSim() {
    const panel = simPanel();
    if (!panel || panel.classList.contains('hidden')) return;
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('fxsim-panel-open');
    const back = lastFocus && document.contains(lastFocus) ? lastFocus : $('btnFxSim');
    if (back && back.focus) back.focus();
  }

  /* ---------- Versão do app ---------- */

  function currentVersion() {
    try { if (typeof APP_VERSION === 'string' && VERSION_RE.test(APP_VERSION)) return APP_VERSION; } catch (e) { /* sem APP_VERSION */ }
    const m = /v(\d{1,3}\.\d{1,3}\.\d{1,3})/.exec((($('appVersion') || {}).textContent) || '');
    return m ? m[1] : null;
  }
  function newerThan(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) { if (pa[i] !== pb[i]) return pa[i] > pb[i]; }
    return false;
  }
  async function latestVersion() {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 8000) : null;
    try {
      const res = await fetch(VERSION_URL + '?t=' + Date.now(), {
        cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctrl ? ctrl.signal : undefined
      });
      if (!res.ok) return null;
      const data = await res.json();
      const v = data && typeof data.version === 'string' ? data.version.trim() : '';
      return VERSION_RE.test(v) ? v : null;
    } catch (e) {
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  function platform() {
    try {
      const C = window.Capacitor;
      if (C && typeof C.isNativePlatform === 'function' && C.isNativePlatform()) {
        return typeof C.getPlatform === 'function' ? C.getPlatform() : 'native';
      }
    } catch (e) { /* web */ }
    if (/Electron/i.test(navigator.userAgent || '')) return 'electron';
    return 'web';
  }
  async function swRegistration() {
    try {
      if (!('serviceWorker' in navigator)) return null;
      return (await navigator.serviceWorker.getRegistration()) || null;
    } catch (e) { return null; }
  }

  /* ---------- Atualizar tudo ---------- */

  function setStatus(text, action) {
    const box = $('dashUpdateStatus');
    if (!box) return;
    box.textContent = '';
    if (!text) { box.classList.add('hidden'); return; }
    const span = document.createElement('span');
    span.textContent = text;
    box.appendChild(span);
    if (action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'primary-btn dash-update-action';
      b.textContent = action.label;
      b.addEventListener('click', action.run);
      box.appendChild(b);
      if (action.hint) {
        const small = document.createElement('small');
        small.textContent = action.hint;
        box.appendChild(small);
      }
    }
    box.classList.remove('hidden');
  }

  let busy = false;
  async function updateAll() {
    const btn = $('btnDashUpdateAll');
    if (busy) return;
    busy = true;
    if (btn) { btn.disabled = true; btn.classList.add('is-busy'); }
    setStatus(T('updating'));
    try {
      // Mesmo fluxo do "Atualizar tudo" antigo (câmbio + cotações, com o aviso do app).
      const legacy = $('btnUpdateAll');
      if (legacy && !legacy.disabled) legacy.click();
      if (typeof forceRefreshForexRates === 'function') {
        try { forceRefreshForexRates(); } catch (e) { /* widget indisponível */ }
      }
      const news = $('btnNewsRefresh');
      if (news && !news.disabled) news.click();

      setStatus(T('checking'));
      const plat = platform();
      const reg = plat === 'web' ? await swRegistration() : null;
      if (reg) { try { await reg.update(); } catch (e) { /* sem rede */ } }

      const mine = currentVersion();
      const latest = await latestVersion();
      if (!latest || !mine) { setStatus(T('offline')); return; }
      if (!newerThan(latest, mine)) { setStatus(T('upToDate', { v: mine })); return; }

      const msg = T('newer', { n: latest, v: mine });
      if (plat === 'android') {
        setStatus(msg, { label: T('openStore'), hint: T('storeHint'), run: () => { window.open(STORE_URL, '_blank', 'noopener'); } });
      } else if (plat === 'web') {
        setStatus(msg, { label: T('reload'), run: () => { window.location.reload(); } });
      } else {
        setStatus(msg);
      }
    } finally {
      busy = false;
      if (btn) { btn.disabled = false; btn.classList.remove('is-busy'); }
    }
  }

  /* ---------- Textos (seguem o idioma escolhido) ---------- */

  function applyTexts() {
    document.querySelectorAll('.panel-close').forEach((b) => {
      b.setAttribute('aria-label', T('close'));
      b.title = T('close');
    });
    const up = $('btnDashUpdateAll');
    if (up) {
      const label = up.querySelector('.dash-update-label');
      if (label) label.textContent = T('updateAll');
      up.title = T('updateAll');
    }
    const sim = $('btnFxSim');
    if (sim) { sim.title = T('fxsim'); sim.setAttribute('aria-label', T('fxsim')); }
  }

  /* ---------- Ligações ---------- */

  function init() {
    // "+ Nova conta" no card Contas: captura antes do clique do card (que abre detalhes).
    const dashAdd = $('btnDashAddAccount');
    if (dashAdd) {
      dashAdd.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const real = $('btnAddAccount');
        if (real) real.click();
      }, true);
    }

    const up = $('btnDashUpdateAll');
    if (up) up.addEventListener('click', (e) => { e.preventDefault(); updateAll(); });

    const gearX = $('gearClose');
    if (gearX) gearX.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeGear();
      const g = $('btnGear');
      if (g) g.focus();
    });

    document.querySelectorAll('[data-close-panel]').forEach((b) => {
      b.addEventListener('click', (e) => { e.preventDefault(); goDashboard(); });
    });

    const simBtn = $('btnFxSim');
    if (simBtn) simBtn.addEventListener('click', (e) => { e.preventDefault(); openSim(); });
    const simX = $('fxSimClose');
    if (simX) simX.addEventListener('click', (e) => { e.preventDefault(); closeSim(); });
    const panel = simPanel();
    if (panel) panel.addEventListener('click', (e) => { if (e.target === panel) closeSim(); });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const p = simPanel();
      if (p && !p.classList.contains('hidden')) { closeSim(); return; }
      const menu = $('gearMenu');
      if (menu && !menu.classList.contains('hidden')) { closeGear(); const g = $('btnGear'); if (g) g.focus(); }
    });

    const langs = $('langButtons');
    if (langs) langs.addEventListener('click', () => setTimeout(applyTexts, 80));
    applyTexts();
    // O app.js pode trocar o idioma depois de carregar o cofre.
    setTimeout(applyTexts, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
