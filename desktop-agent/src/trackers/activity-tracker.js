/**
 * Activity Tracker
 * Monitors keyboard/mouse activity to detect active vs idle states
 */
const { powerMonitor } = require('electron');
const log = require('electron-log');

class ActivityTracker {
  constructor(idleTimeoutSeconds = 300) {
    this.idleTimeout = idleTimeoutSeconds;
    this.currentStatus = 'active';
    this.activities = [];
    this.currentSession = null;
    this.pollInterval = null;
    this.keyboardEvents = 0;
    this.mouseEvents = 0;
  }

  start() {
    log.info('Activity tracker started');

    // Start new active session
    this._startSession('active');

    // Poll system idle time every 10 seconds
    this.pollInterval = setInterval(() => {
      const idleSeconds = powerMonitor.getSystemIdleTime();

      if (idleSeconds >= this.idleTimeout && this.currentStatus !== 'idle') {
        this._endCurrentSession();
        this._startSession('idle');
        this.currentStatus = 'idle';
        log.info(`Status changed: IDLE (idle for ${idleSeconds}s)`);
      } else if (idleSeconds < this.idleTimeout && this.currentStatus === 'idle') {
        this._endCurrentSession();
        this._startSession('active');
        this.currentStatus = 'active';
        log.info('Status changed: ACTIVE');
      }
    }, 10000);

    // Listen for system events
    powerMonitor.on('lock-screen', () => {
      this._endCurrentSession();
      this._startSession('away');
      this.currentStatus = 'away';
    });

    powerMonitor.on('unlock-screen', () => {
      this._endCurrentSession();
      this._startSession('active');
      this.currentStatus = 'active';
    });

    powerMonitor.on('suspend', () => {
      this._endCurrentSession();
      this.currentStatus = 'away';
    });

    powerMonitor.on('resume', () => {
      this._startSession('active');
      this.currentStatus = 'active';
    });
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this._endCurrentSession();
  }

  getCurrentStatus() {
    return this.currentStatus;
  }

  flush() {
    const flushed = [...this.activities];
    this.activities = [];
    return flushed;
  }

  _startSession(status) {
    this.currentSession = {
      status,
      started_at: new Date().toISOString(),
      ended_at: null,
      keyboard_events: 0,
      mouse_events: 0,
      mouse_distance_px: 0,
      machine_name: require('os').hostname(),
    };
  }

  _endCurrentSession() {
    if (this.currentSession) {
      this.currentSession.ended_at = new Date().toISOString();
      this.activities.push({ ...this.currentSession });
      this.currentSession = null;
    }
  }
}

module.exports = { ActivityTracker };
