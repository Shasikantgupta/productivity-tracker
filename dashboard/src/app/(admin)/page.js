'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import ProductivityChart from '../../components/ProductivityChart';
import TopAppsTable from '../../components/TopAppsTable';
import OnlineEmployees from '../../components/OnlineEmployees';
import AlertsBanner from '../../components/AlertsBanner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardStats() {
    try {
      const token = localStorage.getItem('auth_token');
      const role = localStorage.getItem('user_role');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      if (role === 'employee') {
        window.location.href = '/employee';
        return;
      }

      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API}/api/v1/reports/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }

  // Demo data fallback
  const demoStats = stats || {
    total_employees: 148,
    online_now: 93,
    avg_productivity: 78.4,
    total_active_hours: 412.5,
    total_idle_hours: 89.2,
    attendance_rate: 94.6,
    alerts_count: 3,
    top_apps: [
      { name: 'VS Code', seconds: 18400 },
      { name: 'Chrome', seconds: 14200 },
      { name: 'Slack', seconds: 8900 },
      { name: 'Figma', seconds: 6700 },
      { name: 'Terminal', seconds: 5400 },
    ],
    top_websites: [
      { domain: 'github.com', seconds: 9200 },
      { domain: 'stackoverflow.com', seconds: 5800 },
      { domain: 'docs.google.com', seconds: 4100 },
      { domain: 'notion.so', seconds: 3400 },
      { domain: 'youtube.com', seconds: 2900 },
    ],
    productivity_trend: [
      { date: '2025-01-13', score: 72.3 },
      { date: '2025-01-14', score: 75.8 },
      { date: '2025-01-15', score: 71.2 },
      { date: '2025-01-16', score: 79.5 },
      { date: '2025-01-17', score: 82.1 },
      { date: '2025-01-18', score: 78.4 },
      { date: '2025-01-19', score: 76.9 },
    ],
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="dashboard" />

      <div className="main-content">
        <Header title="Dashboard" subtitle="Real-time productivity overview" />

        <AlertsBanner count={demoStats.alerts_count} />

        <div className="stats-grid">
          <StatCard
            icon="👥"
            label="Total Employees"
            value={demoStats.total_employees}
            color="#6366f1"
          />
          <StatCard
            icon="🟢"
            label="Online Now"
            value={demoStats.online_now}
            change="+12"
            changeType="positive"
            color="#10b981"
          />
          <StatCard
            icon="📊"
            label="Avg Productivity"
            value={`${demoStats.avg_productivity}%`}
            change="+3.2%"
            changeType="positive"
            color="#8b5cf6"
          />
          <StatCard
            icon="⏱️"
            label="Active Hours"
            value={demoStats.total_active_hours}
            color="#3b82f6"
          />
          <StatCard
            icon="📅"
            label="Attendance Rate"
            value={`${demoStats.attendance_rate}%`}
            color="#f59e0b"
          />
          <StatCard
            icon="🚨"
            label="Active Alerts"
            value={demoStats.alerts_count}
            color="#ef4444"
          />
        </div>

        <div className="grid-2">
          <ProductivityChart data={demoStats.productivity_trend} />
          <OnlineEmployees count={demoStats.online_now} total={demoStats.total_employees} />
        </div>

        <div className="grid-2" style={{ marginTop: '24px' }}>
          <TopAppsTable
            title="Top Applications"
            items={demoStats.top_apps.map((a) => ({ name: a.name, minutes: Math.round(a.seconds / 60) }))}
            type="app"
          />
          <TopAppsTable
            title="Top Websites"
            items={demoStats.top_websites.map((w) => ({ name: w.domain, minutes: Math.round(w.seconds / 60) }))}
            type="web"
          />
        </div>
      </div>
    </div>
  );
}
