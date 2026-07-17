'use client';

export default function EmployeeSidebar({ activePage = 'dashboard' }) {
  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'My Dashboard', icon: '📊', href: '/employee' },
      ],
    },
    {
      title: 'My Data',
      items: [
        { id: 'attendance', label: 'My Attendance', icon: '📅', href: '/employee/attendance' },
        { id: 'reports', label: 'My Reports', icon: '📈', href: '/employee/reports' },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'settings', label: 'Settings', icon: '⚙️', href: '/employee/settings' },
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
        <div className="logo-icon">📊</div>
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
                    <span>{item.icon}</span>
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
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', fontSize: '13px', padding: '8px' }}>
          Logout
        </button>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="online-dot active" />
            <span style={{ color: 'var(--text-secondary)' }}>System Online</span>
          </div>
          <span>v1.0.0 · Employee Portal</span>
        </div>
      </div>
    </aside>
  );
}
