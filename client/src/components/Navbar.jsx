import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Calendar, Ticket, Shield, LogOut, User } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(13, 15, 20, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '1rem 2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActivePage('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
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
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="font-heading"
            onClick={() => setActivePage('landing')}
            style={{
              background: activePage === 'landing' ? 'var(--neon-lime-dim)' : 'transparent',
              color: activePage === 'landing' ? 'var(--neon-lime)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activePage === 'landing' ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
              padding: '0.5rem 1rem',
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
            onClick={() => setActivePage('sessions')}
            style={{
              background: activePage === 'sessions' ? 'var(--neon-lime-dim)' : 'transparent',
              color: activePage === 'sessions' ? 'var(--neon-lime)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activePage === 'sessions' ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
              padding: '0.5rem 1rem',
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
              onClick={() => setActivePage('my-bookings')}
              style={{
                background: activePage === 'my-bookings' ? 'var(--neon-lime-dim)' : 'transparent',
                color: activePage === 'my-bookings' ? 'var(--neon-lime)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: activePage === 'my-bookings' ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
                padding: '0.5rem 1rem',
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
              onClick={() => setActivePage('admin')}
              style={{
                background: activePage === 'admin' ? 'var(--neon-lime-dim)' : 'transparent',
                color: activePage === 'admin' ? 'var(--neon-lime)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: activePage === 'admin' ? 'rgba(204, 255, 0, 0.3)' : 'transparent',
                padding: '0.5rem 1rem',
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
                {user?.name}
              </span>
              <button 
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              className="btn-primary"
              onClick={() => setActivePage('auth')}
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.82rem', marginLeft: '0.5rem' }}
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
