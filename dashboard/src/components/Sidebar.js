'use client';

export default function Sidebar({ activePage = 'dashboard' }) {
  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '◉', href: '/' },
        { id: 'live', label: 'Live Monitor', icon: '◎', href: '/live' },
      ],
    },
    {
      title: 'Monitoring',
      items: [
        { id: 'employees', label: 'Employees', icon: '⬡', href: '/employees' },
        { id: 'attendance', label: 'Attendance', icon: '▣', href: '/attendance' },
        { id: 'screenshots', label: 'Screenshots', icon: '⊞', href: '/screenshots' },
        { id: 'apps', label: 'App Usage', icon: '⬢', href: '/apps' },
        { id: 'websites', label: 'Websites', icon: '◇', href: '/websites' },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { id: 'reports', label: 'Reports', icon: '△', href: '/reports' },
        { id: 'insights', label: 'AI Insights', icon: '◈', href: '/insights' },
      ],
    },
    {
      title: 'Admin',
      items: [
        { id: 'settings', label: 'Settings', icon: '⊙', href: '/settings' },
        { id: 'alerts', label: 'Alerts', icon: '⊘', href: '/alerts' },
        { id: 'privacy', label: 'Privacy', icon: '⊕', href: '/privacy' },
      ],
    },
  ];
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">P</div>
        <h1>ProTracker</h1>
      </div>

      <nav>
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            <ul className="sidebar-nav">
              {section.items.map((item) => (
                <li key={item.id} className="nav-item">
                  <a
                    href={item.href}
                    className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                  >
                    <span style={{ fontSize: '14px', opacity: 0.6 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
          Sign Out
        </button>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="online-dot active" />
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>System Active</span>
          </div>
          <span style={{ letterSpacing: '0.5px' }}>v1.0 · Enterprise</span>
        </div>
      </div>
    </aside>
  );
}
