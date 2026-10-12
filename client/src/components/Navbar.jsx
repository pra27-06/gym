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
  const isAuthActive = current === 'login-register' || current === 'auth';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(13, 15, 20, 0.95)',
      backdropFilter: 'blur(16px)',
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
            gap: '0.75rem',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0
          }}
          aria-label="GYMFLOW Home"
        >
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, var(--neon-lime) 0%, #a3e635 100%)',
            clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--neon-lime-glow)'
          }}>
            <Zap size={20} color="#000" strokeWidth={3} />
          </div>
          <span className="font-heading" style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            letterSpacing: '2px',
            color: 'var(--pure-white)'
          }}>
            GYM<span style={{ color: 'var(--neon-lime)' }}>FLOW</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="font-heading"
            onClick={() => navigate('landing')}
            style={{
              background: current === 'landing' ? 'var(--neon-lime-dim)' : 'transparent',
              color: current === 'landing' ? 'var(--neon-lime)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: current === 'landing' ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Overview
          </button>

          <button
            className="font-heading"
            onClick={() => navigate('sessions')}
            style={{
              background: current === 'sessions' ? 'var(--neon-lime-dim)' : 'transparent',
              color: current === 'sessions' ? 'var(--neon-lime)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: current === 'sessions' ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textTransform: 'uppercase'
            }}
          >
            <Calendar size={15} />
            Schedule
          </button>

          {isAuthenticated && (
            <button
              className="font-heading"
              onClick={() => navigate('bookings')}
              style={{
                background: isPassesActive ? 'var(--neon-lime-dim)' : 'transparent',
                color: isPassesActive ? 'var(--neon-lime)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: isPassesActive ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textTransform: 'uppercase'
              }}
            >
              <Ticket size={15} />
              My Passes
            </button>
          )}

          {isAdmin && (
            <button
              className="font-heading"
              onClick={() => navigate('admin')}
              style={{
                background: current === 'admin' ? 'var(--neon-lime-dim)' : 'transparent',
                color: current === 'admin' ? 'var(--neon-lime)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: current === 'admin' ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textTransform: 'uppercase'
              }}
            >
              <Shield size={15} />
              Admin Hub
            </button>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} color="var(--neon-lime)" />
                {authUser?.name}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.4rem'
                }}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={() => navigate('login-register')}
              style={{
                padding: '0.5rem 1.1rem',
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
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
          gap: '0.5rem'
        }}>
          <button
            onClick={() => navigate('landing')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              background: current === 'landing' ? 'var(--neon-lime-dim)' : 'transparent',
              color: current === 'landing' ? 'var(--neon-lime)' : 'var(--text-primary)',
              border: 'none',
              textAlign: 'left',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => navigate('sessions')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              background: current === 'sessions' ? 'var(--neon-lime-dim)' : 'transparent',
              color: current === 'sessions' ? 'var(--neon-lime)' : 'var(--text-primary)',
              border: 'none',
              textAlign: 'left',
              fontWeight: 700,
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
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: isPassesActive ? 'var(--neon-lime-dim)' : 'transparent',
                color: isPassesActive ? 'var(--neon-lime)' : 'var(--text-primary)',
                border: 'none',
                textAlign: 'left',
                fontWeight: 700,
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
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: current === 'admin' ? 'var(--neon-lime-dim)' : 'transparent',
                color: current === 'admin' ? 'var(--neon-lime)' : 'var(--text-primary)',
                border: 'none',
                textAlign: 'left',
                fontWeight: 700,
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
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: 'none',
                textAlign: 'left',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              <LogOut size={16} /> Sign Out ({authUser?.name})
            </button>
          ) : (
            <button
              onClick={() => navigate('login-register')}
              className="btn-primary"
              style={{
                padding: '0.75rem 1rem',
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

      {/* Inline style for responsive toggle */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
