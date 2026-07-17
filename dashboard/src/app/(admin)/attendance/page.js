'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';

export default function AttendancePage() {
  const [selectedMonth] = useState('January 2025');

  const records = [
    { date: '2025-01-19', day: 'Sun', status: 'holiday', clockIn: '-', clockOut: '-', hours: '-', type: '-' },
    { date: '2025-01-18', day: 'Sat', status: 'holiday', clockIn: '-', clockOut: '-', hours: '-', type: '-' },
    { date: '2025-01-17', day: 'Fri', status: 'present', clockIn: '09:02', clockOut: '18:15', hours: '8.7', type: 'Office' },
    { date: '2025-01-16', day: 'Thu', status: 'present', clockIn: '08:55', clockOut: '18:30', hours: '9.1', type: 'Office' },
    { date: '2025-01-15', day: 'Wed', status: 'wfh', clockIn: '09:10', clockOut: '17:45', hours: '8.1', type: 'Remote' },
    { date: '2025-01-14', day: 'Tue', status: 'present', clockIn: '09:00', clockOut: '18:00', hours: '8.5', type: 'Office' },
    { date: '2025-01-13', day: 'Mon', status: 'late', clockIn: '10:15', clockOut: '18:45', hours: '8.0', type: 'Office' },
    { date: '2025-01-12', day: 'Sun', status: 'holiday', clockIn: '-', clockOut: '-', hours: '-', type: '-' },
    { date: '2025-01-11', day: 'Sat', status: 'holiday', clockIn: '-', clockOut: '-', hours: '-', type: '-' },
    { date: '2025-01-10', day: 'Fri', status: 'present', clockIn: '08:50', clockOut: '18:20', hours: '8.9', type: 'Office' },
    { date: '2025-01-09', day: 'Thu', status: 'on_leave', clockIn: '-', clockOut: '-', hours: '-', type: 'Sick Leave' },
    { date: '2025-01-08', day: 'Wed', status: 'present', clockIn: '09:05', clockOut: '18:10', hours: '8.6', type: 'Office' },
  ];

  const statusBadge = (status) => {
    const map = {
      present: { cls: 'badge-success', label: '✓ Present' },
      wfh: { cls: 'badge-info', label: '🏠 WFH' },
      late: { cls: 'badge-warning', label: '⚠ Late' },
      on_leave: { cls: 'badge-danger', label: '✗ Leave' },
      holiday: { cls: 'badge-neutral', label: '— Holiday' },
      absent: { cls: 'badge-danger', label: '✗ Absent' },
    };
    const s = map[status] || map.absent;
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const workDays = records.filter(r => !['holiday'].includes(r.status));
  const presentDays = records.filter(r => ['present', 'wfh', 'late'].includes(r.status));
  const totalHours = presentDays.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar activePage="attendance" />
      <div className="main-content">
        <Header title="Attendance" subtitle={selectedMonth} />

        {/* Summary */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[
            { icon: '📅', label: 'Work Days', value: workDays.length, color: '#6366f1' },
            { icon: '✅', label: 'Present', value: presentDays.length, color: '#10b981' },
            { icon: '🏠', label: 'WFH Days', value: records.filter(r => r.status === 'wfh').length, color: '#3b82f6' },
            { icon: '⏱️', label: 'Total Hours', value: totalHours.toFixed(1), color: '#8b5cf6' },
            { icon: '📊', label: 'Attendance %', value: `${Math.round((presentDays.length / Math.max(workDays.length, 1)) * 100)}%`, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: '20px' }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: '24px' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Calendar-style Attendance Grid */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Monthly Overview</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const record = records.find(r => parseInt(r.date.split('-')[2]) === day);
              const status = record?.status || 'absent';
              const colors = {
                present: '#10b981', wfh: '#3b82f6', late: '#f59e0b',
                on_leave: '#ef4444', holiday: '#1e293b', absent: '#374151',
              };
              return (
                <div
                  key={i}
                  title={`Jan ${day}: ${status}`}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: colors[status] || colors.absent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 600,
                    color: status === 'holiday' ? '#475569' : 'white',
                    cursor: 'pointer', transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.15)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
            {[
              { color: '#10b981', label: 'Present' },
              { color: '#3b82f6', label: 'WFH' },
              { color: '#f59e0b', label: 'Late' },
              { color: '#ef4444', label: 'Leave' },
              { color: '#1e293b', label: 'Holiday' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.date}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.day}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.clockIn}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.clockOut}</td>
                  <td style={{ fontWeight: 600, color: parseFloat(r.hours) >= 8.5 ? 'var(--success)' : parseFloat(r.hours) > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {r.hours !== '-' ? `${r.hours}h` : '-'}
                  </td>
                  <td>
                    <span className={`badge ${r.type === 'Remote' ? 'badge-info' : r.type === 'Office' ? 'badge-neutral' : 'badge-warning'}`}>
                      {r.type}
                    </span>
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
