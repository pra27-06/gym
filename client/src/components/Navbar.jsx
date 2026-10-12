import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Calendar, Ticket, Shield, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar({ currentPage, activePage, onNavigate, setActivePage, onLogout }) {
  const { user: authUser, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (page) => {
    setMobileMenuOpen(false);
    if (typeof onNavigate === 'function') {
      onNavigate(page);
    } else if (typeof setActivePage === 'function') {
      setActivePage(page);
    }
  };

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    if (typeof onLogout === 'function') {
      onLogout();
    } else if (typeof logout === 'function') {
      logout();
    }
    navigate('landing');
  };

  const current = currentPage || activePage || 'landing';
  const isPassesActive = current === 'bookings' || current === 'my-bookings';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(11, 12, 16, 0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.85rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand */}
        <button
          onClick={() => navigate('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0
          }}
          aria-label="GYMFLOW Homepage"
        >
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--neon-lime)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(204, 255, 0, 0.25)'
          }}>
            <Zap size={18} color="#08090b" strokeWidth={2.8} />
          </div>
          <span className="font-heading" style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--pure-white)'
          }}>
            GYM<span style={{ color: 'var(--neon-lime)' }}>FLOW</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => navigate('landing')}
            style={{
              background: current === 'landing' ? 'var(--graphite-800)' : 'transparent',
              color: current === 'landing' ? 'var(--pure-white)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: current === 'landing' ? 'var(--border-medium)' : 'transparent',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Overview
          </button>

          <button
            onClick={() => navigate('sessions')}
            style={{
              background: current === 'sessions' ? 'var(--graphite-800)' : 'transparent',
              color: current === 'sessions' ? 'var(--pure-white)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: current === 'sessions' ? 'var(--border-medium)' : 'transparent',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Calendar size={15} color={current === 'sessions' ? 'var(--neon-lime)' : 'currentColor'} />
            Schedule
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate('bookings')}
              style={{
                background: isPassesActive ? 'var(--graphite-800)' : 'transparent',
                color: isPassesActive ? 'var(--pure-white)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: isPassesActive ? 'var(--border-medium)' : 'transparent',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Ticket size={15} color={isPassesActive ? 'var(--neon-lime)' : 'currentColor'} />
              My Passes
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => navigate('admin')}
              style={{
                background: current === 'admin' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: current === 'admin' ? '#38bdf8' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: current === 'admin' ? 'rgba(56, 189, 248, 0.3)' : 'transparent',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={15} />
              Admin Hub
            </button>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.5rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--obsidian-deep)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <User size={13} color="var(--neon-lime)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {authUser?.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: isAdmin ? '#38bdf8' : 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginLeft: '0.2rem' }}>
                  {isAdmin ? 'Staff' : 'Athlete'}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.35rem 0.5rem',
                  transition: 'all 0.15s ease'
                }}
                title="Sign Out"
                aria-label="Sign Out"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f87171';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-dim)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={() => navigate('login-register')}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                marginLeft: '0.5rem'
              }}
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--pure-white)',
            padding: '0.4rem',
            cursor: 'pointer'
          }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <button
            onClick={() => navigate('landing')}
            style={{
              padding: '0.7rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              background: current === 'landing' ? 'var(--graphite-800)' : 'transparent',
              color: current === 'landing' ? 'var(--pure-white)' : 'var(--text-primary)',
              border: 'none',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => navigate('sessions')}
            style={{
              padding: '0.7rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              background: current === 'sessions' ? 'var(--graphite-800)' : 'transparent',
              color: current === 'sessions' ? 'var(--pure-white)' : 'var(--text-primary)',
              border: 'none',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Calendar size={16} /> Schedule
          </button>
          {isAuthenticated && (
            <button
              onClick={() => navigate('bookings')}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                background: isPassesActive ? 'var(--graphite-800)' : 'transparent',
                color: isPassesActive ? 'var(--pure-white)' : 'var(--text-primary)',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Ticket size={16} /> My Passes
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate('admin')}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                background: current === 'admin' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: current === 'admin' ? '#38bdf8' : 'var(--text-primary)',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Shield size={16} /> Admin Hub
            </button>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: 'none',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.4rem'
              }}
            >
              <LogOut size={16} /> Sign Out ({authUser?.name})
            </button>
          ) : (
            <button
              onClick={() => navigate('login-register')}
              className="btn-primary"
              style={{
                padding: '0.75rem',
                marginTop: '0.5rem',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              Sign In
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
