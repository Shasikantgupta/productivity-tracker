/**
 * WebSocket Service
 * Socket.IO client for real-time communication with backend
 */
const { io } = require('socket.io-client');
const log = require('electron-log');

class WebSocketService {
  constructor(wsUrl, token) {
    this.wsUrl = wsUrl;
    this.token = token;
    this.socket = null;
    this._connected = false;
  }

  connect() {
    this.socket = io(this.wsUrl, {
      auth: { token: this.token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      this._connected = true;
      log.info('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      this._connected = false;
      log.info(`WebSocket disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      log.error('WebSocket connection error:', err.message);
    });

    // Listen for server commands
    this.socket.on('request_screenshot', () => {
      log.info('Server requested manual screenshot');
      // Trigger immediate screenshot via event
    });

    this.socket.on('config_update', (data) => {
      log.info('Received config update from server:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._connected = false;
    }
  }

  isConnected() {
    return this._connected;
  }

  emitActivity(data) {
    if (this.socket && this._connected) {
      this.socket.emit('agent_activity', data);
    }
  }

  emitStatusChange(data) {
    if (this.socket && this._connected) {
      this.socket.emit('agent_status_change', data);
    }
  }

  emitAlert(data) {
    if (this.socket && this._connected) {
      this.socket.emit('agent_alert', data);
    }
  }
}

module.exports = { WebSocketService };
