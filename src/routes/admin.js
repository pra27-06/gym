const express = require('express');
const { db } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * Helper to check if a reference timestamp falls within a session's 1-hour window.
 * Session window: [sessionStart, sessionStart + 1 hour)
 */
function isWithinSessionHour(sessionDate, startHour, nowTimestamp = new Date()) {
  const sessionStart = new Date(`${sessionDate}T${String(startHour).padStart(2, '0')}:00:00`);
  const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000); // 1 hour later

  return nowTimestamp >= sessionStart && nowTimestamp < sessionEnd;
}

// POST /api/admin/check-in
// Rules:
// - Admin types the code in to mark that member present, and sees whose booking it is.
// - A code works once, only during its session's hour, and never for a cancelled booking.
// - Supports optional `test_timestamp` for automated testing of time boundaries.
router.post('/check-in', authenticate, requireAdmin, (req, res, next) => {
  try {
    const { code, test_timestamp } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ error: 'Check-in code is required' });
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Fetch booking with session and member information
    const booking = db.prepare(`
      SELECT 
        b.id,
        b.status,
        b.is_checked_in,
        b.session_id,
        s.session_date,
        s.start_hour,
        u.name as member_name,
        u.email as member_email
      FROM bookings b
      JOIN sessions s ON b.session_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.check_in_code = ?
    `).get(cleanCode);

    if (!booking) {
      return res.status(404).json({ error: 'Invalid check-in code' });
    }

    // 2. Rule: Never for a cancelled booking
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot check in a cancelled booking' });
    }

    // 3. Rule: A code works once
    if (booking.is_checked_in === 1) {
      return res.status(409).json({ error: 'This booking has already been checked in' });
    }

    // 4. Rule: Only during its session's hour
    const checkTime = test_timestamp ? new Date(test_timestamp) : new Date();
    if (!isWithinSessionHour(booking.session_date, booking.start_hour, checkTime)) {
      return res.status(400).json({ 
        error: 'Check-in is only allowed during the session hour' 
      });
    }

    // 5. Mark as checked in
    db.prepare('UPDATE bookings SET is_checked_in = 1 WHERE id = ?').run(booking.id);

    return res.status(200).json({
      message: 'Check-in successful',
      member: {
        name: booking.member_name,
        email: booking.member_email
      },
      session: {
        session_date: booking.session_date,
        start_hour: booking.start_hour
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { router, isWithinSessionHour };
