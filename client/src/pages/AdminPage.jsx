import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, CalendarPlus, QrCode, Users, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  // Session creation state
  const [sessionDate, setSessionDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [createFeedback, setCreateFeedback] = useState(null);
  const [creating, setCreating] = useState(false);

  // Check-in state
  const [checkinCode, setCheckinCode] = useState('');
  const [checkinFeedback, setCheckinFeedback] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  // Roster inspection state
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterFeedback, setRosterFeedback] = useState(null);

  // Load sessions dropdown
  const loadSessionsList = async () => {
    try {
      const data = await api('/api/sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions list for admin:', err);
    }
  };

  useEffect(() => {
    loadSessionsList();
  }, []);

  // Handle session creation
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateFeedback(null);

    try {
      const res = await api('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          session_date: sessionDate,
          start_hour: parseInt(startHour, 10)
        })
      });
      setCreateFeedback({
        type: 'success',
        message: `Session published successfully for ${res.session.session_date} at ${String(res.session.start_hour).padStart(2, '0')}:00!`
      });
      setSessionDate('');
      setStartHour('');
      await loadSessionsList();
    } catch (err) {
      setCreateFeedback({
        type: 'error',
        message: err.message || 'Failed to create session'
      });
    } finally {
      setCreating(false);
    }
  };

  // Handle turnstile check-in
  const handleCheckin = async (e) => {
    e.preventDefault();
    setCheckingIn(true);
    setCheckinFeedback(null);

    try {
      const res = await api('/api/admin/check-in', {
        method: 'POST',
        body: JSON.stringify({ code: checkinCode.trim().toUpperCase() })
      });
      setCheckinFeedback({
        type: 'success',
        data: res
      });
      setCheckinCode('');
      // If the inspected session is current, reload roster
      if (selectedSessionId) {
        loadRoster(selectedSessionId);
      }
    } catch (err) {
      setCheckinFeedback({
        type: 'error',
        message: err.message || 'Check-in validation failed'
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle roster load
  const loadRoster = async (sessionId) => {
    if (!sessionId) {
      setRoster([]);
      return;
    }
    setLoadingRoster(true);
    setRosterFeedback(null);

    try {
      const data = await api(`/api/sessions/${sessionId}/bookings`);
      setRoster(data.bookings || []);
    } catch (err) {
      setRosterFeedback(err.message || 'Failed to retrieve roster');
    } finally {
      setLoadingRoster(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--neon-lime)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          <ShieldCheck size={14} /> Administrative Console
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--pure-white)' }}>
          Gym Operations Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Manage gym schedule, validate turnstile check-in codes in real-time, and inspect attendee rosters.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--charcoal-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Administrative Role</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--neon-lime)', marginTop: '0.5rem' }}>Gym Staff</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Privileged Operations Active</div>
        </div>

        <div style={{ background: 'var(--charcoal-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Capacity Rule</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--pure-white)', marginTop: '0.5rem' }}>20 Seats</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Hard Concurrency Limit (Atomic Transactions)</div>
        </div>

        <div style={{ background: 'var(--charcoal-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Turnstile Window</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.5rem' }}>60 Min</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Session Hour Redemption Only</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* 1. Create Session Section */}
        <section style={{ background: 'var(--charcoal-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-lime)' }}>
              <CalendarPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                1. Schedule New Session
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Create a slot for members to reserve</p>
            </div>
          </div>

          {createFeedback && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: createFeedback.type === 'success' ? 'rgba(204,255,0,0.1)' : 'rgba(255,59,48,0.12)',
                border: `1px solid ${createFeedback.type === 'success' ? 'rgba(204,255,0,0.3)' : 'rgba(255,59,48,0.35)'}`,
                color: createFeedback.type === 'success' ? 'var(--neon-lime)' : 'var(--status-crimson)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              {createFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{createFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleCreateSession}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Session Date
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--obsidian-deep)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--pure-white)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Start Hour (0 to 23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="e.g. 10 for 10:00"
                  required
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--obsidian-deep)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--pure-white)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
              Capacity is automatically fixed at 20 athletes per policy.
            </p>

            <button
              type="submit"
              disabled={creating}
              className="neon-button"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: creating ? 'not-allowed' : 'pointer'
              }}
            >
              {creating ? 'Publishing...' : 'Publish Session Slot →'}
            </button>
          </form>
        </section>

        {/* 2. Check-in Section */}
        <section style={{ background: 'var(--charcoal-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <QrCode size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                2. Turnstile Code Validation
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Admit athlete during their 1-hour window</p>
            </div>
          </div>

          {checkinFeedback && checkinFeedback.type === 'error' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255,59,48,0.12)',
                border: '1px solid rgba(255,59,48,0.35)',
                color: 'var(--status-crimson)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <AlertTriangle size={16} />
              <span>{checkinFeedback.message}</span>
            </div>
          )}

          {checkinFeedback && checkinFeedback.type === 'success' && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                background: 'rgba(204,255,0,0.1)',
                border: '1px solid rgba(204,255,0,0.35)',
                color: 'var(--pure-white)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-lime)', fontWeight: 800, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={16} /> Attendance Confirmed
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{checkinFeedback.data.member.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{checkinFeedback.data.member.email}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--neon-lime)' }}>
                Session: {checkinFeedback.data.session.session_date} @ {String(checkinFeedback.data.session.start_hour).padStart(2, '0')}:00
              </div>
            </div>
          )}

          <form onSubmit={handleCheckin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                6-Character Short Code
              </label>
              <input
                type="text"
                placeholder="e.g. 7A4B2C"
                required
                maxLength={10}
                value={checkinCode}
                onChange={(e) => setCheckinCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: 'var(--obsidian-deep)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--neon-lime)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  outline: 'none'
                }}
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
              Valid only within the scheduled session's 1-hour active window.
            </p>

            <button
              type="submit"
              disabled={checkingIn}
              className="btn-outline-hover"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: checkingIn ? 'not-allowed' : 'pointer'
              }}
            >
              {checkingIn ? 'Verifying...' : 'Verify & Admit Athlete →'}
            </button>
          </form>
        </section>
      </div>

      {/* 3. Session Roster & Attendance */}
      <section style={{ background: 'var(--charcoal-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pure-white)' }}>
              <Users size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                3. Session Roster & Attendance
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Inspect athlete bookings and attendance per session</p>
            </div>
          </div>

          <div style={{ minWidth: '280px' }}>
            <select
              value={selectedSessionId}
              onChange={(e) => {
                setSelectedSessionId(e.target.value);
                loadRoster(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--obsidian-deep)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--pure-white)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Choose a scheduled session --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.session_date} @ {String(s.start_hour).padStart(2, '0')}:00 ({s.seats_remaining} slots remaining)
                </option>
              ))}
            </select>
          </div>
        </div>

        {rosterFeedback && (
          <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', color: 'var(--status-crimson)', fontSize: '0.85rem' }}>
            {rosterFeedback}
          </div>
        )}

        {loadingRoster ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <p>Loading session roster...</p>
          </div>
        ) : !selectedSessionId ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            Please select a scheduled session above to load its attendee roster.
          </div>
        ) : roster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            No confirmed athletes for this session yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Athlete Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Email Address</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Booking Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Turnstile Code</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Admitted</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((b) => (
                  <tr key={b.id || b.booking_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--pure-white)' }}>
                      {b.member_name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {b.member_email}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ display: 'inline-flex', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, background: b.status === 'confirmed' ? 'rgba(204,255,0,0.1)' : 'rgba(255,59,48,0.1)', color: b.status === 'confirmed' ? 'var(--neon-lime)' : 'var(--status-crimson)' }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--neon-lime)', letterSpacing: '0.1em' }}>
                        {b.check_in_code}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {b.is_checked_in === 1 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                          <CheckCircle2 size={12} /> Yes
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
