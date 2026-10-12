import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SessionsPage from './pages/SessionsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPage from './pages/AdminPage';
import { Dumbbell, Shield, Zap, Heart } from 'lucide-react';

export default function App() {
  const { user, token, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(token ? 'sessions' : 'landing');

  // Guard navigation
  const handleNavigate = (page) => {
    if (page === 'admin' && user?.role !== 'admin') {
      alert('Access restricted to Gym Staff / Admin role.');
      return;
    }
    if ((page === 'sessions' || page === 'bookings' || page === 'admin') && !token) {
      setCurrentPage('login-register');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--obsidian-deep)' }}>
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

        {currentPage === 'login-register' && (
          <AuthPage
            onSuccess={(authenticatedUser) => {
              if (authenticatedUser.role === 'admin') {
                setCurrentPage('admin');
              } else {
                setCurrentPage('sessions');
              }
            }}
          />
        )}

        {currentPage === 'sessions' && (
          <SessionsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'bookings' && (
          <MyBookingsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && user?.role === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--charcoal-card)', padding: '3rem 1.5rem 2rem 1.5rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--neon-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#08090b" strokeWidth={3} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--pure-white)' }}>
                GYM<span style={{ color: 'var(--neon-lime)' }}>FLOW</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px' }}>
              Engineered for athletic performance. High-concurrency gym slot reservations with real-time WebSockets and automated FIFO waitlist dispatch.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--pure-white)', marginBottom: '0.75rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                Architecture
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>React + Vite Frontend</li>
                <li>Node.js / Express Backend</li>
                <li>SQLite ACID Transactions</li>
                <li>Socket.IO Real-Time Stream</li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: 'var(--pure-white)', marginBottom: '0.75rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                Policies
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>20 Athletes Per Session</li>
                <li>60-Minute Slots</li>
                <li>Instant FIFO Waitlist</li>
                <li>Turnstile Code Verification</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          <div>© {new Date().getFullYear()} GYMFLOW Platform. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built for Technical Interview Walkthrough
          </div>
        </div>
      </footer>
    </div>
  );
}
