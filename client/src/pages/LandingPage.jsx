import React from 'react';
import { ArrowRight, Users, Clock, ShieldCheck, Zap, Activity, CheckCircle2, Ticket } from 'lucide-react';

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
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Hero Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        alignItems: 'center',
        padding: '3rem 0 4rem 0',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Left Headline */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'var(--neon-lime-dim)',
            color: 'var(--neon-lime)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1.25rem',
            border: '1px solid var(--neon-lime-border)'
          }}>
            <Activity size={14} /> Strict 20-Athlete Floor Cap
          </div>

          <h1 className="font-heading" style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--pure-white)',
            marginBottom: '1.25rem'
          }}>
            A gym floor built for athletes who actually train.
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: '2.25rem',
            maxWidth: '540px'
          }}>
            No waiting for squat racks. No crowded benches. Every 60-minute session is strictly capped at 20 athletes with live WebSocket availability and automated FIFO waitlist dispatch.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn-primary" onClick={handleGoSessions}>
              View Live Schedule <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={handleGoAuth}>
              Athlete Sign In
            </button>
          </div>
        </div>

        {/* Right Live Visual Card */}
        <div>
          <div style={{
            background: 'var(--charcoal-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--emerald)' }}>
                  Live Session In Progress
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                Main Strength Floor
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                Peak Performance Conditioning
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                <Clock size={15} color="var(--neon-lime)" /> 18:00 – 19:00 (60 Minutes)
              </div>
            </div>

            {/* Occupancy Indicator */}
            <div style={{
              background: 'var(--obsidian-deep)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Confirmed Athletes</span>
                <span style={{ color: 'var(--pure-white)' }}>17 / 20 Occupied</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--graphite-700)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--neon-lime)', borderRadius: 'var(--radius-full)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--neon-lime)', fontWeight: 700 }}>
                <span>✓ 3 Open Slots Remaining</span>
                <span style={{ color: 'var(--text-dim)' }}>Queue: Empty</span>
              </div>
            </div>

            {/* Simulated Pass Preview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-medium)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Ticket size={18} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Turnstile Code</div>
                  <div className="font-mono" style={{ color: 'var(--pure-white)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.1em' }}>
                    7A4B2C
                  </div>
                </div>
              </div>
              <span className="badge-chip" style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)', border: '1px solid var(--emerald-border)' }}>
                Admitted
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        padding: '3rem 0',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--pure-white)', lineHeight: 1 }}>20</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--neon-lime)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.4rem' }}>
            Athletes Max Per Slot
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Atomic transaction locks enforce the 20-seat limit at the database layer.
          </p>
        </div>

        <div>
          <div className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--pure-white)', lineHeight: 1 }}>60m</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.4rem' }}>
            Focused Training Blocks
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Turnstile check-in codes are valid strictly during your scheduled session hour.
          </p>
        </div>

        <div>
          <div className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--pure-white)', lineHeight: 1 }}>FIFO</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.4rem' }}>
            Instant Waitlist Dispatch
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            When an attendee cancels, the first queued athlete is automatically confirmed.
          </p>
        </div>

        <div>
          <div className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--pure-white)', lineHeight: 1 }}>Real-Time</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.4rem' }}>
            WebSocket Availability
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Socket.IO pushes live seat counters straight to every open athlete screen.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '4rem 0 3rem 0' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ color: 'var(--neon-lime)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Operational Workflow
          </div>
          <h2 className="font-heading" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--pure-white)', marginTop: '0.35rem' }}>
            How GYMFLOW Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="surface-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--neon-lime-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-lime)', marginBottom: '1.25rem' }}>
              <Users size={20} />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pure-white)', marginBottom: '0.5rem' }}>
              1. Choose an Open Window
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Browse upcoming sessions by date. Live capacity gauges display confirmed attendees and remaining seats updated in real time.
            </p>
          </div>

          <div className="surface-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1.25rem' }}>
              <Ticket size={20} />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pure-white)', marginBottom: '0.5rem' }}>
              2. Digital Turnstile Pass
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Upon confirmation, the system creates a cryptographic 6-digit hex code in your dashboard. If the session is full, join the automated FIFO queue.
            </p>
          </div>

          <div className="surface-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)', marginBottom: '1.25rem' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pure-white)', marginBottom: '0.5rem' }}>
              3. Check-In & Train
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Front desk staff validates your pass on their terminal during the session's active 1-hour window. Once admitted, your pass is marked as redeemed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section style={{
        marginTop: '2rem',
        background: 'var(--charcoal-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <h3 className="font-heading" style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--pure-white)', marginBottom: '0.75rem' }}>
          Reserve your spot on the training floor.
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', marginBottom: '1.75rem' }}>
          Explore scheduled training sessions or create your athlete profile to claim open slots.
        </p>
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={handleGoSessions}>
            Browse Arena Schedule <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" onClick={handleGoAuth}>
            Member Portal
          </button>
        </div>
      </section>
    </div>
  );
}
