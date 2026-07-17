'use client';

export default function TopAppsTable({ title, items, type }) {
  const maxMinutes = Math.max(...items.map((i) => i.minutes), 1);

  const categoryColors = {
    productive: 'var(--success)',
    unproductive: 'var(--danger)',
    neutral: 'var(--text-muted)',
  };

  const categorize = (name) => {
    const productive = ['VS Code', 'Terminal', 'Figma', 'Excel', 'Slack', 'Teams',
      'github.com', 'stackoverflow.com', 'docs.google.com', 'notion.so'];
    const unproductive = ['youtube.com', 'reddit.com', 'netflix.com', 'twitter.com'];
    const lower = name.toLowerCase();
    if (productive.some((p) => lower.includes(p.toLowerCase()))) return 'productive';
    if (unproductive.some((u) => lower.includes(u.toLowerCase()))) return 'unproductive';
    return 'neutral';
  };

  return (
    <div className="card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Today</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, idx) => {
          const cat = categorize(item.name);
          const pct = (item.minutes / maxMinutes) * 100;

          return (
            <div key={idx}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '6px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>
                    {type === 'app' ? '💻' : '🌐'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</span>
                  <span className={`badge badge-${cat === 'productive' ? 'success' : cat === 'unproductive' ? 'danger' : 'neutral'}`}>
                    {cat}
                  </span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {item.minutes >= 60
                    ? `${Math.floor(item.minutes / 60)}h ${item.minutes % 60}m`
                    : `${item.minutes}m`}
                </span>
              </div>
              <div style={{
                height: '6px', background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '3px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: categoryColors[cat] || 'var(--accent-primary)',
                  borderRadius: '3px',
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
