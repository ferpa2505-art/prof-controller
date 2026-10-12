// ProF Controller — versão desktop (Electron)
//
// Carrega a pasta www/ montada por scripts/build-www.mjs (rode `npm run build` antes).
// Os dados ficam no IndexedDB do perfil do Electron, na pasta de dados do usuário
// (Windows: %APPDATA%\ProF Controller), separados do navegador.

const { app, BrowserWindow, Menu, ipcMain, shell, session } = require('electron');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
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

const ehExterno = (url) => /^https?:\/\//i.test(url);

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
    if (ehExterno(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Clique comum num link externo também não troca a tela do app pelo site.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (ehExterno(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
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
