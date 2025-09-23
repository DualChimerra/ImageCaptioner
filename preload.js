const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openImages: () => ipcRenderer.invoke('dialog:openImages'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  exportRun: (items, outputDir, startIndex = 1) =>
    ipcRenderer.invoke('export:run', { items, outputDir, startIndex }),
  openDirectoryPath: (dirPath) => shell.openPath(dirPath),
  openExternal: (url) => shell.openExternal(url),
});


