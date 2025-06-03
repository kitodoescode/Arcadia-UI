const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  windowControls: {
    minimize: () => ipcRenderer.invoke('window-controls', 'minimize'),
    maximize: () => ipcRenderer.invoke('window-controls', 'maximize'),
    close: () => ipcRenderer.invoke('window-controls', 'close')
  },
  inject: () => ipcRenderer.invoke('inject'),
  executeScript: (script) => ipcRenderer.invoke('execute-script', script),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  killRoblox: () => ipcRenderer.invoke('kill-roblox'),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
  showSaveDialog: async (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: async (options) => ipcRenderer.invoke('show-open-dialog', options),
  saveFile: async (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  openFile: async (filePath) => ipcRenderer.invoke('open-file', filePath)
});