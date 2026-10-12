import React from 'react';
import { ArrowRight, Users, Clock, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function LandingPage({ onNavigate, onExploreSessions, onOpenAuth }) {
  const handleGoSessions = () => {
    if (typeof onExploreSessions === 'function') {
      onExploreSessions();
    } else if (typeof onNavigate === 'function') {
      onNavigate('sessions');
    }
  };

  const handleGoAuth = () => {
    if (typeof onOpenAuth === 'function') {
      onOpenAuth();
    } else if (typeof onNavigate === 'function') {
      onNavigate('login-register');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 2rem 4rem',
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #0e1117 0%, #161b24 100%)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
        marginBottom: '4rem'
      }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, var(--neon-lime-glow) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--neon-lime-dim)',
            color: 'var(--neon-lime)',
            padding: '0.4rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            border: '1px solid rgba(204, 255, 0, 0.25)'
          }}>
            <Zap size={14} /> Next-Generation Gym Scheduling
          </div>

          <h1 className="font-heading" style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            color: 'var(--pure-white)',
            marginBottom: '1.5rem'
          }}>
            YOUR TRAINING.<br />
            <span style={{ color: 'var(--neon-lime)' }}>YOUR TIME.</span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '620px'
          }}>
            High-performance workout sessions capped strictly at 20 athletes. 
            Real-time live occupancy, instant FIFO waitlist promotions, and biometric-ready turnstile check-ins.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleGoSessions} style={{ padding: '1rem 2rem', fontSize: '0.95rem' }}>
              Book Your Session <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={handleGoAuth} style={{ padding: '1rem 2rem', fontSize: '0.95rem' }}>
              Athlete Portal
            </button>
          </div>
        </div>

        {/* Hero Metrics Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          marginTop: '4rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--pure-white)' }}>20</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              Strict Capacity Lock
            </div>
          </div>
          <div>
            <div className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--neon-lime)' }}>60 min</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              High-Impact Windows
            </div>
          </div>
          <div>
            <div className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8' }}>Instant</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              Live WebSocket Sync
            </div>
          </div>
          <div>
            <div className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a855f7' }}>FIFO</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              Auto Waitlist Promotion
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--neon-lime)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
            ENGINEERED FOR PEAK ATHLETES
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '0.5rem', color: 'var(--pure-white)' }}>
            Built to Eliminate Friction at the Door
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="surface-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--neon-lime-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={24} color="var(--neon-lime)" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--pure-white)' }}>
              Concurrency-Safe Booking
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Zero overbooking guaranteed. Atomic SQLite write transactions ensure that even when two athletes click book simultaneously, the 20-seat limit is never breached.
            </p>
          </div>

          <div className="surface-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Clock size={24} color="#38bdf8" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--pure-white)' }}>
              Automatic FIFO Waitlist
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Full session? Join the priority waitlist. If an attendee cancels before the session begins, the system immediately promotes the first in queue and issues their pass.
            </p>
          </div>

          <div className="surface-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} color="#a855f7" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--pure-white)' }}>
              Turnstile Code Security
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Each confirmed athlete receives a cryptographically generated 6-character hex redemption pass valid strictly during that session's active 60-minute window.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{
        background: 'var(--graphite-950)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '3rem 2rem',
        marginBottom: '4rem'
      }}>
        <h2 className="font-heading" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '2rem', textAlign: 'center', color: 'var(--pure-white)' }}>
          Three Simple Steps to Workout
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div>
            <div className="font-mono" style={{ color: 'var(--neon-lime)', fontSize: '1.8rem', fontWeight: 900 }}>01</div>
            <h4 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--pure-white)' }}>Select Your Slot</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Browse upcoming daily sessions and check real-time availability gauges.</p>
          </div>
          <div>
            <div className="font-mono" style={{ color: 'var(--neon-lime)', fontSize: '1.8rem', fontWeight: 900 }}>02</div>
            <h4 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--pure-white)' }}>Instant Pass Generation</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Receive your unique 6-character turnstile pass in your athlete dashboard.</p>
          </div>
          <div>
            <div className="font-mono" style={{ color: 'var(--neon-lime)', fontSize: '1.8rem', fontWeight: 900 }}>03</div>
            <h4 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--pure-white)' }}>Show Code & Train</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Front desk staff validates your code during the session hour and checks you in.</p>
          </div>
        </div>
      </section>

      {/* Direct Call to Action Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--graphite-900) 0%, #151821 100%)',
        border: '1px solid rgba(204, 255, 0, 0.25)',
        borderRadius: '16px',
        padding: '3rem 2rem',
        textAlign: 'center',
        marginBottom: '3rem',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--neon-lime)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          <Sparkles size={16} /> ARENA ACCESS READY
        </div>
        <h2 className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--pure-white)', marginBottom: '1rem' }}>
          Ready to Train Without Overcrowding?
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
          Join GYMFLOW today to book your dedicated 60-minute training slot or view upcoming schedules.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleGoSessions} style={{ padding: '0.9rem 1.8rem' }}>
            View Live Schedule <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={handleGoAuth} style={{ padding: '0.9rem 1.8rem' }}>
            Sign In / Register
          </button>
        </div>
      </section>
    </div>
  );
}
