/**
 * API Service
 * HTTP client for backend communication
 */
const axios = require('axios');
const log = require('electron-log');

class ApiService {
  constructor(baseUrl, token = null) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    if (token) this.setToken(token);
  }

  setToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async login(email, password) {
    const { data } = await this.client.post('/api/v1/auth/login', { email, password });
    return data;
  }

  async submitBatch(batchData) {
    const { data } = await this.client.post('/api/v1/tracking/batch', batchData);
    return data;
  }

  async heartbeat(heartbeatData) {
    const { data } = await this.client.post('/api/v1/tracking/heartbeat', heartbeatData);
    return data;
  }

  async uploadScreenshot(formData) {
    const { data } = await this.client.post('/api/v1/screenshots/upload', formData, {
      headers: { ...formData.getHeaders() },
      maxContentLength: 10 * 1024 * 1024,
    });
    return data;
  }

  async getActivePolicy() {
    const { data } = await this.client.get('/api/v1/admin/policies/active');
    return data;
  }

  async submitConsent(employeeId, policyId, consented) {
    const { data } = await this.client.post('/api/v1/admin/consent', {
      employee_id: employeeId,
      policy_id: policyId,
      consented,
      consent_method: 'desktop_agent',
    });
    return data;
  }

  async revokeConsent(employeeId) {
    // Get active policy and submit revocation
    const policy = await this.getActivePolicy();
    if (policy.id) {
      return this.submitConsent(employeeId, policy.id, false);
    }
  }
}

module.exports = { ApiService };
