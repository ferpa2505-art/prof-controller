// Ponte mínima entre a janela e o processo principal do Electron.
// (Antes usava ipcMain aqui, que só existe no processo principal: o preload
//  quebrava ao abrir. O certo no preload é ipcRenderer.)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
