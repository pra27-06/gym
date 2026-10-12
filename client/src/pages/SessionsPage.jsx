import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, socket } from '../services/api';
import { Calendar, Clock, Check, AlertCircle, RefreshCw, Zap, ArrowRight, UserCheck } from 'lucide-react';

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
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--neon-lime)',
            marginBottom: '0.4rem'
          }}>
            <Zap size={14} /> Live Training Floor
          </div>
          <h1 className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--pure-white)', letterSpacing: '-0.02em' }}>
            Scheduled Sessions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Select an open 60-minute window. Capacity is strictly capped at 20 athletes.
          </p>
        </div>

        {/* Date Filter & Real-Time indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--emerald-dim)',
            border: '1px solid var(--emerald-border)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--emerald)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
            Live WebSocket Sync
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--obsidian-deep)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                width: 'auto'
              }}
            />

            {dateFilter && (
              <button
                className="btn-secondary"
                onClick={() => setDateFilter('')}
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: feedback.type === 'success' ? 'var(--emerald-dim)' : 'var(--crimson-dim)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--emerald-border)' : 'var(--crimson-border)'}`,
          color: feedback.type === 'success' ? '#6ee7b7' : '#fca5a5'
        }}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600 }}>Loading arena schedule...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="surface-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Calendar size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--pure-white)' }}>
            No Sessions Available for this Date
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            There are currently no training blocks scheduled for the selected date.
          </p>
          {dateFilter && (
            <button className="btn-secondary" onClick={() => setDateFilter('')}>
              Show All Upcoming Sessions
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {sessions.map((session) => {
            const capacity = session.capacity || 20;
            const booked = capacity - session.seats_remaining;
            const percent = Math.min(100, Math.round((booked / capacity) * 100));
            const isFull = session.seats_remaining === 0;
            const isUrgent = session.seats_remaining > 0 && session.seats_remaining <= 3;

            return (
              <div
                key={session.id}
                className="surface-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: session.is_booked_by_user
                    ? '1px solid var(--emerald-border)'
                    : isUrgent
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Session Date
                      </div>
                      <div className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                        {session.session_date}
                      </div>
                    </div>

                    <span
                      className="badge-chip"
                      style={{
                        background: isFull ? 'var(--crimson-dim)' : isUrgent ? 'rgba(245, 158, 11, 0.12)' : 'var(--emerald-dim)',
                        color: isFull ? '#f87171' : isUrgent ? '#fbbf24' : '#34d399',
                        border: `1px solid ${isFull ? 'var(--crimson-border)' : isUrgent ? 'rgba(245, 158, 11, 0.3)' : 'var(--emerald-border)'}`
                      }}
                    >
                      {isFull ? 'Full (20/20)' : `${session.seats_remaining} Open`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                    <Clock size={16} color="var(--neon-lime)" />
                    <span style={{ fontWeight: 600 }}>
                      {String(session.start_hour).padStart(2, '0')}:00 – {String(session.start_hour + 1).padStart(2, '0')}:00
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>(60 Min)</span>
                  </div>

                  {/* Occupancy Progress */}
                  <div style={{
                    background: 'var(--obsidian-deep)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Floor Occupancy</span>
                      <span style={{ color: isFull ? '#f87171' : 'var(--text-primary)' }}>
                        {booked}/{capacity} Athletes ({percent}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--graphite-700)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          borderRadius: 'var(--radius-full)',
                          background: isFull ? 'var(--crimson)' : 'var(--neon-lime)',
                          transition: 'width 0.3s ease'
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
                        background: 'var(--emerald-dim)',
                        border: '1px solid var(--emerald-border)',
                        color: '#6ee7b7',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <UserCheck size={16} /> Reserved • View Turnstile Pass →
                    </button>
                  ) : session.is_waitlisted_by_user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#fbbf24',
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.78rem',
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
                      style={{ width: '100%' }}
                    >
                      {actionLoading === session.id ? 'Securing Slot...' : 'Reserve Session →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={actionLoading === session.id}
                      onClick={() => handleJoinWaitlist(session.id)}
                      style={{ width: '100%' }}
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
