'use client';

export default function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div>
        <h2 className="header-title">{title}</h2>
        {subtitle && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</span>
        )}
      </div>
      <div className="header-actions">
        <button className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 14px' }}>
          📥 Export
        </button>
        <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}>
          ⚡ Generate Report
        </button>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', cursor: 'pointer',
        }}>
          👤
        </div>
      </div>
    </header>
  );
}
