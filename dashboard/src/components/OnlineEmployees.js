'use client';

export default function OnlineEmployees({ count, total }) {
  const percentage = Math.round((count / total) * 100);

  // Demo employees
  const employees = [
    { name: 'Sarah Chen', dept: 'Engineering', status: 'active', app: 'VS Code' },
    { name: 'Mike Johnson', dept: 'Design', status: 'active', app: 'Figma' },
    { name: 'Priya Sharma', dept: 'Engineering', status: 'idle', app: 'Chrome' },
    { name: 'James Wilson', dept: 'Marketing', status: 'active', app: 'Excel' },
    { name: 'Anna Park', dept: 'Engineering', status: 'active', app: 'Terminal' },
    { name: 'David Lee', dept: 'Product', status: 'idle', app: 'Slack' },
  ];

  return (
    <div className="card">
      <div className="chart-header">
        <h3 className="chart-title">Online Employees</h3>
        <span className="badge badge-success">{count} / {total}</span>
      </div>

      {/* Donut visual */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '24px',
        marginBottom: '20px', padding: '8px 0',
      }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="url(#gradient)" strokeWidth="3"
              strokeDasharray={`${percentage * 0.942} 100`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)',
          }}>
            {percentage}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{count}</span> active ·{' '}
            <span style={{ color: 'var(--text-muted)' }}>{total - count}</span> offline
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {employees.map((emp, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.04)',
              transition: 'background 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`online-dot ${emp.status}`} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{emp.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.dept}</div>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{emp.app}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
