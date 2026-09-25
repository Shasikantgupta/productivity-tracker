'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      let res;
      try {
        res = await fetch(`${API}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch (networkErr) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on ' + API);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(data.detail || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Fetch user profile to determine role
      try {
        const meRes = await fetch(`${API}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          localStorage.setItem('user_role', meData.role);
          localStorage.setItem('user_name', meData.full_name);
          localStorage.setItem('user_email', meData.email);

          // Route based on actual role from server
          if (meData.role === 'employee') {
            window.location.href = '/employee';
          } else {
            window.location.href = '/';
          }
          return;
        }
      } catch (e) {
        console.error('Failed to fetch user role', e);
      }

      // Fallback: route based on selected role
      localStorage.setItem('user_role', role);
      if (role === 'employee') {
        window.location.href = '/employee';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = role === 'admin';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      fontFamily: "'Inter', 'Space Grotesk', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background orbs */}
      <div style={{
        position: 'fixed', top: '-30%', right: '-15%',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(110, 142, 255, 0.04) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
        animation: 'ambient-drift 25s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'fixed', bottom: '-25%', left: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(155, 109, 255, 0.03) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
        animation: 'ambient-drift 30s ease-in-out infinite alternate-reverse',
      }} />

      <div style={{
        width: '420px',
        background: 'rgba(8, 12, 35, 0.6)',
        border: '1px solid rgba(80, 110, 200, 0.1)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 0 0 1px rgba(100, 140, 255, 0.04) inset, 0 40px 80px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(40px)',
        position: 'relative',
        zIndex: 1,
        animation: 'card-float-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        opacity: 0,
        transform: 'translateY(20px)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #6e8eff, #9b6dff)',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(110, 142, 255, 0.2), 0 0 60px rgba(110, 142, 255, 0.05)',
          }}>P</div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '26px', fontWeight: 700,
            color: '#e8ecf4', letterSpacing: '-0.8px',
            marginBottom: '6px',
          }}>
            ProTracker
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3px' }}>
            {isAdmin ? 'Admin Dashboard' : 'Employee Portal'}
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(80, 120, 255, 0.03)',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '32px',
          border: '1px solid rgba(80, 120, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '11px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Inter', sans-serif",
              background: isAdmin ? 'rgba(110, 142, 255, 0.12)' : 'transparent',
              color: isAdmin ? '#e8ecf4' : 'rgba(160, 175, 220, 0.35)',
              boxShadow: isAdmin ? '0 0 20px rgba(110, 142, 255, 0.06)' : 'none',
            }}
          >
            <span style={{ fontSize: '13px' }}>◉</span>
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('employee')}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '11px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Inter', sans-serif",
              background: !isAdmin ? 'rgba(110, 142, 255, 0.12)' : 'transparent',
              color: !isAdmin ? '#e8ecf4' : 'rgba(160, 175, 220, 0.35)',
              boxShadow: !isAdmin ? '0 0 20px rgba(110, 142, 255, 0.06)' : 'none',
            }}
          >
            <span style={{ fontSize: '13px' }}>⬡</span>
            Employee
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px',
              color: 'rgba(255,255,255,0.3)', marginBottom: '8px',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAdmin ? 'admin@company.com' : 'john.doe@company.com'}
              required
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(80, 120, 255, 0.1)',
                background: 'rgba(15, 18, 45, 0.5)',
                color: '#e8ecf4', fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(110, 142, 255, 0.3)';
                e.target.style.boxShadow = '0 0 0 3px rgba(110, 142, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(80, 120, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', fontSize: '11px',
              color: 'rgba(255,255,255,0.3)', marginBottom: '8px',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(80, 120, 255, 0.1)',
                background: 'rgba(15, 18, 45, 0.5)',
                color: '#e8ecf4', fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(110, 142, 255, 0.3)';
                e.target.style.boxShadow = '0 0 0 3px rgba(110, 142, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(80, 120, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.12)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: 'rgba(239, 68, 68, 0.8)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: '1.5',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#ef4444', flexShrink: 0, marginTop: '6px',
              }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              borderRadius: '12px', border: 'none',
              background: loading ? 'rgba(80, 120, 255, 0.15)' : 'linear-gradient(135deg, #6e8eff, #9b6dff)',
              color: loading ? 'rgba(200, 210, 240, 0.5)' : '#ffffff',
              fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.01em',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(110, 142, 255, 0.2), 0 0 40px rgba(110, 142, 255, 0.06)',
            }}
          >
            {loading ? 'Signing in...' : `Sign In`}
          </button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: '28px',
          fontSize: '12px', color: 'rgba(255, 255, 255, 0.15)',
        }}>
          <span>Secure enterprise login</span>
          <div style={{ marginTop: '16px', fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>No account? </span>
            <a href="/register" style={{
              color: '#6e8eff',
              textDecoration: 'none',
              fontWeight: 600,
              borderBottom: '1px solid rgba(110, 142, 255, 0.25)',
              paddingBottom: '1px',
              transition: 'all 0.2s',
            }}>Sign up</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes card-float-in {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ambient-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
          100% { transform: translate(-20px, 30px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
