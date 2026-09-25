'use client';

export default function StatCard({ icon, label, value, change, changeType, color }) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{
          background: 'rgba(80, 120, 255, 0.06)',
          border: '1px solid rgba(80, 120, 255, 0.1)',
          fontSize: '18px',
          boxShadow: '0 0 12px rgba(80, 120, 255, 0.04)',
        }}
      >
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <span className={`stat-change ${changeType}`}>
          {changeType === 'positive' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
  );
}
