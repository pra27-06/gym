const assert = require('assert');
const https = require('https');

const baseUrl = 'https://gymflow-htdo.onrender.com';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, { method, headers }, (res) => {
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

async function verifyLiveDeployment() {
  console.log(`Starting live verification against: ${baseUrl}\n`);

  // 1. Verify Member Login with pre-seeded test credentials
  console.log('1. Testing Member Login (alice@gym.com)...');
  const aliceLogin = await request('POST', '/api/auth/login', {
    email: 'alice@gym.com',
    password: 'password123'
  });
  assert.strictEqual(aliceLogin.status, 200, `Expected 200 on login, got ${aliceLogin.status}`);
  assert(aliceLogin.body.token, 'Expected token in login response');
  assert.strictEqual(aliceLogin.body.user.role, 'member', 'Expected role to be member');
  const aliceToken = aliceLogin.body.token;
  console.log('✓ Member login successful on live deployment.\n');

  // 2. Verify Admin Login with pre-seeded test credentials
  console.log('2. Testing Admin Login (admin@gym.com)...');
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@gym.com',
    password: 'password123'
  });
  assert.strictEqual(adminLogin.status, 200, `Expected 200 on admin login, got ${adminLogin.status}`);
  assert(adminLogin.body.token, 'Expected token in admin login response');
  assert.strictEqual(adminLogin.body.user.role, 'admin', 'Expected role to be admin');
  const adminToken = adminLogin.body.token;
  console.log('✓ Admin login successful on live deployment.\n');

  // 3. Verify Sessions Listing
  console.log('3. Testing Sessions Listing (/api/sessions)...');
  const sessionsRes = await request('GET', '/api/sessions', null, aliceToken);
  assert.strictEqual(sessionsRes.status, 200, `Expected 200 on sessions listing, got ${sessionsRes.status}`);
  assert(Array.isArray(sessionsRes.body.sessions), 'Expected sessions array');
  console.log(`✓ Fetched ${sessionsRes.body.sessions.length} sessions from live database.`);

  // Verify at least one full session exists (20/20)
  const fullSession = sessionsRes.body.sessions.find(s => s.seats_remaining === 0);
  assert(fullSession, 'Expected at least one full session with 20 bookings from seed');
  console.log(`✓ Confirmed live database has a full session (ID ${fullSession.id}, Date: ${fullSession.session_date} at ${fullSession.start_hour}:00).\n`);

  // 4. Verify Member Registration
  const randomEmail = `athlete_${Date.now()}@testgym.com`;
  console.log(`4. Testing Live Member Self-Registration (${randomEmail})...`);
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Live Test Athlete',
    email: randomEmail,
    password: 'password123'
  });
  assert.strictEqual(regRes.status, 201, `Expected 201 on register, got ${regRes.status}`);
  assert(regRes.body.token, 'Expected token in register response');
  assert.strictEqual(regRes.body.user.role, 'member', 'Public registration must only create members');
  const newAthleteToken = regRes.body.token;
  console.log('✓ Registration verified successfully on live deployment.\n');

  // 5. Verify Booking Flow on Open Session
  const openSession = sessionsRes.body.sessions.find(s => s.seats_remaining > 0);
  assert(openSession, 'Expected an open session with seats remaining');
  console.log(`5. Testing Booking Flow on Session ID ${openSession.id} (${openSession.session_date} at ${openSession.start_hour}:00)...`);

  const bookRes = await request('POST', '/api/bookings', { session_id: openSession.id }, newAthleteToken);
  assert.strictEqual(bookRes.status, 201, `Expected 201 on booking, got ${bookRes.status}`);
  assert(bookRes.body.booking.check_in_code, 'Expected short check-in code');
  assert.strictEqual(bookRes.body.booking.check_in_code.length, 6, 'Check-in code should be 6 characters');
  const bookingId = bookRes.body.booking.id;
  const checkInCode = bookRes.body.booking.check_in_code;
  console.log(`✓ Booking confirmed. Received check-in code: ${checkInCode}\n`);

  // 6. Verify Ownership: Only the booking owner sees their booking
  console.log('6. Testing Booking Ownership & My Bookings (/api/bookings/my)...');
  const myBookingsRes = await request('GET', '/api/bookings/my', null, newAthleteToken);
  assert.strictEqual(myBookingsRes.status, 200);
  const foundBooking = myBookingsRes.body.bookings.find(b => b.id === bookingId);
  assert(foundBooking, 'Created booking must appear in member dashboard');
  console.log('✓ Booking appears in athlete dashboard with valid code.\n');

  // 7. Verify Cancellation
  console.log(`7. Testing Cancellation on Booking ID ${bookingId}...`);
  const cancelRes = await request('POST', `/api/bookings/${bookingId}/cancel`, null, newAthleteToken);
  assert.strictEqual(cancelRes.status, 200, `Expected 200 on cancel, got ${cancelRes.status}`);
  console.log('✓ Booking cancelled successfully.\n');

  // 8. Verify Admin Route Protection (Member blocked from admin check-in endpoint)
  console.log('8. Testing Admin Route Authorization Guard (Member should receive 403)...');
  const forbiddenRes = await request('POST', '/api/admin/check-in', { code: checkInCode }, newAthleteToken);
  assert.strictEqual(forbiddenRes.status, 403, `Expected 403 for member accessing admin endpoint, got ${forbiddenRes.status}`);
  console.log('✓ Authorization verified: Member access rejected with 403 Forbidden.\n');

  // 9. Verify Admin Turnstile Check-in Validation on Cancelled Booking (should reject 400)
  console.log('9. Testing Turnstile Check-in on Cancelled Booking (should reject 400)...');
  const cancelledCheckinRes = await request('POST', '/api/admin/check-in', {
    code: checkInCode,
    test_timestamp: `${openSession.session_date}T${String(openSession.start_hour).padStart(2, '0')}:30:00`
  }, adminToken);
  assert.strictEqual(cancelledCheckinRes.status, 400, `Expected 400 on cancelled booking checkin, got ${cancelledCheckinRes.status}`);
  console.log('✓ Cancelled booking check-in properly rejected by server.\n');

  console.log('=====================================================');
  console.log('🎉 ALL LIVE PRODUCTION API CHECKS PASSED SUCCESSFULLY!');
  console.log('=====================================================');
}

verifyLiveDeployment().catch(err => {
  console.error('Live deployment verification failed:', err);
  process.exit(1);
});
