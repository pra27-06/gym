const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const fs = require('fs');
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'gym.db');

// Ensure database directory exists (vital for persistent disk mount paths like /var/data)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('member', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_date TEXT NOT NULL, -- Format: YYYY-MM-DD
      start_hour INTEGER NOT NULL CHECK(start_hour >= 0 AND start_hour <= 23),
      capacity INTEGER NOT NULL DEFAULT 20,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_date, start_hour)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('confirmed', 'cancelled')),
      check_in_code TEXT NOT NULL UNIQUE,
      is_checked_in INTEGER NOT NULL DEFAULT 0 CHECK(is_checked_in IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, session_id)
    );
  `);
}

module.exports = { db, initDb };
