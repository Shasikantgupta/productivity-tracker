/**
 * Browser Extension - Background Service Worker
 * Tracks website visits and syncs with backend API
 */

// ---- Configuration ----
const CONFIG = {
  API_URL: 'http://localhost:8000/api/v1',
  SYNC_INTERVAL_MS: 60000,  // 1 minute
  MAX_BUFFER_SIZE: 100,
};

let authToken = null;
let employeeId = null;
let isTracking = false;
let visitBuffer = [];
let currentTab = { url: '', domain: '', title: '', startTime: null, tabId: null };

// ---- Initialize ----
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['authToken', 'employeeId', 'isTracking', 'apiUrl'], (data) => {
    authToken = data.authToken || null;
    employeeId = data.employeeId || null;
    isTracking = data.isTracking !== false;
    if (data.apiUrl) CONFIG.API_URL = data.apiUrl;
  });

  // Set up periodic sync
  chrome.alarms.create('syncVisits', { periodInMinutes: 1 });
});

// ---- Tab Tracking ----

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isTracking || !authToken) return;

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabChange(tab);
  } catch (e) {
    // Tab may have closed
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isTracking || !authToken) return;
  if (changeInfo.status === 'complete' && tab.active) {
    handleTabChange(tab);
  }
});

function handleTabChange(tab) {
  // End previous visit
  if (currentTab.url && currentTab.startTime) {
    const visit = {
      url: currentTab.url,
      domain: currentTab.domain,
      page_title: currentTab.title,
      visited_at: currentTab.startTime,
      left_at: new Date().toISOString(),
      is_active_tab: true,
      browser_name: 'Chrome',
      tab_id: currentTab.tabId,
    };
    visitBuffer.push(visit);

    // Auto-flush if buffer is large
    if (visitBuffer.length >= CONFIG.MAX_BUFFER_SIZE) {
      syncVisits();
    }
  }

  // Start tracking new tab
  if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
    try {
      const url = new URL(tab.url);
      currentTab = {
        url: tab.url,
        domain: url.hostname,
        title: tab.title || '',
        startTime: new Date().toISOString(),
        tabId: tab.id,
      };
    } catch (e) {
      currentTab = { url: '', domain: '', title: '', startTime: null, tabId: null };
    }
  } else {
    currentTab = { url: '', domain: '', title: '', startTime: null, tabId: null };
  }
}

// ---- Sync with Backend ----

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncVisits') {
    syncVisits();
  }
});

async function syncVisits() {
  if (!authToken || !employeeId || visitBuffer.length === 0) return;

  const visits = [...visitBuffer];
  visitBuffer = [];

  try {
    const response = await fetch(`${CONFIG.API_URL}/tracking/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        employee_id: employeeId,
        activities: [],
        app_usages: [],
        website_visits: visits,
      }),
    });

    if (!response.ok) {
      // Put visits back in buffer on failure
      visitBuffer = [...visits, ...visitBuffer];
      console.error('Sync failed:', response.status);
    } else {
      console.log(`Synced ${visits.length} website visits`);
    }
  } catch (err) {
    visitBuffer = [...visits, ...visitBuffer];
    console.error('Sync error:', err);
  }
}

// ---- Message Handler (from popup) ----

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({
      isTracking,
      visitCount: visitBuffer.length,
      currentDomain: currentTab.domain,
      isAuthenticated: !!authToken,
    });
  }

  if (message.type === 'SET_TRACKING') {
    isTracking = message.enabled;
    chrome.storage.sync.set({ isTracking });
    sendResponse({ isTracking });
  }

  if (message.type === 'SET_AUTH') {
    authToken = message.token;
    employeeId = message.employeeId;
    chrome.storage.sync.set({
      authToken: message.token,
      employeeId: message.employeeId,
    });
    sendResponse({ success: true });
  }

  return true; // Keep channel open for async
});
