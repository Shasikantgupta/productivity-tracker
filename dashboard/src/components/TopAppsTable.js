'use client';

export default function TopAppsTable({ title, items, type }) {
  const maxMinutes = Math.max(...items.map((i) => i.minutes), 1);

  const categorize = (name) => {
    const productive = ['VS Code', 'Terminal', 'Figma', 'Excel', 'Slack', 'Teams',
      'github.com', 'stackoverflow.com', 'docs.google.com', 'notion.so'];
    const unproductive = ['youtube.com', 'reddit.com', 'netflix.com', 'twitter.com'];
    const lower = name.toLowerCase();
    if (productive.some((p) => lower.includes(p.toLowerCase()))) return 'productive';
    if (unproductive.some((u) => lower.includes(u.toLowerCase()))) return 'unproductive';
    return 'neutral';
  };

  const barColor = (cat) => {
    if (cat === 'productive') return 'rgba(255, 255, 255, 0.7)';
    if (cat === 'unproductive') return 'rgba(239, 68, 68, 0.5)';
    return 'rgba(255, 255, 255, 0.25)';
  };

  return (
    <div className="card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>Today</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.map((item, idx) => {
          const cat = categorize(item.name);
          const pct = (item.minutes / maxMinutes) * 100;

          return (
            <div key={idx} style={{
              transition: 'opacity 0.2s',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    width: '18px',
                    textAlign: 'right',
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}>{item.name}</span>
                  <span className={`badge badge-${cat === 'productive' ? 'success' : cat === 'unproductive' ? 'danger' : 'neutral'}`}>
                    {cat}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.02em',
                }}>
                  {item.minutes >= 60
                    ? `${Math.floor(item.minutes / 60)}h ${item.minutes % 60}m`
                    : `${item.minutes}m`}
                </span>
              </div>
              <div style={{
                height: '3px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: barColor(cat),
                  borderRadius: '2px',
                  transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
