'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, full_name: fullName, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      // redirect to login upon success
      router.push('/login');
    } catch (err) {
      setError(err.message || 'An error occurred during registration. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      fontFamily: '"Inter", sans-serif',
      color: '#fff',
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px 32px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700 }}>Create Account</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Register for ProTracker</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444', padding: '12px 16px', borderRadius: '8px',
            marginBottom: '24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              style={{
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jdoe"
              required
              style={{
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              style={{
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px', width: '100%', padding: '12px',
              background: loading ? '#4f46e5' : '#6366f1',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <span style={{ color: '#94a3b8' }}>Already have an account? </span>
          <a href="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
