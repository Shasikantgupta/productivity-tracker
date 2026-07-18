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
      background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0a0e1a 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: '-30%', right: '-10%',
        width: '600px', height: '600px',
        background: isAdmin
          ? 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
        transition: 'background 0.5s ease',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: '500px', height: '500px',
        background: isAdmin
          ? 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
        transition: 'background 0.5s ease',
      }} />

      <div style={{
        width: '440px',
        background: 'rgba(26, 31, 53, 0.9)',
        border: `1px solid ${isAdmin ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
        borderRadius: '20px',
        padding: '48px 40px',
        boxShadow: `0 30px 60px rgba(0, 0, 0, 0.4), 0 0 80px ${isAdmin ? 'rgba(99, 102, 241, 0.05)' : 'rgba(16, 185, 129, 0.05)'}`,
        position: 'relative',
        zIndex: 1,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: isAdmin
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(135deg, #10b981, #06b6d4)',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '16px',
            boxShadow: isAdmin
              ? '0 8px 24px rgba(99, 102, 241, 0.3)'
              : '0 8px 24px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease',
          }}>{isAdmin ? '🛡️' : '👤'}</div>
          <h1 style={{
            fontSize: '24px', fontWeight: 800,
            color: '#f1f5f9', letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}>
            ProTracker
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            {isAdmin ? 'Admin Dashboard Login' : 'Employee Portal Login'}
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 22, 41, 0.6)',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '28px',
          border: '1px solid rgba(99, 102, 241, 0.1)',
        }}>
          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '11px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: isAdmin
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))'
                : 'transparent',
              color: isAdmin ? '#a5b4fc' : '#64748b',
              boxShadow: isAdmin ? '0 2px 12px rgba(99, 102, 241, 0.15)' : 'none',
            }}
          >
            <span style={{ fontSize: '16px' }}>🛡️</span>
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('employee')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '11px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: !isAdmin
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))'
                : 'transparent',
              color: !isAdmin ? '#6ee7b7' : '#64748b',
              boxShadow: !isAdmin ? '0 2px 12px rgba(16, 185, 129, 0.15)' : 'none',
            }}
          >
            <span style={{ fontSize: '16px' }}>👤</span>
            Employee
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              color: '#94a3b8', marginBottom: '8px', fontWeight: 500,
            }}>
              Email Address
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
                border: `1px solid ${isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                background: 'rgba(15, 22, 41, 0.6)',
                color: '#f1f5f9', fontSize: '14px',
                outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = isAdmin ? '#6366f1' : '#10b981'}
              onBlur={(e) => e.target.style.borderColor = isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              color: '#94a3b8', marginBottom: '8px', fontWeight: 500,
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
                border: `1px solid ${isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                background: 'rgba(15, 22, 41, 0.6)',
                color: '#f1f5f9', fontSize: '14px',
                outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = isAdmin ? '#6366f1' : '#10b981'}
              onBlur={(e) => e.target.style.borderColor = isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: '1.5',
            }}>
              <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠️</span>
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
              background: loading
                ? 'rgba(99, 102, 241, 0.4)'
                : isAdmin
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: 'white',
              fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading
                ? 'none'
                : isAdmin
                  ? '0 6px 20px rgba(99, 102, 241, 0.3)'
                  : '0 6px 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            {loading ? 'Signing in...' : `Sign In as ${isAdmin ? 'Admin' : 'Employee'}`}
          </button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '12px', color: '#475569',
        }}>
          <span>🔒 Secure enterprise login</span>
          <br />
          <span>Protected by JWT + bcrypt</span>
          <div style={{ marginTop: '16px', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Don't have an account? </span>
            <a href="/register" style={{
              color: isAdmin ? '#6366f1' : '#10b981',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'color 0.2s',
            }}>Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
