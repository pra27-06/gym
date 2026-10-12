import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';

export default function MyBookingsPage({ onNavigate, setActivePage }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const navigate = (page) => {
    if (typeof onNavigate === 'function') onNavigate(page);
    else if (typeof setActivePage === 'function') setActivePage(page);
  };

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

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--neon-lime)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            <Ticket size={14} /> Turnstile Passes
          </div>
          <h1 className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--pure-white)' }}>
            My Athlete Passes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '600px' }}>
            Present your 6-character short code to gym staff at the entrance during your booked 1-hour session.
          </p>
        </div>

        <button
          onClick={() => navigate('sessions')}
          className="btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          Book Another Slot <ArrowRight size={15} color="var(--neon-lime)" />
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          role="alert"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: feedback.type === 'success' ? 'var(--emerald-dim)' : 'var(--crimson-dim)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--emerald-border)' : 'var(--crimson-border)'}`,
            color: feedback.type === 'success' ? '#6ee7b7' : '#fca5a5',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ fontWeight: 600 }}>Loading your athlete passes...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="surface-card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border-medium)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--graphite-800)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Ticket size={22} color="var(--text-muted)" />
          </div>
          <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)', marginBottom: '0.4rem' }}>
            No Active Gym Reservations
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
            You don't have any booked sessions yet. Select an available time slot from the schedule.
          </p>
          <button
            onClick={() => navigate('sessions')}
            className="btn-primary"
          >
            Explore Available Slots <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {bookings.map((b) => {
            const isCancelled = b.status === 'cancelled';
            const isCheckedIn = b.is_checked_in === 1;

            return (
              <div
                key={b.id}
                className="surface-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isCheckedIn
                    ? '1px solid rgba(56, 189, 248, 0.35)'
                    : isCancelled
                    ? '1px solid var(--border-subtle)'
                    : '1px solid var(--border-medium)',
                  opacity: isCancelled ? 0.65 : 1
                }}
              >
                <div>
                  {/* Status header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Calendar size={14} color="var(--neon-lime)" />
                      <span>{b.session_date}</span>
                    </div>

                    {isCancelled ? (
                      <span className="badge-chip" style={{ background: 'var(--crimson-dim)', border: '1px solid var(--crimson-border)', color: '#f87171' }}>
                        <XCircle size={12} /> Cancelled
                      </span>
                    ) : isCheckedIn ? (
                      <span className="badge-chip" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                        <ShieldCheck size={12} /> Admitted
                      </span>
                    ) : (
                      <span className="badge-chip" style={{ background: 'var(--emerald-dim)', border: '1px solid var(--emerald-border)', color: '#34d399' }}>
                        <CheckCircle2 size={12} /> Confirmed
                      </span>
                    )}
                  </div>

                  {/* Session Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--pure-white)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                    <Clock size={17} color="var(--neon-lime)" />
                    <span>
                      {String(b.start_hour).padStart(2, '0')}:00 – {String(b.start_hour + 1).padStart(2, '0')}:00
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, marginLeft: 'auto' }}>
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
                      marginBottom: '1.25rem'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                      Turnstile Check-In Code
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '1.85rem',
                        fontWeight: 900,
                        letterSpacing: '0.2em',
                        color: isCancelled ? 'var(--text-dim)' : 'var(--neon-lime)'
                      }}
                    >
                      {b.check_in_code}
                    </div>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleCopy(b.check_in_code)}
                        style={{
                          marginTop: '0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'none',
                          border: 'none',
                          color: copiedCode === b.check_in_code ? 'var(--neon-lime)' : 'var(--text-dim)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {copiedCode === b.check_in_code ? (
                          <>
                            <Check size={12} /> Copied to clipboard
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Code
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isCancelled && !isCheckedIn && (
                  <button
                    disabled={cancellingId === b.id}
                    onClick={() => setCancelModalBooking(b)}
                    className="btn-danger"
                    style={{
                      width: '100%',
                      padding: '0.65rem'
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
            background: 'rgba(7, 8, 10, 0.85)',
            backdropFilter: 'blur(6px)',
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
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', color: '#f87171' }}>
              <AlertTriangle size={22} />
              <h3 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                Cancel Reservation?
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Relinquish your slot on <strong>{cancelModalBooking.session_date}</strong> at{' '}
              <strong>{String(cancelModalBooking.start_hour).padStart(2, '0')}:00</strong>?
              <br /><br />
              <span style={{ color: 'var(--pure-white)', fontWeight: 600 }}>Note:</span> The next athlete in the FIFO waitlist queue will be automatically confirmed.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.65rem' }}
              >
                Keep Pass
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-danger"
                style={{ flex: 1, padding: '0.65rem' }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
