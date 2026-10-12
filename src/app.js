const express = require('express');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const { router: sessionsRoutes } = require('./routes/sessions');
const bookingsRoutes = require('./routes/bookings');
const { router: adminRoutes } = require('./routes/admin');
const { authenticate, requireAdmin } = require('./middleware/auth');

const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize DB schema
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);

// Protected test route for admin check verification
app.get('/api/admin/ping', authenticate, requireAdmin, (req, res) => {
  res.json({ message: 'Admin access verified', admin: req.user });
});

// Protected test route for member check verification
app.get('/api/member/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
// Rule: The API never crashes or leaks stack traces. One consistent JSON error format.
app.use((err, req, res, next) => {
  console.error('[Error caught by global handler]:', err.message);
  
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ error: message });
});

module.exports = app;
