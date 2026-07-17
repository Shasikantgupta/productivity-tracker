'use client';

export default function AlertsBanner({ count }) {
  if (!count || count === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>🚨</span>
        <div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {count} unacknowledged security alert{count > 1 ? 's' : ''}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>
            require attention
          </span>
        </div>
      </div>
      <a
        href="/alerts"
        className="btn btn-outline"
        style={{ fontSize: '13px', padding: '6px 14px', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
      >
        View Alerts →
      </a>
    </div>
  );
}
