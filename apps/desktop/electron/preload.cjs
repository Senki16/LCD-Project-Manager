const { contextBridge } = require('electron');

// Expone API mínima al renderer (la app usa axios a localhost, no necesita IPC)
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  version: process.versions.electron,
});
