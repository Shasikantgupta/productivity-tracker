/**
 * App Tracker
 * Monitors active application/window changes
 */
const log = require('electron-log');

class AppTracker {
  constructor() {
    this.appUsages = [];
    this.currentApp = null;
    this.currentWindow = null;
    this.currentSession = null;
    this.pollInterval = null;
  }

  start() {
    log.info('App tracker started');

    this.pollInterval = setInterval(async () => {
      try {
        // Dynamic import for ESM module
        const activeWin = await import('active-win');
        const win = await activeWin.default();

        if (!win) return;

        const appName = win.owner?.name || 'Unknown';
        const windowTitle = win.title || '';

        // Detect app switch
        if (appName !== this.currentApp || windowTitle !== this.currentWindow) {
          this._endCurrentSession();
          this._startSession(appName, windowTitle, win.owner?.path);
          this.currentApp = appName;
          this.currentWindow = windowTitle;
        }
      } catch (err) {
        // active-win may fail on some platforms
        log.warn('App tracking poll error:', err.message);
      }
    }, 5000); // Poll every 5 seconds
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this._endCurrentSession();
  }

  getCurrentApp() {
    return this.currentApp;
  }

  getCurrentWindow() {
    return this.currentWindow;
  }

  flush() {
    const flushed = [...this.appUsages];
    this.appUsages = [];
    return flushed;
  }

  _startSession(appName, windowTitle, appPath) {
    this.currentSession = {
      app_name: appName,
      app_executable: appPath || null,
      window_title: windowTitle,
      started_at: new Date().toISOString(),
      ended_at: null,
      is_foreground: true,
    };
  }

  _endCurrentSession() {
    if (this.currentSession) {
      this.currentSession.ended_at = new Date().toISOString();
      this.appUsages.push({ ...this.currentSession });
      this.currentSession = null;
    }
  }
}

module.exports = { AppTracker };
