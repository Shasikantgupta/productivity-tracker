/**
 * API Client Library
 * Centralized HTTP client for the dashboard
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseUrl = `${API_BASE}/api/v1`;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Token expired - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  getMe() { return this.request('/auth/me'); }

  // Dashboard
  getDashboardStats() { return this.request('/reports/dashboard'); }

  // Employees
  getEmployees(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/employees/?${query}`);
  }

  getEmployee(id) { return this.request(`/employees/${id}`); }

  // Tracking
  getActivities(employeeId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tracking/activities/${employeeId}?${query}`);
  }

  getAppUsage(employeeId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tracking/app-usage/${employeeId}?${query}`);
  }

  getOnlineEmployees() { return this.request('/tracking/online'); }

  // Screenshots
  getScreenshots(employeeId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/screenshots/employee/${employeeId}?${query}`);
  }

  // Reports
  getProductivity(employeeId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/productivity/${employeeId}?${query}`);
  }

  generateReport(data) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Attendance
  getAttendance(employeeId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/attendance/employee/${employeeId}?${query}`);
  }

  // Admin
  getAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/alerts?${query}`);
  }

  acknowledgeAlert(alertId) {
    return this.request(`/admin/alerts/${alertId}/acknowledge`, { method: 'POST' });
  }

  getActivePolicy() { return this.request('/admin/policies/active'); }
  getTrackingConfig() { return this.request('/admin/transparency/tracking-config'); }
}

export const api = new ApiClient();
export default api;
