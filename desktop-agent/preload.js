/**
 * Preload Script
 * Exposes secure IPC bridges to renderer processes
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('agentAPI', {
  // Consent
  acceptConsent: () => ipcRenderer.invoke('consent-accept'),
  declineConsent: () => ipcRenderer.invoke('consent-decline'),

  // Auth
  login: (email, password) => ipcRenderer.invoke('login', { email, password }),

  // Status
  getStatus: () => ipcRenderer.invoke('get-status'),

  // Events
  onStatusChange: (callback) => ipcRenderer.on('status-change', (_, data) => callback(data)),
});
