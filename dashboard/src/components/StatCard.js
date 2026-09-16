'use client';

export default function StatCard({ icon, label, value, change, changeType, color }) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border)',
          fontSize: '18px',
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
