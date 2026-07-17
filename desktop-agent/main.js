/**
 * Productivity Agent - Electron Main Process
 * Handles system tray, consent flow, and tracker coordination
 */
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const log = require('electron-log');

const { ActivityTracker } = require('./src/trackers/activity-tracker');
const { AppTracker } = require('./src/trackers/app-tracker');
const { ScreenshotService } = require('./src/services/screenshot-service');
const { ApiService } = require('./src/services/api-service');
const { WebSocketService } = require('./src/services/websocket-service');

// ---- Configuration ----
const store = new Store({
  defaults: {
    serverUrl: 'http://localhost:8000',
    wsUrl: 'ws://localhost:8000',
    employeeId: null,
    authToken: null,
    consentGiven: false,
    trackingEnabled: true,
    screenshotInterval: 300000, // 5 minutes
    idleTimeout: 300, // 5 minutes in seconds
    syncInterval: 60000, // 1 minute
  },
});

// ---- Globals ----
let mainWindow = null;
let tray = null;
let consentWindow = null;
let activityTracker = null;
let appTracker = null;
let screenshotService = null;
let apiService = null;
let wsService = null;
let isTracking = false;

// ---- App Lifecycle ----

app.whenReady().then(async () => {
  log.info('🚀 Productivity Agent starting...');

  // Initialize API service
  apiService = new ApiService(store.get('serverUrl'), store.get('authToken'));

  // Check consent
  if (!store.get('consentGiven')) {
    showConsentWindow();
  } else if (store.get('authToken')) {
    startTracking();
  } else {
    showLoginWindow();
  }

  createTray();
});

app.on('window-all-closed', (e) => {
  e.preventDefault(); // Keep running in tray
});

// ---- Consent Window ----

function showConsentWindow() {
  consentWindow = new BrowserWindow({
    width: 700,
    height: 800,
    resizable: false,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  consentWindow.loadFile(path.join(__dirname, 'src/ui/consent.html'));
  consentWindow.setMenuBarVisibility(false);
}

// ---- Login Window ----

function showLoginWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 550,
    resizable: false,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src/ui/login.html'));
  mainWindow.setMenuBarVisibility(false);
}

// ---- System Tray ----

function createTray() {
  // Create a visible tracking indicator (privacy compliance)
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  tray = new Tray(nativeImage.createEmpty());

  updateTrayMenu();
  tray.setToolTip('Productivity Agent - Monitoring Active');

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Status: ${isTracking ? '🟢 Tracking Active' : '🔴 Tracking Paused'}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isTracking ? 'Pause Tracking' : 'Resume Tracking',
      click: () => toggleTracking(),
    },
    {
      label: 'View My Data',
      click: () => {
        const { shell } = require('electron');
        shell.openExternal(`${store.get('serverUrl').replace(':8000', ':3000')}/my-data`);
      },
    },
    { type: 'separator' },
    {
      label: 'Privacy Policy',
      click: () => showPrivacyPolicy(),
    },
    {
      label: 'Revoke Consent',
      click: () => revokeConsent(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        stopTracking();
        app.quit();
      },
    },
  ]);

  if (tray) tray.setContextMenu(contextMenu);
}

// ---- Tracking Control ----

async function startTracking() {
  if (isTracking) return;

  log.info('▶ Starting activity tracking...');

  // Initialize trackers
  activityTracker = new ActivityTracker(store.get('idleTimeout'));
  appTracker = new AppTracker();
  screenshotService = new ScreenshotService(apiService, store);

  // Initialize WebSocket
  wsService = new WebSocketService(store.get('wsUrl'), store.get('authToken'));
  wsService.connect();

  // Start all trackers
  activityTracker.start();
  appTracker.start();
  screenshotService.startSchedule(store.get('screenshotInterval'));

  // Start sync loop
  startSyncLoop();

  isTracking = true;
  updateTrayMenu();
  log.info('✅ All trackers active');
}

function stopTracking() {
  if (!isTracking) return;

  log.info('⏹ Stopping tracking...');

  if (activityTracker) activityTracker.stop();
  if (appTracker) appTracker.stop();
  if (screenshotService) screenshotService.stopSchedule();
  if (wsService) wsService.disconnect();

  isTracking = false;
  updateTrayMenu();
}

function toggleTracking() {
  if (isTracking) {
    stopTracking();
  } else {
    startTracking();
  }
}

// ---- Data Sync ----

let syncInterval = null;

function startSyncLoop() {
  syncInterval = setInterval(async () => {
    try {
      const activities = activityTracker.flush();
      const appUsages = appTracker.flush();

      if (activities.length > 0 || appUsages.length > 0) {
        await apiService.submitBatch({
          employee_id: store.get('employeeId'),
          activities,
          app_usages: appUsages,
          website_visits: [],
          agent_version: app.getVersion(),
          machine_name: require('os').hostname(),
          os_info: `${process.platform} ${require('os').release()}`,
        });
        log.info(`Synced: ${activities.length} activities, ${appUsages.length} app events`);
      }

      // Send heartbeat
      await apiService.heartbeat({
        employee_id: store.get('employeeId'),
        status: activityTracker.getCurrentStatus(),
        current_app: appTracker.getCurrentApp(),
        current_window: appTracker.getCurrentWindow(),
      });

      // Also emit via WebSocket for real-time
      if (wsService && wsService.isConnected()) {
        wsService.emitActivity({
          employee_id: store.get('employeeId'),
          status: activityTracker.getCurrentStatus(),
          current_app: appTracker.getCurrentApp(),
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      log.error('Sync error:', err.message);
    }
  }, store.get('syncInterval'));
}

// ---- Privacy Controls ----

function showPrivacyPolicy() {
  const win = new BrowserWindow({ width: 600, height: 700 });
  win.loadFile(path.join(__dirname, 'src/ui/privacy-policy.html'));
}

async function revokeConsent() {
  const result = await dialog.showMessageBox({
    type: 'warning',
    title: 'Revoke Consent',
    message: 'Are you sure you want to revoke your monitoring consent?',
    detail: 'This will stop all tracking and notify your administrator.',
    buttons: ['Cancel', 'Revoke Consent'],
    defaultId: 0,
  });

  if (result.response === 1) {
    stopTracking();
    store.set('consentGiven', false);
    try {
      await apiService.revokeConsent(store.get('employeeId'));
    } catch (e) {
      log.error('Failed to notify server of consent revocation');
    }
    log.info('Consent revoked by employee');
    showConsentWindow();
  }
}

// ---- IPC Handlers ----

ipcMain.handle('consent-accept', async (event, data) => {
  store.set('consentGiven', true);
  log.info('Employee consent accepted');

  if (consentWindow) {
    consentWindow.close();
    consentWindow = null;
  }

  if (store.get('authToken')) {
    startTracking();
  } else {
    showLoginWindow();
  }
  return { success: true };
});

ipcMain.handle('consent-decline', async () => {
  log.info('Employee declined consent');
  dialog.showMessageBox({
    type: 'info',
    title: 'Consent Required',
    message: 'Monitoring consent is required to use this application. The app will close.',
  });
  app.quit();
});

ipcMain.handle('login', async (event, { email, password }) => {
  try {
    const result = await apiService.login(email, password);
    store.set('authToken', result.access_token);
    store.set('employeeId', result.employee_id);
    apiService.setToken(result.access_token);

    if (mainWindow) {
      mainWindow.close();
      mainWindow = null;
    }

    startTracking();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-status', () => ({
  isTracking,
  employeeId: store.get('employeeId'),
  consentGiven: store.get('consentGiven'),
}));
