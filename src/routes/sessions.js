const express = require('express');
const { db } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper to check if a session date and start hour are in the past
function isSessionInPast(sessionDate, startHour) {
  const sessionDateTime = new Date(`${sessionDate}T${String(startHour).padStart(2, '0')}:00:00`);
  return sessionDateTime <= new Date();
}

// POST /api/sessions (Admin only)
// Rules:
// - Date and start hour on the hour (0-23).
// - Capacity fixed at 20.
// - Two sessions cannot share a start time (reject with 409).
router.post('/', authenticate, requireAdmin, (req, res, next) => {
  try {
    const { session_date, start_hour } = req.body;

    if (!session_date || typeof session_date !== 'string') {
      return res.status(400).json({ error: 'Valid session_date (YYYY-MM-DD) is required' });
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(session_date)) {
      return res.status(400).json({ error: 'session_date must be in YYYY-MM-DD format' });
    }

    const hour = parseInt(start_hour, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return res.status(400).json({ error: 'start_hour must be an integer between 0 and 23' });
    }

    // Check collision / duplicate slot
    const existing = db.prepare(`
      SELECT id FROM sessions WHERE session_date = ? AND start_hour = ?
    `).get(session_date, hour);

    if (existing) {
      return res.status(409).json({ error: 'A session already exists at this date and time' });
    }

    const insert = db.prepare(`
      INSERT INTO sessions (session_date, start_hour, capacity)
      VALUES (?, ?, 20)
    `);

    const result = insert.run(session_date, hour);

    return res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: result.lastInsertRowid,
        session_date,
        start_hour: hour,
        capacity: 20
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions (Any authenticated user)
// Rules:
// - Browse sessions with seats remaining.
// - Filter by date (?date=YYYY-MM-DD).
router.get('/', authenticate, (req, res, next) => {
  try {
    const { date } = req.query;

    let query = `
      SELECT 
        s.id,
        s.session_date,
        s.start_hour,
        s.capacity,
        s.created_at,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_count,
        (s.capacity - COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END)) as seats_remaining
      FROM sessions s
      LEFT JOIN bookings b ON s.id = b.session_id
    `;

    const params = [];

    if (date) {
      query += ` WHERE s.session_date = ? `;
      params.push(date);
    }

    query += `
      GROUP BY s.id
      ORDER BY s.session_date ASC, s.start_hour ASC
    `;

    const sessions = db.prepare(query).all(...params);

    // Also attach whether current user is booked or waitlisted on each session
    const userBookings = db.prepare(`
      SELECT session_id, id as booking_id, status 
      FROM bookings 
      WHERE user_id = ? AND status = 'confirmed'
    `).all(req.user.id);

    const userWaitlist = db.prepare(`
      SELECT session_id 
      FROM waitlist_entries 
      WHERE user_id = ?
    `).all(req.user.id);

    const bookedMap = new Set(userBookings.map(b => b.session_id));
    const waitlistMap = new Set(userWaitlist.map(w => w.session_id));

    const enrichedSessions = sessions.map(s => ({
      ...s,
      is_booked_by_user: bookedMap.has(s.id),
      is_waitlisted_by_user: waitlistMap.has(s.id)
    }));

    return res.json({ sessions: enrichedSessions });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id/bookings (Admin only)
// Rule: Admins see all bookings for a session.
router.get('/:id/bookings', authenticate, requireAdmin, (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const bookings = db.prepare(`
      SELECT 
        b.id,
        b.user_id,
        u.name as member_name,
        u.email as member_email,
        b.status,
        b.check_in_code,
        b.is_checked_in,
        b.created_at
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.session_id = ?
      ORDER BY b.created_at ASC
    `).all(sessionId);

    return res.json({ session, bookings });
  } catch (err) {
    next(err);
  }
});

module.exports = { router, isSessionInPast };
