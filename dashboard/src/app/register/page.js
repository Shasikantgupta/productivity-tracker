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

  const inputStyle = {
    width: '100%', padding: '13px 16px', boxSizing: 'border-box',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px', color: '#ffffff', fontSize: '14px', outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: "'Inter', sans-serif",
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: 'rgba(255,255,255,0.3)', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '1px',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.03)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000000',
      fontFamily: "'Inter', 'Space Grotesk', sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background orbs */}
      <div style={{
        position: 'fixed', top: '-25%', left: '-15%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-30%', right: '-10%',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.03) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '24px',
        padding: '44px 36px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.02) inset, 0 40px 80px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 1,
        animation: 'card-float-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        opacity: 0,
        transform: 'translateY(20px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: '#ffffff',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            color: '#000000',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)',
          }}>P</div>
          <h2 style={{
            margin: '0 0 6px 0',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '24px', fontWeight: 700,
            letterSpacing: '-0.5px',
          }}>Create Account</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            Join ProTracker
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '28px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              flex: 1,
              padding: '10px 16px',
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
              background: isAdmin ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: isAdmin ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <span style={{ fontSize: '12px' }}>◉</span>
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('employee')}
            style={{
              flex: 1,
              padding: '10px 16px',
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
              background: !isAdmin ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: !isAdmin ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <span style={{ fontSize: '12px' }}>⬡</span>
            Employee
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.12)',
            color: 'rgba(239, 68, 68, 0.8)',
            padding: '12px 16px', borderRadius: '12px',
            marginBottom: '24px', fontSize: '13px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            lineHeight: '1.5',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#ef4444', flexShrink: 0, marginTop: '6px',
            }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              id="register-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>Username</label>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jdoe"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>Work Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px', width: '100%', padding: '14px',
              background: loading ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
              color: loading ? 'rgba(255,255,255,0.5)' : '#000000',
              border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.01em',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(255, 255, 255, 0.1)',
            }}
          >
            {loading ? 'Creating Account...' : `Sign Up`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>Already have an account? </span>
          <a href="/login" style={{
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '1px',
            transition: 'all 0.2s',
          }}>Sign in</a>
        </div>
      </div>

      <style jsx>{`
        @keyframes card-float-in {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
