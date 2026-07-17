'use client';

export default function StatCard({ icon, label, value, change, changeType, color }) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{ background: `${color}15`, fontSize: '22px' }}
      >
        {icon}
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <span className={`stat-change ${changeType}`}>
          {changeType === 'positive' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
  );
}
