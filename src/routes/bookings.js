const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');
const { generateShortCode } = require('../seed');
const { isSessionInPast } = require('./sessions');

const router = express.Router();

// POST /api/bookings
// Rules:
// - A member books a session that has not started and has a free seat.
// - Concurrency requirement: A session never exceeds 20 confirmed bookings,
//   even when two people take the last seat at the same moment.
// - One active booking per member per session.
router.post('/', authenticate, (req, res, next) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    // Run booking within an SQLite TRANSACTION (IMMEDIATE locks write access to prevent race conditions)
    const bookTransaction = db.transaction(() => {
      // 1. Fetch session
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session_id);
      if (!session) {
        const err = new Error('Session not found');
        err.status = 404;
        throw err;
      }

      // 2. Check if session has already started
      if (isSessionInPast(session.session_date, session.start_hour)) {
        const err = new Error('Cannot book a session that has already started');
        err.status = 400;
        throw err;
      }

      // 3. Check if user already has an active confirmed booking for this session
      const existingBooking = db.prepare(`
        SELECT id FROM bookings 
        WHERE user_id = ? AND session_id = ? AND status = 'confirmed'
      `).get(req.user.id, session_id);

      if (existingBooking) {
        const err = new Error('You already have an active booking for this session');
        err.status = 409;
        throw err;
      }

      // 4. Count current confirmed bookings
      const countResult = db.prepare(`
        SELECT COUNT(*) as count FROM bookings 
        WHERE session_id = ? AND status = 'confirmed'
      `).get(session_id);

      if (countResult.count >= session.capacity) {
        const err = new Error('Session is full. You may join the waitlist instead.');
        err.status = 409;
        throw err;
      }

      // 5. Generate unique non-guessable code
      let code;
      let isCodeUnique = false;
      while (!isCodeUnique) {
        code = generateShortCode();
        const codeExists = db.prepare('SELECT id FROM bookings WHERE check_in_code = ?').get(code);
        if (!codeExists) isCodeUnique = true;
      }

      // 6. Insert confirmed booking
      const insertResult = db.prepare(`
        INSERT INTO bookings (user_id, session_id, status, check_in_code, is_checked_in)
        VALUES (?, ?, 'confirmed', ?, 0)
      `).run(req.user.id, session_id, code);

      // 7. If user was on the waitlist for this session, remove them
      db.prepare(`
        DELETE FROM waitlist_entries WHERE user_id = ? AND session_id = ?
      `).run(req.user.id, session_id);

      return {
        id: insertResult.lastInsertRowid,
        session_id,
        status: 'confirmed',
        check_in_code: code
      };
    });

    const booking = bookTransaction();

    return res.status(201).json({
      message: 'Booking confirmed',
      booking
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/my
// Rule: Members see only their own bookings.
router.get('/my', authenticate, (req, res, next) => {
  try {
    const bookings = db.prepare(`
      SELECT 
        b.id,
        b.session_id,
        s.session_date,
        s.start_hour,
        b.status,
        b.check_in_code,
        b.is_checked_in,
        b.created_at
      FROM bookings b
      JOIN sessions s ON b.session_id = s.id
      WHERE b.user_id = ?
      ORDER BY s.session_date ASC, s.start_hour ASC
    `).all(req.user.id);

    return res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/cancel
// Rules:
// - A member can cancel until the session starts, and can rebook later if seats remain.
// - When someone cancels, the first person on the waitlist is booked automatically and their place on the list is released.
// - Nobody is promoted into a session that has already started.
// - Ownership check: A member can only cancel their own booking.
router.post('/:id/cancel', authenticate, (req, res, next) => {
  try {
    const bookingId = req.params.id;

    const cancelTransaction = db.transaction(() => {
      // 1. Fetch booking
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
      if (!booking) {
        const err = new Error('Booking not found');
        err.status = 404;
        throw err;
      }

      // 2. Ownership check
      if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
        const err = new Error('You can only cancel your own bookings');
        err.status = 403;
        throw err;
      }

      if (booking.status === 'cancelled') {
        const err = new Error('Booking is already cancelled');
        err.status = 400;
        throw err;
      }

      // 3. Fetch session
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(booking.session_id);

      // 4. Verify session has not started
      if (isSessionInPast(session.session_date, session.start_hour)) {
        const err = new Error('Cannot cancel a booking for a session that has already started');
        err.status = 400;
        throw err;
      }

      // 5. Mark booking as cancelled
      db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(bookingId);

      // 6. Automatic Waitlist Promotion (FIFO)
      // Rule: Nobody is promoted into a session that has already started (already guarded by check 4)
      const nextWaitlistEntry = db.prepare(`
        SELECT * FROM waitlist_entries 
        WHERE session_id = ? 
        ORDER BY created_at ASC 
        LIMIT 1
      `).get(booking.session_id);

      let promotedUser = null;

      if (nextWaitlistEntry) {
        // Generate code for promoted member
        let code;
        let isCodeUnique = false;
        while (!isCodeUnique) {
          code = generateShortCode();
          const codeExists = db.prepare('SELECT id FROM bookings WHERE check_in_code = ?').get(code);
          if (!codeExists) isCodeUnique = true;
        }

        // Insert confirmed booking for waitlisted user
        db.prepare(`
          INSERT INTO bookings (user_id, session_id, status, check_in_code, is_checked_in)
          VALUES (?, ?, 'confirmed', ?, 0)
        `).run(nextWaitlistEntry.user_id, booking.session_id, code);

        // Remove from waitlist
        db.prepare('DELETE FROM waitlist_entries WHERE id = ?').run(nextWaitlistEntry.id);

        promotedUser = nextWaitlistEntry.user_id;
      }

      return { promotedUser };
    });

    const result = cancelTransaction();

    return res.json({
      message: 'Booking cancelled successfully',
      promoted_user_id: result.promotedUser
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/waitlist
// Rules:
// - When a session is full, a member can join its waitlist instead.
// - A member cannot be on it twice for the same session.
router.post('/waitlist', authenticate, (req, res, next) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session_id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (isSessionInPast(session.session_date, session.start_hour)) {
      return res.status(400).json({ error: 'Cannot join waitlist for a session that has already started' });
    }

    // Check if user is already confirmed for this session
    const activeBooking = db.prepare(`
      SELECT id FROM bookings WHERE user_id = ? AND session_id = ? AND status = 'confirmed'
    `).get(req.user.id, session_id);

    if (activeBooking) {
      return res.status(409).json({ error: 'You already have an active booking for this session' });
    }

    // Check if user is already on waitlist
    const existingWaitlist = db.prepare(`
      SELECT id FROM waitlist_entries WHERE user_id = ? AND session_id = ?
    `).get(req.user.id, session_id);

    if (existingWaitlist) {
      return res.status(409).json({ error: 'You are already on the waitlist for this session' });
    }

    // Check if session is indeed full
    const confirmedCount = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE session_id = ? AND status = 'confirmed'
    `).get(session_id).count;

    if (confirmedCount < session.capacity) {
      return res.status(400).json({ error: 'Session is not full yet. Please book directly.' });
    }

    const result = db.prepare(`
      INSERT INTO waitlist_entries (user_id, session_id) VALUES (?, ?)
    `).run(req.user.id, session_id);

    return res.status(201).json({
      message: 'Joined waitlist successfully',
      waitlist_id: result.lastInsertRowid
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/waitlist/:sessionId
// Rule: A member can leave the waitlist.
router.delete('/waitlist/:sessionId', authenticate, (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;

    const result = db.prepare(`
      DELETE FROM waitlist_entries WHERE user_id = ? AND session_id = ?
    `).run(req.user.id, sessionId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Waitlist entry not found' });
    }

    return res.json({ message: 'Removed from waitlist' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
