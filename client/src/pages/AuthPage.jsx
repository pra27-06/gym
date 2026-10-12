import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

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
        email: loginEmail,
        password: loginPassword
      });
      login(res.token, res.user);
      onSuccess(res.user.role === 'admin' ? 'admin' : 'sessions');
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
        name: regName,
        email: regEmail,
        password: regPassword
      });
      login(res.token, res.user);
      onSuccess('sessions');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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

        <div style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <strong>Demo Credentials:</strong><br />
          Admin: <code>admin@gym.com</code> / <code>password123</code><br />
          Member: <code>alice@gym.com</code> / <code>password123</code>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
          <button
            className="font-heading"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: tab === 'login' ? 'var(--pure-white)' : 'var(--text-dim)',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '0.75rem 0',
              cursor: 'pointer',
              borderBottom: tab === 'login' ? '2px solid var(--neon-lime)' : '2px solid transparent'
            }}
          >
            Sign In
          </button>
          <button
            className="font-heading"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: tab === 'register' ? 'var(--pure-white)' : 'var(--text-dim)',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '0.75rem 0',
              cursor: 'pointer',
              borderBottom: tab === 'register' ? '2px solid var(--neon-lime)' : '2px solid transparent'
            }}
          >
            Register
          </button>
        </div>

        {/* Feedback states */}
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
