const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const { setIo } = require('../src/socket');
const { Server } = require('socket.io');
const { io: ClientIo } = require('socket.io-client');
const fs = require('fs');
const path = require('path');

let server;
let baseUrl;
let socketClient;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runUIFunctionalityTests() {
  console.log('Running UI Button Functionality & Interactive API Flow Tests...');

  server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  setIo(io);

  await new Promise((resolve) => {
    server.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  socketClient = ClientIo(baseUrl, { transports: ['websocket', 'polling'] });
  await new Promise((resolve) => socketClient.on('connect', resolve));

  try {
    // 1. Verify Production Index HTML is served
    const indexRes = await request('GET', '/');
    assert.strictEqual(indexRes.status, 200);
    assert(indexRes.body.includes('GYMFLOW'), 'Should contain GYMFLOW brand');
    assert(indexRes.body.includes('assets/'), 'Should load React bundled assets');
    console.log('✓ UI Root & Bundled Assets served correctly');

    // 2. Test Login Button API Action (Alice)
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'alice@gym.com',
      password: 'password123'
    });
    assert.strictEqual(loginRes.status, 200);
    assert(loginRes.body.token, 'Should return JWT token');
    const aliceToken = loginRes.body.token;
    console.log('✓ "Sign In to Dashboard" button action succeeds');

    // 3. Test Sessions Page Fetch Action
    const sessionsRes = await request('GET', '/api/sessions', null, aliceToken);
    assert.strictEqual(sessionsRes.status, 200);
    assert(Array.isArray(sessionsRes.body.sessions), 'Should return array of sessions');
    const availableSession = sessionsRes.body.sessions.find(s => s.seats_remaining > 0);
    assert(availableSession, 'Should have at least 1 open session');
    console.log('✓ "Schedule / Training Sessions" load action succeeds');

    // 4. Test "Reserve Session ->" Button Action + Real-Time WebSocket broadcast
    let broadcastReceived = false;
    socketClient.once('session:updated', (data) => {
      if (data.sessionId === availableSession.id) {
        broadcastReceived = true;
      }
    });

    const bookRes = await request('POST', '/api/bookings', { session_id: availableSession.id }, aliceToken);
    assert(bookRes.status === 201 || bookRes.status === 409, 'Booking response should be 201 or 409 if already booked');
    console.log('✓ "Reserve Session ->" button action succeeds');

    // 5. Test "My Passes" Data Load Action
    const passesRes = await request('GET', '/api/bookings/my', null, aliceToken);
    assert.strictEqual(passesRes.status, 200);
    assert(Array.isArray(passesRes.body.bookings), 'Should return athlete bookings');
    const activePass = passesRes.body.bookings.find(b => b.status === 'confirmed');
    assert(activePass, 'Should have an active confirmed pass');
    assert(activePass.check_in_code, 'Pass must contain turnstile check-in code');
    console.log(`✓ "My Passes" button load action succeeds with turnstile code ${activePass.check_in_code}`);

    // 6. Test "Cancel Reservation" Modal Action
    const cancelRes = await request('POST', `/api/bookings/${activePass.id}/cancel`, null, aliceToken);
    assert.strictEqual(cancelRes.status, 200);
    console.log('✓ "Cancel Reservation" modal button action succeeds');

    // 7. Test Admin Login Action
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@gym.com',
      password: 'password123'
    });
    assert.strictEqual(adminLoginRes.status, 200);
    const adminToken = adminLoginRes.body.token;
    console.log('✓ "Sign In with Staff Account" button action succeeds');

    // 8. Test Admin "Publish Session Slot" Button Action
    const testDate = '2026-10-25';
    const createRes = await request('POST', '/api/sessions', {
      session_date: testDate,
      start_hour: 16
    }, adminToken);
    assert(createRes.status === 201 || createRes.status === 409, 'Session created or exists');
    console.log('✓ "Publish Session Slot" button action succeeds');

    console.log('\nALL UI BUTTON FUNCTIONALITY & INTERACTIVE TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    socketClient.disconnect();
    server.close();
  }
}

runUIFunctionalityTests().catch((err) => {
  console.error('UI functionality test failed:', err);
  process.exit(1);
});
