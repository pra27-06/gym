import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { ArrowRight, AlertCircle, CheckCircle2, UserCheck, Shield } from 'lucide-react';

export default function AuthPage({ onSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
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
    setSuccess('');

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
      maxWidth: '1050px',
      margin: '2rem auto',
      background: 'var(--graphite-950)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)'
    }}>
      {/* Left Editorial Visual */}
      <div style={{
        padding: '3.5rem 3rem',
        background: 'linear-gradient(180deg, rgba(8, 9, 11, 0.6) 0%, rgba(8, 9, 11, 0.9) 100%), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop) center/cover no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ color: 'var(--neon-lime)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            ATHLETIC MEMBERSHIP PORTAL
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.1, margin: '1rem 0', color: 'var(--pure-white)' }}>
            ACCESS THE <br /><span style={{ color: 'var(--neon-lime)' }}>GYMFLOW</span> ARENA.
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, maxWidth: '380px' }}>
            Book exclusive 60-minute training windows with live seat counts and automatic waitlist queueing.
          </p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(18, 21, 28, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            One-Click Demo Credentials
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemo('alice@gym.com', 'password123')}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(204, 255, 0, 0.1)',
                border: '1px solid rgba(204, 255, 0, 0.3)',
                color: 'var(--neon-lime)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <UserCheck size={14} /> Member (Alice)
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin@gym.com', 'password123')}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <Shield size={14} /> Staff (Admin)
            </button>
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div style={{ padding: '3.5rem 3rem' }}>
        {/* Tab switchers */}
        <div style={{
          display: 'flex',
          background: 'var(--obsidian)',
          padding: '0.35rem',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '7px',
              border: 'none',
              background: tab === 'login' ? 'var(--graphite-800)' : 'transparent',
              color: tab === 'login' ? 'var(--pure-white)' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '7px',
              border: 'none',
              background: tab === 'register' ? 'var(--graphite-800)' : 'transparent',
              color: tab === 'register' ? 'var(--pure-white)' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {/* Feedback error alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="athlete@gym.com"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--obsidian)',
                  border: '1px solid var(--graphite-700)',
                  color: 'var(--pure-white)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--obsidian)',
                  border: '1px solid var(--graphite-700)',
                  color: 'var(--pure-white)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.95rem' }}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Full Athlete Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Jordan Cruz"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--obsidian)',
                  border: '1px solid var(--graphite-700)',
                  color: 'var(--pure-white)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jordan@gym.com"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--obsidian)',
                  border: '1px solid var(--graphite-700)',
                  color: 'var(--pure-white)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Password (Min 6 Characters)
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--obsidian)',
                  border: '1px solid var(--graphite-700)',
                  color: 'var(--pure-white)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.95rem' }}>
              {loading ? 'Creating Profile...' : 'Complete Registration'} <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
