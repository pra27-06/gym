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

async function runE2EJourney() {
  console.log('Running End-to-End User Journey & Concurrency Stress Test...');

  seed();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  try {
    // 1. Admin logs in
    const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@gym.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    // 2. Admin creates a new session for testing
    const today = new Date();
    const testDate = new Date(today);
    testDate.setDate(today.getDate() + 7);
    const dateStr = testDate.toISOString().split('T')[0];

    const sessRes = await request('POST', '/api/sessions', { session_date: dateStr, start_hour: 18 }, adminToken);
    assert.strictEqual(sessRes.status, 201);
    const sessionId = sessRes.body.session.id;
    console.log(`✓ E2E Step 1: Admin created new session ID ${sessionId}`);

    // 3. Register 22 new distinct members
    const memberTokens = [];
    for (let i = 1; i <= 22; i++) {
      const reg = await request('POST', '/api/auth/register', {
        name: `Runner ${i}`,
        email: `runner${i}@gym.com`,
        password: 'password123'
      });
      assert.strictEqual(reg.status, 201);
      memberTokens.push({ id: reg.body.user.id, token: reg.body.token });
    }
    console.log('✓ E2E Step 2: Registered 22 distinct member accounts');

    // 4. Fill first 19 seats sequentially
    for (let i = 0; i < 19; i++) {
      const bRes = await request('POST', '/api/bookings', { session_id: sessionId }, memberTokens[i].token);
      assert.strictEqual(bRes.status, 201);
    }
    console.log('✓ E2E Step 3: 19 seats booked successfully');

    // 5. Concurrency Race Condition Test:
    // Members 20, 21, and 22 simultaneously race to grab the 20th (last) seat!
    console.log('Testing simultaneous booking of the last seat (20th)...');
    const racePromises = [
      request('POST', '/api/bookings', { session_id: sessionId }, memberTokens[19].token),
      request('POST', '/api/bookings', { session_id: sessionId }, memberTokens[20].token),
      request('POST', '/api/bookings', { session_id: sessionId }, memberTokens[21].token)
    ];

    const raceResults = await Promise.all(racePromises);

    const successfulBookings = raceResults.filter(r => r.status === 201);
    const rejectedBookings = raceResults.filter(r => r.status === 409);

    assert.strictEqual(successfulBookings.length, 1, 'Exactly ONE racer must win the final 20th seat');
    assert.strictEqual(rejectedBookings.length, 2, 'The other racers must be rejected with 409 Conflict');
    console.log('✓ E2E Step 4: Race condition prevented! Exactly 1 booking succeeded for the final seat.');

    // 6. Verify total confirmed bookings is strictly 20 (never 21 or 22)
    const confirmedCount = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE session_id = ? AND status = 'confirmed'").get(sessionId).c;
    assert.strictEqual(confirmedCount, 20, 'Capacity must never exceed 20');
    console.log('✓ E2E Step 5: Database constraint maintained: Exactly 20 confirmed bookings.');

    // 7. The 2 losers join the waitlist
    const loser1 = memberTokens[20];
    const loser2 = memberTokens[21];

    const w1 = await request('POST', '/api/bookings/waitlist', { session_id: sessionId }, loser1.token);
    assert.strictEqual(w1.status, 201);
    const w2 = await request('POST', '/api/bookings/waitlist', { session_id: sessionId }, loser2.token);
    assert.strictEqual(w2.status, 201);
    console.log('✓ E2E Step 6: 2 members joined waitlist in FIFO order');

    // 8. One attendee cancels their booking
    const attendee1 = memberTokens[0];
    const attendee1Booking = db.prepare("SELECT id FROM bookings WHERE user_id = ? AND session_id = ?").get(attendee1.id, sessionId);

    const cancelRes = await request('POST', `/api/bookings/${attendee1Booking.id}/cancel`, null, attendee1.token);
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.body.promoted_user_id, loser1.id, 'Loser 1 was first on waitlist and must be promoted first');
    console.log('✓ E2E Step 7: FIFO waitlist auto-promoted the first waitlisted member on cancellation');

    // 9. Admin views all attendees for the session
    const adminView = await request('GET', `/api/sessions/${sessionId}/bookings`, null, adminToken);
    assert.strictEqual(adminView.status, 200);
    assert.strictEqual(adminView.body.bookings.filter(b => b.status === 'confirmed').length, 20);
    console.log('✓ E2E Step 8: Admin viewed full list of 20 attendees');

    // 10. Check-in during valid hour
    const promotedMemberBooking = adminView.body.bookings.find(b => b.user_id === loser1.id);
    assert(promotedMemberBooking, 'Promoted member must have active booking');

    const checkinRes = await request('POST', '/api/admin/check-in', {
      code: promotedMemberBooking.check_in_code,
      test_timestamp: `${dateStr}T18:15:00`
    }, adminToken);
    assert.strictEqual(checkinRes.status, 200);
    assert.strictEqual(checkinRes.body.member.email, 'runner21@gym.com');
    console.log('✓ E2E Step 9: Admin successfully checked in promoted member during session window');

    console.log('\nALL END-TO-END JOURNEY TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runE2EJourney().catch(err => {
  console.error('E2E Test execution failed:', err);
  process.exit(1);
});
