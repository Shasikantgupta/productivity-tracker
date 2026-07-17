'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
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
          if (meData.role === 'employee') {
            window.location.href = '/employee';
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch user role', e);
      }

      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        width: '420px',
        background: 'rgba(26, 31, 53, 0.9)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        borderRadius: '20px',
        padding: '48px 40px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(99, 102, 241, 0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
          }}>📊</div>
          <h1 style={{
            fontSize: '24px', fontWeight: 800,
            color: '#f1f5f9', letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}>
            ProTracker
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Sign in to your ProTracker dashboard
          </p>
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                background: 'rgba(15, 22, 41, 0.6)',
                color: '#f1f5f9', fontSize: '14px',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)'}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                background: 'rgba(15, 22, 41, 0.6)',
                color: '#f1f5f9', fontSize: '14px',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)'}
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
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              borderRadius: '12px', border: 'none',
              background: loading
                ? 'rgba(99, 102, 241, 0.4)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '12px', color: '#475569',
        }}>
          <span>🔒 Secure enterprise login</span>
          <br />
          <span>Protected by JWT + bcrypt</span>
        </div>
      </div>
    </div>
  );
}
