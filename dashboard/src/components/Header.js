'use client';

export default function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div>
        <h2 className="header-title">{title}</h2>
        {subtitle && (
          <span style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            letterSpacing: '0.5px',
            fontWeight: 400,
          }}>{subtitle}</span>
        )}
      </div>
      <div className="header-actions">
        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '7px 14px' }}>
          ↓ Export
        </button>
        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}>
          ⚡ Generate Report
        </button>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', cursor: 'pointer',
          transition: 'all 0.3s',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          👤
        </div>
      </div>
    </header>
  );
}
