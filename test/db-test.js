const assert = require('assert');
const { db, initDb } = require('../src/db');
const { seed } = require('../src/seed');

console.log('Running Database Schema & Seed Verification Tests...');

// 1. Run seed
seed();

// Test 1: Verify users exist
const admin = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
assert(admin, 'Admin account must exist');
assert.strictEqual(admin.email, 'admin@gym.com');

const members = db.prepare("SELECT * FROM users WHERE role = 'member'").all();
assert(members.length >= 2, 'At least 2 member accounts must exist');

// Test 2: Verify sessions exist across multiple days
const sessions = db.prepare("SELECT * FROM sessions").all();
assert(sessions.length >= 3, 'Sessions across multiple days must exist');

// Test 3: Verify EXACTLY one session is full (20 confirmed bookings)
const fullSessionBookings = db.prepare(`
  SELECT session_id, COUNT(*) as count 
  FROM bookings 
  WHERE status = 'confirmed' 
  GROUP BY session_id 
  HAVING count = 20
`).all();

assert.strictEqual(fullSessionBookings.length, 1, 'There must be exactly one session with 20 confirmed bookings');
console.log('✓ Seed data verified: 1 full session with 20 confirmed bookings found.');

// Test 4: Constraint test - Duplicate Email should fail
assert.throws(() => {
  db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES ('Dup', 'admin@gym.com', 'hash', 'member')").run();
}, /UNIQUE constraint failed: users.email/, 'Duplicate email must be rejected by database');
console.log('✓ Constraint verified: Duplicate email rejected.');

// Test 5: Constraint test - Duplicate Session Time should fail
assert.throws(() => {
  const existingSession = sessions[0];
  db.prepare("INSERT INTO sessions (session_date, start_hour, capacity) VALUES (?, ?, 20)").run(
    existingSession.session_date,
    existingSession.start_hour
  );
}, /UNIQUE constraint failed: sessions.session_date, sessions.start_hour/, 'Duplicate session start time must be rejected');
console.log('✓ Constraint verified: Duplicate session start time rejected.');

// Test 6: Constraint test - Waitlist uniqueness per member per session
const testUser = members[0];
const targetSession = sessions[0];
db.prepare("INSERT INTO waitlist_entries (user_id, session_id) VALUES (?, ?)").run(testUser.id, targetSession.id);

assert.throws(() => {
  db.prepare("INSERT INTO waitlist_entries (user_id, session_id) VALUES (?, ?)").run(testUser.id, targetSession.id);
}, /UNIQUE constraint failed: waitlist_entries.user_id, waitlist_entries.session_id/, 'User cannot join waitlist twice for same session');
console.log('✓ Constraint verified: Duplicate waitlist entry rejected.');

// Clean up test waitlist entry
db.prepare("DELETE FROM waitlist_entries WHERE user_id = ? AND session_id = ?").run(testUser.id, targetSession.id);

console.log('ALL SCHEMA AND SEED TESTS PASSED SUCCESSFULLY!');
