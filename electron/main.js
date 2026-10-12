// ProF Controller — versão desktop (Electron)
//
// Carrega a pasta www/ montada por scripts/build-www.mjs (rode `npm run build` antes).
// Os dados ficam no IndexedDB do perfil do Electron, na pasta de dados do usuário
// (Windows: %APPDATA%\ProF Controller), separados do navegador.

const { app, BrowserWindow, Menu, ipcMain, shell, session, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const { isApprovedExternalUrl } = require(path.join(__dirname, '..', 'www', 'navigation-policy.js'));

const WWW = path.join(__dirname, '..', 'www');
const APP_URL = pathToFileURL(path.join(WWW, 'index.html'));
let mainWindow = null;

// Uma instância só: abrir de novo apenas traz a janela existente para frente.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

const ehAppUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === APP_URL.protocol && url.pathname === APP_URL.pathname;
  } catch {
    return false;
  }
};
const abrirExterno = (url) => {
  if (isApprovedExternalUrl(url, APP_URL.href)) shell.openExternal(url).catch(() => {});
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1a1a2e',
    show: false,
    icon: path.join(WWW, 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Links com target="_blank" ou window.open(): abrem no navegador padrão do sistema.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    abrirExterno(url);
    return { action: 'deny' };
  });

  // Only the application document and approved HTTPS destinations may navigate.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (ehAppUrl(url)) return;
    event.preventDefault();
    abrirExterno(url);
  });

  mainWindow.loadFile(path.join(WWW, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // O app não usa câmera, microfone, localização etc.: nega qualquer pedido.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'clipboard-sanitized-write');
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Menu
const isMac = process.platform === 'darwin';
const template = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    label: 'Arquivo',
    submenu: [isMac ? { role: 'close', label: 'Fechar' } : { role: 'quit', label: 'Sair' }],
  },
  {
    label: 'Editar',
    submenu: [
      { role: 'undo', label: 'Desfazer' },
      { role: 'redo', label: 'Refazer' },
      { type: 'separator' },
      { role: 'cut', label: 'Recortar' },
      { role: 'copy', label: 'Copiar' },
      { role: 'paste', label: 'Colar' },
      { role: 'selectAll', label: 'Selecionar tudo' },
    ],
  },
  {
    label: 'Exibir',
    submenu: [
      { role: 'reload', label: 'Recarregar' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Tamanho original' },
      { role: 'zoomIn', label: 'Aumentar' },
      { role: 'zoomOut', label: 'Diminuir' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Tela cheia' },
    ],
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Política de privacidade',
        click: () => shell.openExternal('https://ferpa2505-art.github.io/prof-controller/privacy.html'),
      },
    ],
  },
];
Menu.setApplicationMenu(Menu.buildFromTemplate(template));

// IPC
ipcMain.handle('get-app-version', () => app.getVersion());

// Feeds de notícias: o Google Notícias não libera leitura direta pela página (CORS)
// e recusa o rss2json. O processo principal busca direto, só nos hosts abaixo.
const FEED_HOSTS = ['news.google.com'];
ipcMain.handle('fetch-text', async (_evt, url) => {
  const u = new URL(String(url));
  if (u.protocol !== 'https:' || !FEED_HOSTS.includes(u.hostname)) throw new Error('Host não permitido: ' + u.hostname);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await net.fetch(u.href, { signal: ctrl.signal, headers: { Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.5' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const texto = await res.text();
    return texto.slice(0, 2 * 1024 * 1024); // limite de 2 MB por feed
  } finally {
    clearTimeout(timer);
  }
});
