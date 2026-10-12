// Ponte mínima entre a janela e o processo principal do Electron.
// (Antes usava ipcMain aqui, que só existe no processo principal: o preload
//  quebrava ao abrir. O certo no preload é ipcRenderer.)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  // Lê feeds de notícias pelo processo principal (sem CORS). Só hosts liberados no main.js.
  fetchText: (url) => ipcRenderer.invoke('fetch-text', url),
});
