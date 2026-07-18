'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      let res;
      try {
        res = await fetch(`${API}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, full_name: fullName, password, role }),
        });
      } catch (networkErr) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on ' + API);
      }

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

  const isAdmin = role === 'admin';

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
        border: `1px solid ${isAdmin ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
        borderRadius: '16px',
        padding: '40px 32px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        transition: 'border-color 0.3s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: isAdmin
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(135deg, #10b981, #06b6d4)',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '16px',
            boxShadow: isAdmin
              ? '0 8px 24px rgba(99, 102, 241, 0.3)'
              : '0 8px 24px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease',
          }}>{isAdmin ? '🛡️' : '👤'}</div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700 }}>Create Account</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Register for ProTracker</p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 22, 41, 0.6)',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '24px',
          border: '1px solid rgba(99, 102, 241, 0.1)',
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
            <span style={{ fontSize: '15px' }}>🛡️</span>
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
            <span style={{ fontSize: '15px' }}>👤</span>
            Employee
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444', padding: '12px 16px', borderRadius: '8px',
            marginBottom: '24px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px',
            lineHeight: '1.5',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Full Name
            </label>
            <input
              id="register-fullname"
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
              id="register-username"
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
              id="register-email"
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
              id="register-password"
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
            id="register-submit"
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px', width: '100%', padding: '12px',
              background: loading
                ? '#4f46e5'
                : isAdmin
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: '#fff', border: 'none', borderRadius: '8px',
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
            {loading ? 'Registering...' : `Sign Up as ${isAdmin ? 'Admin' : 'Employee'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <span style={{ color: '#94a3b8' }}>Already have an account? </span>
          <a href="/login" style={{
            color: isAdmin ? '#6366f1' : '#10b981',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.2s',
          }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
