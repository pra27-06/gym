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
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.75rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          <ShieldCheck size={14} /> Staff Operations Console
        </div>
        <h1 className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--pure-white)' }}>
          Gym Floor Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Schedule 60-minute training windows, validate turnstile entry codes at the front desk, and inspect live attendee rosters.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="surface-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)' }}>Operational Role</div>
          <div className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--neon-lime)', marginTop: '0.35rem' }}>Gym Staff / Admin</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Privileged Operations Active</div>
        </div>

        <div className="surface-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)' }}>Concurrency Rule</div>
          <div className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--pure-white)', marginTop: '0.35rem' }}>20 Athletes Max</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Hard Concurrency Limit (Atomic Transactions)</div>
        </div>

        <div className="surface-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)' }}>Turnstile Window</div>
          <div className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.35rem' }}>60 Minutes</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Redemption allowed only during session hour</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* 1. Create Session Section */}
        <section className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: 'var(--neon-lime-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-lime)' }}>
              <CalendarPlus size={18} />
            </div>
            <div>
              <h2 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                Schedule New Training Slot
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Publish an open 60-minute window for athletes</p>
            </div>
          </div>

          {createFeedback && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: createFeedback.type === 'success' ? 'var(--emerald-dim)' : 'var(--crimson-dim)',
                border: `1px solid ${createFeedback.type === 'success' ? 'var(--emerald-border)' : 'var(--crimson-border)'}`,
                color: createFeedback.type === 'success' ? '#6ee7b7' : '#f87171',
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                  Session Date
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                  Start Hour (0 to 23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="e.g. 10 for 10:00 AM"
                  required
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
              Capacity is automatically fixed at 20 athletes per gym floor policy.
            </p>

            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {creating ? 'Publishing...' : 'Publish Session Slot →'}
            </button>
          </form>
        </section>

        {/* 2. Check-in Section */}
        <section className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                Front Desk Turnstile Check-In
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Admit athlete during their scheduled session hour</p>
            </div>
          </div>

          {checkinFeedback && checkinFeedback.type === 'error' && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--crimson-dim)',
                border: '1px solid var(--crimson-border)',
                color: '#f87171',
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
                background: 'var(--emerald-dim)',
                border: '1px solid var(--emerald-border)',
                color: 'var(--pure-white)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={16} /> Attendance Verified & Confirmed
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{checkinFeedback.data.member.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{checkinFeedback.data.member.email}</div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--neon-lime)', fontWeight: 600 }}>
                Session: {checkinFeedback.data.session.session_date} @ {String(checkinFeedback.data.session.start_hour).padStart(2, '0')}:00
              </div>
            </div>
          )}

          <form onSubmit={handleCheckin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                6-Character Turnstile Pass Code
              </label>
              <input
                type="text"
                placeholder="e.g. 7A4B2C"
                required
                maxLength={10}
                value={checkinCode}
                onChange={(e) => setCheckinCode(e.target.value)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--neon-lime)'
                }}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
              Redemption allowed strictly during the scheduled session's 1-hour active window.
            </p>

            <button
              type="submit"
              disabled={checkingIn}
              className="btn-secondary"
              style={{
                width: '100%',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8'
              }}
            >
              {checkingIn ? 'Verifying...' : 'Verify & Admit Athlete →'}
            </button>
          </form>
        </section>
      </div>

      {/* 3. Session Roster & Attendance */}
      <section className="surface-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: 'var(--graphite-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pure-white)' }}>
              <Users size={18} />
            </div>
            <div>
              <h2 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                Session Roster & Attendance
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Inspect athlete bookings and attendance per session</p>
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
                cursor: 'pointer'
              }}
            >
              <option value="">-- Choose a scheduled session --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.session_date} @ {String(s.start_hour).padStart(2, '0')}:00 ({s.seats_remaining} slots open)
                </option>
              ))}
            </select>
          </div>
        </div>

        {rosterFeedback && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', background: 'var(--crimson-dim)', border: '1px solid var(--crimson-border)', color: '#f87171', fontSize: '0.85rem' }}>
            {rosterFeedback}
          </div>
        )}

        {loadingRoster ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <p style={{ fontWeight: 600 }}>Loading attendee roster...</p>
          </div>
        ) : !selectedSessionId ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            Select a session from the dropdown above to inspect its attendee roster.
          </div>
        ) : roster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            No confirmed athletes for this session yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>Athlete Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>Email Address</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>Turnstile Pass</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>Admitted</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((b) => (
                  <tr key={b.id || b.booking_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--pure-white)' }}>
                      {b.member_name}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)' }}>
                      {b.member_email}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span className="badge-chip" style={{ background: b.status === 'confirmed' ? 'var(--emerald-dim)' : 'var(--crimson-dim)', color: b.status === 'confirmed' ? '#34d399' : '#f87171' }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span className="font-mono" style={{ fontWeight: 800, color: 'var(--neon-lime)', letterSpacing: '0.08em' }}>
                        {b.check_in_code}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {b.is_checked_in === 1 ? (
                        <span className="badge-chip" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
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
