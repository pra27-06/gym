import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, socket } from '../services/api';
import { Calendar, Clock, Check, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export default function SessionsPage({ onNavigate, onNavigateToPasses, onNavigateToAuth }) {
  const { token, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [actionLoading, setActionLoading] = useState(null);

  const goToPasses = () => {
    if (typeof onNavigateToPasses === 'function') {
      onNavigateToPasses();
    } else if (typeof onNavigate === 'function') {
      onNavigate('bookings');
    }
  };

  const goToAuth = () => {
    if (typeof onNavigateToAuth === 'function') {
      onNavigateToAuth();
    } else if (typeof onNavigate === 'function') {
      onNavigate('login-register');
    }
  };

  // Load sessions from API
  const fetchSessions = async (filterDate = '') => {
    try {
      const url = filterDate ? `/api/sessions?date=${encodeURIComponent(filterDate)}` : '/api/sessions';
      const data = await apiRequest(url, 'GET', null, token);
      setSessions(data.sessions || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error loading sessions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(dateFilter);

    // Real-Time Slot Availability via Socket.IO
    const handleSessionUpdate = (update) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === update.sessionId) {
            return {
              ...s,
              seats_remaining: update.seats_remaining,
              confirmed_count: update.confirmed_count
            };
          }
          return s;
        })
      );
    };

    socket.on('session:updated', handleSessionUpdate);

    return () => {
      socket.off('session:updated', handleSessionUpdate);
    };
  }, [dateFilter, token]);

  // Optimistic Booking with rollback
  const handleBook = async (session) => {
    if (!isAuthenticated) {
      goToAuth();
      return;
    }

    const previousSeats = session.seats_remaining;
    setActionLoading(session.id);
    setFeedback({ type: '', message: '' });

    // Optimistic decrement
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, seats_remaining: Math.max(0, s.seats_remaining - 1) } : s))
    );

    try {
      await apiRequest('/api/bookings', 'POST', { session_id: session.id }, token);
      setFeedback({
        type: 'success',
        message: 'Slot booked successfully! Check your turnstile code under "My Passes".'
      });
      fetchSessions(dateFilter);
    } catch (err) {
      // Rollback on rejection
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, seats_remaining: previousSeats } : s))
      );
      setFeedback({ type: 'error', message: `Booking failed: ${err.message}` });
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoinWaitlist = async (sessionId) => {
    if (!isAuthenticated) {
      goToAuth();
      return;
    }

    setActionLoading(sessionId);
    setFeedback({ type: '', message: '' });

    try {
      await apiRequest('/api/bookings/waitlist', 'POST', { session_id: sessionId }, token);
      setFeedback({
        type: 'success',
        message: 'Added to priority waitlist! You will be automatically booked if an athlete cancels.'
      });
      fetchSessions(dateFilter);
    } catch (err) {
      setFeedback({ type: 'error', message: `Waitlist request failed: ${err.message}` });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveWaitlist = async (sessionId) => {
    setActionLoading(sessionId);
    try {
      await apiRequest(`/api/bookings/waitlist/${sessionId}`, 'DELETE', null, token);
      setFeedback({ type: 'success', message: 'Removed from waitlist.' });
      fetchSessions(dateFilter);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ color: 'var(--neon-lime)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            LIVE ARENA CAPACITY
          </div>
          <h1 className="font-heading" style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--pure-white)' }}>
            Training Sessions
          </h1>
        </div>

        {/* Date Filter & Real-Time indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.4rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--emerald)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
            LIVE SOCKET ACTIVE
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              background: 'var(--graphite-900)',
              border: '1px solid var(--graphite-700)',
              color: 'var(--pure-white)',
              fontSize: '0.85rem'
            }}
          />

          {dateFilter && (
            <button className="btn-secondary" onClick={() => setDateFilter('')} style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
              Reset Date
            </button>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          fontSize: '0.92rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: feedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: feedback.type === 'success' ? '#6ee7b7' : '#fca5a5'
        }}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--neon-lime)' }} />
          <p className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Loading scheduled arena slots...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="surface-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Calendar size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--pure-white)' }}>
            No Sessions Found
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no workout slots scheduled for this specific date.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {sessions.map((session) => {
            const capacity = session.capacity || 20;
            const booked = capacity - session.seats_remaining;
            const percent = Math.min(100, Math.round((booked / capacity) * 100));
            const isFull = session.seats_remaining === 0;

            return (
              <div key={session.id} className="surface-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--pure-white)' }}>
                      {session.session_date}
                    </div>
                    <span
                      className="badge-chip"
                      style={{
                        background: isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isFull ? '#f87171' : '#34d399',
                        border: isFull ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      {isFull ? 'FULL (20/20)' : `${session.seats_remaining} SEATS LEFT`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    <Clock size={16} />
                    {String(session.start_hour).padStart(2, '0')}:00 – {String(session.start_hour + 1).padStart(2, '0')}:00 (60 Minutes)
                  </div>

                  {/* Visual Occupancy Gauge */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Occupancy</span>
                      <span style={{ color: isFull ? '#f87171' : 'var(--pure-white)' }}>
                        {booked}/{capacity} Athletes ({percent}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--graphite-700)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          borderRadius: '999px',
                          background: isFull ? 'var(--crimson)' : 'linear-gradient(90deg, #10b981 0%, var(--neon-lime) 100%)',
                          boxShadow: isFull ? '0 0 10px rgba(239, 68, 68, 0.5)' : '0 0 10px var(--neon-lime-glow)',
                          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  {session.is_booked_by_user ? (
                    <button
                      type="button"
                      onClick={goToPasses}
                      style={{
                        width: '100%',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#6ee7b7',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Pass Confirmed (View Code) →
                    </button>
                  ) : session.is_waitlisted_by_user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase'
                      }}>
                        ⏳ On Priority Waitlist
                      </div>
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={actionLoading === session.id}
                        onClick={() => handleLeaveWaitlist(session.id)}
                        style={{ width: '100%' }}
                      >
                        Leave Waitlist
                      </button>
                    </div>
                  ) : !isFull ? (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={actionLoading === session.id}
                      onClick={() => handleBook(session)}
                      style={{ width: '100%', padding: '0.85rem' }}
                    >
                      {actionLoading === session.id ? 'Securing Seat...' : 'Reserve Session →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={actionLoading === session.id}
                      onClick={() => handleJoinWaitlist(session.id)}
                      style={{ width: '100%', padding: '0.85rem' }}
                    >
                      {actionLoading === session.id ? 'Queueing...' : 'Join Waitlist (Queue) ⏳'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
