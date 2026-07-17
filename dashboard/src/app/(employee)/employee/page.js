'use client';

import { useState, useEffect } from 'react';
import EmployeeSidebar from '../../../components/EmployeeSidebar';
import Header from '../../../components/Header';
import StatCard from '../../../components/StatCard';
import ProductivityChart from '../../../components/ProductivityChart';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardStats() {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const res = await fetch(`${API}/api/v1/reports/my-dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Demo data fallback for UI development
  const displayStats = stats || {
    avg_productivity: 82.4,
    total_active_hours: 6.5,
    total_idle_hours: 1.2,
    attendance_status: 'Present',
    productivity_trend: [
      { date: '2025-01-13', score: 78.3 },
      { date: '2025-01-14', score: 81.8 },
      { date: '2025-01-15', score: 79.2 },
      { date: '2025-01-16', score: 85.5 },
      { date: '2025-01-17', score: 88.1 },
      { date: '2025-01-18', score: 82.4 },
      { date: '2025-01-19', score: 84.9 },
    ],
  };

  if (loading && !stats) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading your dashboard...</div>;

  return (
    <div className="app-layout">
      <EmployeeSidebar activePage="dashboard" />

      <div className="main-content">
        <Header title="My Dashboard" subtitle="Your personal productivity overview" />
        
        {error && <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        <div className="stats-grid">
          <StatCard
            icon="📊"
            label="Daily Productivity"
            value={`${displayStats.avg_productivity}%`}
            change="+2.4%"
            changeType="positive"
            color="#8b5cf6"
          />
          <StatCard
            icon="⏱️"
            label="Active Hours"
            value={displayStats.total_active_hours}
            color="#3b82f6"
          />
          <StatCard
            icon="☕"
            label="Idle Hours"
            value={displayStats.total_idle_hours}
            color="#6366f1"
          />
          <StatCard
            icon="📅"
            label="Attendance Status"
            value={displayStats.attendance_status}
            color="#10b981"
          />
        </div>

        <div className="grid-1" style={{ marginTop: '24px' }}>
          <ProductivityChart data={displayStats.productivity_trend} />
        </div>
        
      </div>
    </div>
  );
}
