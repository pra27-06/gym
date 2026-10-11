const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const { db } = require('../src/db');
const { seed } = require('../src/seed');

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runMilestone4Tests() {
  console.log('Running Milestone 4 Check-in Verification Tests...');

  seed();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  try {
    // 1. Log in admin & alice
    const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@gym.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    const aliceLogin = await request('POST', '/api/auth/login', { email: 'alice@gym.com', password: 'password123' });
    const aliceToken = aliceLogin.body.token;

    // Pick an existing confirmed booking from seed
    const aliceBooking = db.prepare(`
      SELECT b.*, s.session_date, s.start_hour 
      FROM bookings b
      JOIN sessions s ON b.session_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE u.email = 'alice@gym.com' AND b.status = 'confirmed'
    `).get();

    assert(aliceBooking, 'Alice should have a confirmed booking from seed');
    const validCode = aliceBooking.check_in_code;
    const sessionDate = aliceBooking.session_date;
    const startHour = aliceBooking.start_hour;

    // Boundary timestamps
    const beforeSessionTime = `${sessionDate}T${String(startHour - 1).padStart(2, '0')}:59:59`;
    const exactStartTime = `${sessionDate}T${String(startHour).padStart(2, '0')}:00:00`;
    const midSessionTime = `${sessionDate}T${String(startHour).padStart(2, '0')}:30:00`;
    const exactEndTime = `${sessionDate}T${String(startHour + 1).padStart(2, '0')}:00:00`; // After 1 hr
    const afterSessionTime = `${sessionDate}T${String(startHour + 1).padStart(2, '0')}:15:00`;

    // Test 1: Non-admin (Member) cannot check in (403 Forbidden)
    const memberCheckinRes = await request('POST', '/api/admin/check-in', {
      code: validCode,
      test_timestamp: midSessionTime
    }, aliceToken);
    assert.strictEqual(memberCheckinRes.status, 403);
    console.log('✓ Test 1: Member forbidden from checking in (403)');

    // Test 2: Invalid/non-existent check-in code (404)
    const invalidCodeRes = await request('POST', '/api/admin/check-in', {
      code: 'FAKEXX',
      test_timestamp: midSessionTime
    }, adminToken);
    assert.strictEqual(invalidCodeRes.status, 404);
    assert.strictEqual(invalidCodeRes.body.error, 'Invalid check-in code');
    console.log('✓ Test 2: Non-existent check-in code rejected with 404');

    // Test 3: Check-in before session start time (400)
    const earlyCheckinRes = await request('POST', '/api/admin/check-in', {
      code: validCode,
      test_timestamp: beforeSessionTime
    }, adminToken);
    assert.strictEqual(earlyCheckinRes.status, 400);
    assert.strictEqual(earlyCheckinRes.body.error, 'Check-in is only allowed during the session hour');
    console.log('✓ Test 3: Early check-in rejected (before session hour)');

    // Test 4: Check-in after session has ended (400)
    const lateCheckinRes = await request('POST', '/api/admin/check-in', {
      code: validCode,
      test_timestamp: afterSessionTime
    }, adminToken);
    assert.strictEqual(lateCheckinRes.status, 400);
    assert.strictEqual(lateCheckinRes.body.error, 'Check-in is only allowed during the session hour');
    console.log('✓ Test 4: Late check-in rejected (after session hour)');

    // Test 5: Check-in at exact 1-hour expiration boundary (400)
    const boundaryCheckinRes = await request('POST', '/api/admin/check-in', {
      code: validCode,
      test_timestamp: exactEndTime
    }, adminToken);
    assert.strictEqual(boundaryCheckinRes.status, 400);
    console.log('✓ Test 5: Check-in at exact end boundary (1 hr later) rejected');

    // Test 6: Successful check-in during valid hour window (200 OK)
    const successRes = await request('POST', '/api/admin/check-in', {
      code: validCode,
      test_timestamp: midSessionTime
    }, adminToken);
    assert.strictEqual(successRes.status, 200);
    assert.strictEqual(successRes.body.member.name, 'Alice Member');
    assert.strictEqual(successRes.body.member.email, 'alice@gym.com');
    console.log('✓ Test 6: Check-in successful during session hour and returned member details');

    // Test 7: Code works once only (repeated check-in returns 409 Conflict)
    const repeatRes = await request('POST', '/api/admin/check-in', {
      code: validCode,
      test_timestamp: midSessionTime
    }, adminToken);
    assert.strictEqual(repeatRes.status, 409);
    assert.strictEqual(repeatRes.body.error, 'This booking has already been checked in');
    console.log('✓ Test 7: Repeated check-in with same code rejected with 409 Conflict');

    // Test 8: Cancelled booking cannot be checked in (400)
    // Create a new booking, cancel it, then attempt check-in
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 4);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const sessRes = await request('POST', '/api/sessions', { session_date: dateStr, start_hour: 16 }, adminToken);
    const newSessId = sessRes.body.session.id;

    const newBookRes = await request('POST', '/api/bookings', { session_id: newSessId }, aliceToken);
    const newBookingId = newBookRes.body.booking.id;
    const cancelledCode = newBookRes.body.booking.check_in_code;

    // Alice cancels
    await request('POST', `/api/bookings/${newBookingId}/cancel`, null, aliceToken);

    // Admin attempts check-in
    const cancelledCheckinRes = await request('POST', '/api/admin/check-in', {
      code: cancelledCode,
      test_timestamp: `${dateStr}T16:20:00`
    }, adminToken);
    assert.strictEqual(cancelledCheckinRes.status, 400);
    assert.strictEqual(cancelledCheckinRes.body.error, 'Cannot check in a cancelled booking');
    console.log('✓ Test 8: Check-in on cancelled booking rejected');

    console.log('\nALL MILESTONE 4 TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runMilestone4Tests().catch(err => {
  console.error('Milestone 4 Test execution failed:', err);
  process.exit(1);
});
