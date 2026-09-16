'use client';

export default function AlertsBanner({ count }) {
  if (!count || count === 0) return null;

  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.04)',
      border: '1px solid rgba(239, 68, 68, 0.12)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 22px',
      marginBottom: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backdropFilter: 'blur(20px)',
      animation: 'card-float-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      opacity: 0,
      transform: 'translateY(16px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#ef4444',
          boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
          animation: 'dot-pulse 2s infinite',
        }} />
        <div>
          <span style={{
            fontWeight: 600, fontSize: '13px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            {count} unacknowledged alert{count > 1 ? 's' : ''}
          </span>
          <span style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            marginLeft: '8px',
          }}>
            require attention
          </span>
        </div>
      </div>
      <a
        href="/alerts"
        className="btn btn-outline"
        style={{
          fontSize: '12px', padding: '6px 14px',
          color: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 0.15)',
        }}
      >
        View →
      </a>
    </div>
  );
}
