const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db, initDb } = require('./db');

function generateShortCode() {
  // 6 uppercase alphanumeric characters, non-guessable
  return crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
}

function seed(force = false) {
  initDb();

  const isForced = force || process.argv.includes('--force') || process.env.NODE_ENV === 'test';
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (!isForced && existingUsers && existingUsers.count > 0) {
    console.log('Database already initialized with data. Skipping destructive re-seed.');
    return;
  }

  // Clear existing data in reverse order of foreign keys
  db.exec(`
    DELETE FROM waitlist_entries;
    DELETE FROM bookings;
    DELETE FROM sessions;
    DELETE FROM users;
  `);

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Create Admin (Admins are created directly in the DB, never via public registration)
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
  `);

  const adminResult = insertUser.run('Gym Manager', 'admin@gym.com', passwordHash, 'admin');
  const adminId = adminResult.lastInsertRowid;

  // 2. Create Members
  const memberAlice = insertUser.run('Alice Member', 'alice@gym.com', passwordHash, 'member');
  const memberBob = insertUser.run('Bob Member', 'bob@gym.com', passwordHash, 'member');

  // Create 20 extra dummy members to fill one session completely
  const dummyMemberIds = [];
  for (let i = 1; i <= 20; i++) {
    const res = insertUser.run(`Test User ${i}`, `testuser${i}@gym.com`, passwordHash, 'member');
    dummyMemberIds.push(res.lastInsertRowid);
  }

  // 3. Create Sessions across multiple upcoming days
  const insertSession = db.prepare(`
    INSERT INTO sessions (session_date, start_hour, capacity) VALUES (?, ?, ?)
  `);

  // Helper to format date YYYY-MM-DD
  const today = new Date();
  const formatDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const day1 = formatDate(1); // Tomorrow
  const day2 = formatDate(2); // Day after tomorrow
  const day3 = formatDate(3);

  // Session 1: Tomorrow 09:00 - OPEN (5 bookings)
  const s1 = insertSession.run(day1, 9, 20).lastInsertRowid;
  // Session 2: Tomorrow 11:00 - FULL (exactly 20 confirmed bookings)
  const s2Full = insertSession.run(day1, 11, 20).lastInsertRowid;
  // Session 3: Day 2 10:00 - OPEN (empty)
  const s3 = insertSession.run(day2, 10, 20).lastInsertRowid;
  // Session 4: Day 3 14:00 - OPEN (1 booking)
  const s4 = insertSession.run(day3, 14, 20).lastInsertRowid;

  // 4. Fill Session 2 with EXACTLY 20 confirmed bookings
  const insertBooking = db.prepare(`
    INSERT INTO bookings (user_id, session_id, status, check_in_code, is_checked_in)
    VALUES (?, ?, 'confirmed', ?, 0)
  `);

  for (let i = 0; i < 20; i++) {
    insertBooking.run(dummyMemberIds[i], s2Full, generateShortCode());
  }

  // Add 1 booking for Alice in Session 1
  insertBooking.run(memberAlice.lastInsertRowid, s1, generateShortCode());

  console.log('Database seeded successfully:');
  console.log(`- Admin: admin@gym.com / password123`);
  console.log(`- Member Alice: alice@gym.com / password123`);
  console.log(`- Member Bob: bob@gym.com / password123`);
  console.log(`- Created 4 sessions across 3 days.`);
  console.log(`- Session ID ${s2Full} (${day1} at 11:00) has exactly 20 confirmed bookings (FULL).`);
}

if (require.main === module) {
  seed();
}

module.exports = { seed, generateShortCode };
