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
        marginBottom: '24px', padding: '8px 0',
      }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="orbital-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6e8eff" />
                <stop offset="50%" stopColor="#9b6dff" />
                <stop offset="100%" stopColor="#38d9f5" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(80, 120, 255, 0.06)" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="url(#orbital-gradient)" strokeWidth="2.5"
              strokeDasharray={`${percentage * 0.942} 100`}
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(110, 142, 255, 0.25))',
              }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.5px',
            textShadow: '0 0 20px rgba(110, 142, 255, 0.15)',
          }}>
            {percentage}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{count}</span>
            <span style={{ color: 'var(--text-muted)' }}> active</span>
            <span style={{ color: 'var(--text-ghost)', margin: '0 6px' }}>·</span>
            <span style={{ color: 'var(--text-muted)' }}>{total - count}</span>
            <span style={{ color: 'var(--text-muted)' }}> offline</span>
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {employees.map((emp, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: '12px',
              background: 'rgba(80, 120, 255, 0.02)',
              border: '1px solid transparent',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(80, 120, 255, 0.04)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(80, 120, 255, 0.02)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`online-dot ${emp.status}`} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>{emp.dept}</div>
              </div>
            </div>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              padding: '3px 10px',
              background: 'rgba(80, 120, 255, 0.04)',
              borderRadius: '6px',
              border: '1px solid rgba(80, 120, 255, 0.1)',
            }}>{emp.app}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
