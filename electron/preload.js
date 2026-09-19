const { contextBridge, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcMain.invoke('get-app-version'),
  getAppPath: () => ipcMain.invoke('get-app-path')
});
