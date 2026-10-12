import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SessionsPage from './pages/SessionsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPage from './pages/AdminPage';
import { Zap } from 'lucide-react';

export default function App() {
  const { user, token, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');

  // Guard and normalize navigation
  const handleNavigate = (page) => {
    let target = page;
    if (target === 'my-bookings') target = 'bookings';
    if (target === 'auth') target = 'login-register';

    if (target === 'admin' && user?.role !== 'admin') {
      alert('Access restricted to Gym Staff / Admin role.');
      return;
    }

    if ((target === 'bookings' || target === 'admin') && !token) {
      setCurrentPage('login-register');
      return;
    }

    setCurrentPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--obsidian)' }}>
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={() => {
          logout();
          setCurrentPage('landing');
        }}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentPage === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {(currentPage === 'login-register' || currentPage === 'auth') && (
          <AuthPage
            onSuccess={(authenticatedUser) => {
              const role = typeof authenticatedUser === 'object' ? authenticatedUser?.role : authenticatedUser;
              if (role === 'admin') {
                handleNavigate('admin');
              } else {
                handleNavigate('sessions');
              }
            }}
          />
        )}

        {currentPage === 'sessions' && (
          <SessionsPage onNavigate={handleNavigate} />
        )}

        {(currentPage === 'bookings' || currentPage === 'my-bookings') && (
          <MyBookingsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && (
          user?.role === 'admin' ? (
            <AdminPage />
          ) : (
            <div style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center', padding: '2.5rem 2rem', background: 'var(--charcoal-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)' }}>
              <h2 className="font-heading" style={{ color: '#f87171', marginBottom: '0.75rem', fontSize: '1.4rem', fontWeight: 800 }}>Restricted Staff Console</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>You must be logged in as gym operations staff or administrator to access this area.</p>
              <button className="btn-primary" onClick={() => handleNavigate('login-register')}>Sign In with Staff Account</button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--graphite-950)', padding: '3.5rem 1.5rem 2.5rem 1.5rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '5px', background: 'var(--neon-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} color="#08090b" strokeWidth={3} />
              </div>
              <span className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--pure-white)' }}>
                GYM<span style={{ color: 'var(--neon-lime)' }}>FLOW</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '360px', lineHeight: 1.6 }}>
              Boutique gym scheduling infrastructure. Capped 20-athlete session floors, real-time WebSocket seat counters, and automated FIFO waitlist promotion.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--pure-white)', marginBottom: '0.75rem', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                Platform Stack
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>React 19 + Vite Client</li>
                <li>Express REST Backend</li>
                <li>SQLite ACID Transactions</li>
                <li>Socket.IO Event Stream</li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: 'var(--pure-white)', marginBottom: '0.75rem', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                Floor Policies
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Strict 20-Seat Cap</li>
                <li>60-Minute Windows</li>
                <li>Automated FIFO Queue</li>
                <li>Turnstile Code Validation</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1160px', margin: '2.5rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
          <div>© {new Date().getFullYear()} GYMFLOW Platform. High-Performance Athletic Booking.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Crafted for Technical Interview Walkthrough
          </div>
        </div>
      </footer>
    </div>
  );
}
