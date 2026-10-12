import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { ArrowRight, AlertCircle, UserCheck, Shield, Lock, Mail, User } from 'lucide-react';

export default function AuthPage({ onSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/api/auth/login', 'POST', {
        email: loginEmail.trim(),
        password: loginPassword
      });
      login(res.token, res.user);
      if (typeof onSuccess === 'function') {
        onSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/register', 'POST', {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword
      });
      login(res.token, res.user);
      if (typeof onSuccess === 'function') {
        onSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, pass) => {
    setTab('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setError('');
  };

  return (
    <div style={{
      maxWidth: '960px',
      margin: '3rem auto',
      padding: '0 1.5rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      background: 'var(--charcoal-card)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Left Editorial Visual */}
      <div style={{
        padding: '3rem 2.5rem',
        background: 'linear-gradient(180deg, #10131a 0%, #0c0e13 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ color: 'var(--neon-lime)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ATHLETE MEMBERSHIP ACCESS
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.15, color: 'var(--pure-white)', marginBottom: '1rem' }}>
            Train on a floor capped for performance.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '360px' }}>
            Book 60-minute training windows with live seat counts, automatic waitlist dispatch, and 6-digit turnstile check-ins.
          </p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div style={{
          marginTop: '2.5rem',
          background: 'var(--obsidian-deep)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            1-Click Demo Evaluation Credentials
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemo('alice@gym.com', 'password123')}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--graphite-800)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--neon-lime)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
            >
              <UserCheck size={14} color="var(--neon-lime)" /> Alice (Member)
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin@gym.com', 'password123')}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--graphite-800)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
            >
              <Shield size={14} color="#38bdf8" /> Admin (Staff)
            </button>
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div style={{ padding: '3rem 2.5rem' }}>
        {/* Tab switchers */}
        <div style={{
          display: 'flex',
          background: 'var(--obsidian-deep)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'login' ? 'var(--graphite-800)' : 'transparent',
              color: tab === 'login' ? 'var(--pure-white)' : 'var(--text-dim)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'register' ? 'var(--graphite-800)' : 'transparent',
              color: tab === 'register' ? 'var(--pure-white)' : 'var(--text-dim)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Register
          </button>
        </div>

        {/* Feedback error alert */}
        {error && (
          <div style={{
            background: 'var(--crimson-dim)',
            border: '1px solid var(--crimson-border)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="athlete@gym.com"
                required
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Full Athlete Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Jordan Cruz"
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jordan@gym.com"
                required
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Password (Min 6 Characters)
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
              {loading ? 'Creating Profile...' : 'Complete Registration'} <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
