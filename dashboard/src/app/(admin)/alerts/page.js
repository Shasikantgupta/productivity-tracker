'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';

export default function AlertsPage() {
  const [alerts] = useState([
    {
      id: '1', type: 'blocked_website', severity: 'medium',
      title: 'Blocked website access attempt',
      description: 'Employee EMP003 attempted to access gambling.com',
      employee: 'Priya Sharma', triggered_at: '2025-01-19T14:32:00Z',
      acknowledged: false,
    },
    {
      id: '2', type: 'unusual_hours', severity: 'low',
      title: 'Activity outside work hours',
      description: 'Employee EMP001 active at 11:45 PM',
      employee: 'Sarah Chen', triggered_at: '2025-01-19T23:45:00Z',
      acknowledged: false,
    },
    {
      id: '3', type: 'data_exfiltration', severity: 'high',
      title: 'Large file upload detected',
      description: 'EMP005 uploaded 2.3GB to external cloud storage',
      employee: 'Anna Park', triggered_at: '2025-01-19T10:15:00Z',
      acknowledged: false,
    },
    {
      id: '4', type: 'idle_anomaly', severity: 'low',
      title: 'Extended idle period',
      description: 'Employee EMP004 idle for 3.5 hours during work schedule',
      employee: 'James Wilson', triggered_at: '2025-01-18T15:00:00Z',
      acknowledged: true,
    },
  ]);

  const severityStyles = {
    low: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', icon: 'ℹ️' },
    medium: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', icon: '⚠️' },
    high: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', color: '#f87171', icon: '🚨' },
    critical: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '🔴' },
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="alerts" />
      <div className="main-content">
        <Header title="Security Alerts" subtitle="Monitor and respond to anomalies" />

        {/* Summary stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total Alerts', value: alerts.length, color: '#6366f1' },
            { label: 'Unacknowledged', value: alerts.filter(a => !a.acknowledged).length, color: '#ef4444' },
            { label: 'High Severity', value: alerts.filter(a => a.severity === 'high').length, color: '#f59e0b' },
            { label: 'Resolved Today', value: 2, color: '#10b981' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value" style={{ color: s.color, fontSize: '24px' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alert list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((alert) => {
            const style = severityStyles[alert.severity];
            return (
              <div
                key={alert.id}
                className="card"
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: alert.acknowledged ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '24px' }}>{style.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {alert.description}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>👤 {alert.employee}</span>
                      <span>🕐 {new Date(alert.triggered_at).toLocaleString()}</span>
                      <span className={`badge badge-${alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!alert.acknowledged && (
                    <>
                      <button className="btn btn-outline" style={{ fontSize: '12px', padding: '8px 14px' }}>
                        Investigate
                      </button>
                      <button className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}>
                        Acknowledge
                      </button>
                    </>
                  )}
                  {alert.acknowledged && (
                    <span className="badge badge-success">✓ Acknowledged</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
