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

async function runMilestone3Tests() {
  console.log('Running Milestone 3 Sessions, Bookings & Waitlist Tests...');

  seed();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  try {
    // 1. Log in admin, alice, and bob
    const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@gym.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    const aliceLogin = await request('POST', '/api/auth/login', { email: 'alice@gym.com', password: 'password123' });
    const aliceToken = aliceLogin.body.token;

    const bobLogin = await request('POST', '/api/auth/login', { email: 'bob@gym.com', password: 'password123' });
    const bobToken = bobLogin.body.token;

    // Test 1: Admin creates session with date and start hour
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const createRes = await request('POST', '/api/sessions', {
      session_date: futureDateStr,
      start_hour: 14
    }, adminToken);
    assert.strictEqual(createRes.status, 201);
    const newSessionId = createRes.body.session.id;
    console.log('✓ Test 1: Admin created session successfully');

    // Test 2: Member cannot create session (403 Forbidden)
    const memberCreateRes = await request('POST', '/api/sessions', {
      session_date: futureDateStr,
      start_hour: 15
    }, aliceToken);
    assert.strictEqual(memberCreateRes.status, 403);
    console.log('✓ Test 2: Member blocked from creating session (403)');

    // Test 3: Duplicate session start time rejected (409 Conflict)
    const dupSessionRes = await request('POST', '/api/sessions', {
      session_date: futureDateStr,
      start_hour: 14
    }, adminToken);
    assert.strictEqual(dupSessionRes.status, 409);
    console.log('✓ Test 3: Duplicate session slot rejected with 409 Conflict');

    // Test 4: Browse sessions and filter by date
    const listRes = await request('GET', `/api/sessions?date=${futureDateStr}`, null, aliceToken);
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.body.sessions.length, 1);
    assert.strictEqual(listRes.body.sessions[0].seats_remaining, 20);
    console.log('✓ Test 4: Browse sessions and filter by date verified');

    // Test 5: Member books open session
    const bookRes = await request('POST', '/api/bookings', { session_id: newSessionId }, aliceToken);
    assert.strictEqual(bookRes.status, 201);
    assert(bookRes.body.booking.check_in_code);
    assert.strictEqual(bookRes.body.booking.check_in_code.length, 6);
    const aliceBookingId = bookRes.body.booking.id;
    console.log('✓ Test 5: Member booked session and received 6-char check-in code');

    // Test 6: Member cannot book same session twice (409 Conflict)
    const doubleBookRes = await request('POST', '/api/bookings', { session_id: newSessionId }, aliceToken);
    assert.strictEqual(doubleBookRes.status, 409);
    console.log('✓ Test 6: Duplicate active booking rejected with 409 Conflict');

    // Test 7: Verify seats_remaining decremented
    const listAfterBook = await request('GET', `/api/sessions?date=${futureDateStr}`, null, bobToken);
    assert.strictEqual(listAfterBook.body.sessions[0].seats_remaining, 19);
    console.log('✓ Test 7: Seat count correctly decremented to 19');

    // Test 8: Booking a full session (Session 2 from seed is full with 20 bookings)
    const sessionsList = await request('GET', '/api/sessions', null, bobToken);
    const fullSession = sessionsList.body.sessions.find(s => s.seats_remaining === 0);
    assert(fullSession, 'Full session from seed should exist');

    const bookFullRes = await request('POST', '/api/bookings', { session_id: fullSession.id }, bobToken);
    assert.strictEqual(bookFullRes.status, 409);
    assert(bookFullRes.body.error.includes('Session is full'));
    console.log('✓ Test 8: Booking full session rejected with 409');

    // Test 9: Bob joins waitlist on the full session
    const waitlistRes = await request('POST', '/api/bookings/waitlist', { session_id: fullSession.id }, bobToken);
    assert.strictEqual(waitlistRes.status, 201);
    console.log('✓ Test 9: Bob successfully joined waitlist on full session');

    // Test 10: Bob cannot join waitlist twice for same session (409 Conflict)
    const dupWaitlistRes = await request('POST', '/api/bookings/waitlist', { session_id: fullSession.id }, bobToken);
    assert.strictEqual(dupWaitlistRes.status, 409);
    console.log('✓ Test 10: Duplicate waitlist entry rejected with 409');

    // Test 11: Member sees only their own bookings
    const aliceBookings = await request('GET', '/api/bookings/my', null, aliceToken);
    const bobBookings = await request('GET', '/api/bookings/my', null, bobToken);
    assert(aliceBookings.body.bookings.some(b => b.id === aliceBookingId));
    assert(!bobBookings.body.bookings.some(b => b.id === aliceBookingId));
    console.log('✓ Test 11: Member data ownership verified (members see only their own)');

    // Test 12: Bob cannot cancel Alice's booking (403 Forbidden)
    const badCancelRes = await request('POST', `/api/bookings/${aliceBookingId}/cancel`, null, bobToken);
    assert.strictEqual(badCancelRes.status, 403);
    console.log('✓ Test 12: Ownership check prevents unauthorized cancellation (403)');

    // Test 13: FIFO Waitlist Promotion Test
    // One dummy member cancels their booking in fullSession -> Bob should be automatically promoted!
    const fullSessionBookings = db.prepare("SELECT * FROM bookings WHERE session_id = ? AND status = 'confirmed'").all(fullSession.id);
    const dummyBookingToCancel = fullSessionBookings[0];

    // Admin cancels dummy member's booking
    const cancelRes = await request('POST', `/api/bookings/${dummyBookingToCancel.id}/cancel`, null, adminToken);
    assert.strictEqual(cancelRes.status, 200);

    // Verify Bob was automatically promoted
    const bobBookingsAfter = await request('GET', '/api/bookings/my', null, bobToken);
    const bobsPromotedBooking = bobBookingsAfter.body.bookings.find(b => b.session_id === fullSession.id);
    assert(bobsPromotedBooking, 'Bob should have been automatically promoted from waitlist to confirmed booking');
    assert.strictEqual(bobsPromotedBooking.status, 'confirmed');
    assert(bobsPromotedBooking.check_in_code);
    console.log('✓ Test 13: FIFO Waitlist auto-promotion verified upon cancellation');

    // Verify Bob is no longer on the waitlist
    const waitlistEntry = db.prepare('SELECT * FROM waitlist_entries WHERE user_id = ? AND session_id = ?').get(bobLogin.body.user.id, fullSession.id);
    assert(!waitlistEntry, 'Promoted member must be removed from waitlist');
    console.log('✓ Test 14: Promoted member removed from waitlist table');

    // Test 15: Concurrency check - capacity limit remains strictly 20
    const confirmedCount = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE session_id = ? AND status = 'confirmed'").get(fullSession.id).c;
    assert.strictEqual(confirmedCount, 20, 'Capacity must remain strictly 20');
    console.log('✓ Test 15: Session capacity remains strictly 20 confirmed bookings');

    console.log('\nALL MILESTONE 3 TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runMilestone3Tests().catch(err => {
  console.error('Milestone 3 Test execution failed:', err);
  process.exit(1);
});
