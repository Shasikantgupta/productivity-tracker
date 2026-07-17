'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('weekly');
  const [dateFrom, setDateFrom] = useState('2025-01-13');
  const [dateTo, setDateTo] = useState('2025-01-19');

  const reports = [
    { id: '1', title: 'Weekly Team Report - Jan 13-19', type: 'weekly', date: '2025-01-19', score: 78.4, employees: 148 },
    { id: '2', title: 'Engineering Dept Monthly - Dec 2024', type: 'monthly', date: '2025-01-01', score: 82.1, employees: 64 },
    { id: '3', title: 'Weekly Team Report - Jan 6-12', type: 'weekly', date: '2025-01-12', score: 75.9, employees: 145 },
    { id: '4', title: 'Design Team Sprint Review', type: 'custom', date: '2025-01-10', score: 81.3, employees: 12 },
    { id: '5', title: 'Q4 2024 Company Overview', type: 'monthly', date: '2024-12-31', score: 79.7, employees: 148 },
  ];

  return (
    <div className="app-layout">
      <Sidebar activePage="reports" />
      <div className="main-content">
        <Header title="Reports" subtitle="Generate and view productivity reports" />

        {/* Report Generator */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            📊 Generate New Report
          </h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1px solid var(--border)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                  minWidth: '160px',
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                From
              </label>
              <input
                type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1px solid var(--border)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                To
              </label>
              <input
                type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1px solid var(--border)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                }}
              />
            </div>
            <button className="btn btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}>
              ⚡ Generate Report
            </button>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="card" style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                AI Weekly Insights
              </h3>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>↑ Positive:</span> Team productivity improved 3.2% over last week.
                  VS Code usage increased by 12%, suggesting stronger development focus.
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'var(--warning)' }}>⚡ Observation:</span> Idle time peaks between 2-3 PM across Engineering.
                  Consider adjusting meeting schedules or introducing focus blocks.
                </p>
                <p>
                  <span style={{ color: 'var(--info)' }}>💡 Recommendation:</span> 4 employees show declining productivity patterns.
                  Consider 1-on-1 check-ins to identify blockers or burnout risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Past Reports Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Past Reports</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Type</th>
                <th>Date</th>
                <th>Avg Score</th>
                <th>Employees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>
                    <span className={`badge ${r.type === 'weekly' ? 'badge-info' : r.type === 'monthly' ? 'badge-success' : 'badge-neutral'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.date}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: r.score >= 80 ? 'var(--success)' : r.score >= 70 ? 'var(--warning)' : 'var(--danger)',
                    }}>
                      {r.score}%
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.employees}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        View
                      </button>
                      <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        📥 PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
