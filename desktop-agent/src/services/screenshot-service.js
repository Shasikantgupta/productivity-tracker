/**
 * Screenshot Service
 * Captures and uploads encrypted screenshots at intervals
 */
const screenshot = require('screenshot-desktop');
const FormData = require('form-data');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const os = require('os');

class ScreenshotService {
  constructor(apiService, store) {
    this.apiService = apiService;
    this.store = store;
    this.interval = null;
    this.tempDir = path.join(os.tmpdir(), 'prod-agent-screenshots');
    if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir, { recursive: true });
  }

  startSchedule(intervalMs = 300000) {
    log.info(`Screenshot schedule started (every ${intervalMs / 1000}s)`);
    this.interval = setInterval(() => this.capture(), intervalMs);
    // Capture initial screenshot
    setTimeout(() => this.capture(), 5000);
  }

  stopSchedule() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async capture() {
    try {
      const imgBuffer = await screenshot({ format: 'png' });
      const fileName = `screenshot_${Date.now()}.png`;
      const filePath = path.join(this.tempDir, fileName);

      fs.writeFileSync(filePath, imgBuffer);
      log.info(`Screenshot captured: ${fileName}`);

      // Get current active app for context
      let activeApp = null;
      let activeWindow = null;
      try {
        const activeWin = await import('active-win');
        const win = await activeWin.default();
        if (win) {
          activeApp = win.owner?.name;
          activeWindow = win.title;
        }
      } catch (e) {}

      // Upload to server
      await this.upload(filePath, activeApp, activeWindow);

      // Clean up temp file
      fs.unlinkSync(filePath);
    } catch (err) {
      log.error('Screenshot capture error:', err.message);
    }
  }

  async upload(filePath, activeApp, activeWindow) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('employee_id', this.store.get('employeeId'));
      formData.append('capture_type', 'scheduled');
      if (activeApp) formData.append('active_app', activeApp);
      if (activeWindow) formData.append('active_window_title', activeWindow);

      await this.apiService.uploadScreenshot(formData);
      log.info('Screenshot uploaded successfully');
    } catch (err) {
      log.error('Screenshot upload error:', err.message);
    }
  }
}

module.exports = { ScreenshotService };
