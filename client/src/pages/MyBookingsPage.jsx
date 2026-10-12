import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MyBookingsPage({ onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api('/api/bookings/my');
      setBookings(data.bookings || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load passes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async () => {
    if (!cancelModalBooking) return;
    const bookingId = cancelModalBooking.id;
    setCancellingId(bookingId);
    setCancelModalBooking(null);

    try {
      await api(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
      setFeedback({
        type: 'success',
        message: 'Reservation cancelled successfully. Slot relinquished and waitlist promoted.'
      });
      await fetchBookings();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Cancellation rejected: ${err.message}`
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--neon-lime)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            <Ticket size={14} /> Turnstile Access
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--pure-white)' }}>
            My Athlete Passes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '600px' }}>
            Present your unique 6-character short code to the front-desk turnstile staff during your booked session hour.
          </p>
        </div>

        <button
          onClick={() => onNavigate('sessions')}
          className="btn-outline-hover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'var(--charcoal-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--pure-white)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Book Another Slot <ArrowRight size={16} color="var(--neon-lime)" />
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          role="alert"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: feedback.type === 'success' ? 'rgba(204,255,0,0.1)' : 'rgba(255,59,48,0.12)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(204,255,0,0.3)' : 'rgba(255,59,48,0.35)'}`,
            color: feedback.type === 'success' ? 'var(--neon-lime)' : 'var(--status-crimson)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'var(--charcoal-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ fontWeight: 600 }}>Retrieving your reservation passes...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4.5rem 2rem', background: 'var(--charcoal-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Ticket size={28} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)', marginBottom: '0.5rem' }}>
            No Active Gym Reservations
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            You haven't reserved any gym slots yet. Browse our daily schedule to secure a session.
          </p>
          <button
            onClick={() => onNavigate('sessions')}
            className="neon-button"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Explore Available Slots <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {bookings.map((b) => {
            const isCancelled = b.status === 'cancelled';
            const isCheckedIn = b.is_checked_in === 1;

            return (
              <div
                key={b.id}
                className="card-glow-hover"
                style={{
                  background: 'var(--charcoal-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: isCheckedIn
                    ? '1px solid rgba(56, 189, 248, 0.4)'
                    : isCancelled
                    ? '1px solid rgba(255, 59, 48, 0.25)'
                    : '1px solid rgba(204, 255, 0, 0.25)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isCancelled ? 0.75 : 1
                }}
              >
                <div>
                  {/* Status header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Calendar size={15} color="var(--neon-lime)" />
                      <span>{b.session_date}</span>
                    </div>

                    {isCancelled ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-crimson)' }}>
                        <XCircle size={13} /> Cancelled
                      </span>
                    ) : isCheckedIn ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>
                        <ShieldCheck size={13} /> Checked In
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: 'rgba(204,255,0,0.12)', border: '1px solid rgba(204,255,0,0.35)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--neon-lime)' }}>
                        <CheckCircle2 size={13} /> Confirmed Pass
                      </span>
                    )}
                  </div>

                  {/* Session Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--pure-white)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                    <Clock size={18} color="var(--neon-lime)" />
                    <span>
                      {String(b.start_hour).padStart(2, '0')}:00 – {String(b.start_hour + 1).padStart(2, '0')}:00
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
                      (60 Min)
                    </span>
                  </div>

                  {/* Turnstile Code Box */}
                  <div
                    style={{
                      background: 'var(--obsidian-deep)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Turnstile Check-In Code
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '2rem',
                        fontWeight: 900,
                        letterSpacing: '0.25em',
                        color: isCancelled ? 'var(--text-dim)' : 'var(--neon-lime)',
                        textShadow: isCancelled ? 'none' : '0 0 15px rgba(204,255,0,0.35)'
                      }}
                    >
                      {b.check_in_code}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                      {isCheckedIn ? 'Redeemed & Verified at Turnstile' : isCancelled ? 'Code Voided' : 'Show code to staff at turnstile'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isCancelled && !isCheckedIn && (
                  <button
                    disabled={cancellingId === b.id}
                    onClick={() => setCancelModalBooking(b)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,59,48,0.1)',
                      border: '1px solid rgba(255,59,48,0.25)',
                      color: 'var(--status-crimson)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: cancellingId === b.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,59,48,0.2)';
                      e.currentTarget.style.borderColor = 'var(--status-crimson)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,59,48,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255,59,48,0.25)';
                    }}
                  >
                    {cancellingId === b.id ? 'Cancelling...' : 'Cancel Reservation'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 9, 11, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: 'var(--charcoal-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--status-crimson)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                Cancel Reservation?
              </h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Are you sure you want to cancel your slot for <strong>{cancelModalBooking.session_date}</strong> at{' '}
              <strong>{String(cancelModalBooking.start_hour).padStart(2, '0')}:00</strong>?
              <br /><br />
              <span style={{ color: 'var(--pure-white)', fontWeight: 600 }}>Note:</span> The first athlete on the FIFO waitlist will be immediately promoted into this slot.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCancelModalBooking(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--pure-white)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Keep Pass
              </button>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-crimson)',
                  border: 'none',
                  color: 'var(--pure-white)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
