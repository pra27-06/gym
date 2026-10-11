const assert = require('assert');
const http = require('http');
const app = require('../src/app');
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

async function runAuthTests() {
  console.log('Running Milestone 2 Auth & Middleware Tests...');

  // Reset & seed database
  seed();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  try {
    // Test 1: Successful Member Registration
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Charlie New',
      email: 'charlie@gym.com',
      password: 'password123'
    });
    assert.strictEqual(regRes.status, 201);
    assert(regRes.body.token, 'Registration should return token');
    assert.strictEqual(regRes.body.user.role, 'member', 'Registration must only create members');
    console.log('✓ Test 1: Member registration successful');

    // Test 2: Reject Duplicate Email (409 Conflict)
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Charlie Again',
      email: 'charlie@gym.com',
      password: 'password123'
    });
    assert.strictEqual(dupRes.status, 409);
    assert.strictEqual(dupRes.body.error, 'Email already registered');
    console.log('✓ Test 2: Duplicate email rejected with 409 Conflict');

    // Test 3: Public registration cannot create Admin even if role is requested
    const sneakyAdminRes = await request('POST', '/api/auth/register', {
      name: 'Sneaky',
      email: 'sneaky@gym.com',
      password: 'password123',
      role: 'admin'
    });
    assert.strictEqual(sneakyAdminRes.status, 201);
    assert.strictEqual(sneakyAdminRes.body.user.role, 'member', 'Registration must ignore role and force member');
    console.log('✓ Test 3: Admin role tampering prevented');

    // Test 4: Successful Member Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'charlie@gym.com',
      password: 'password123'
    });
    assert.strictEqual(loginRes.status, 200);
    assert(loginRes.body.token);
    assert.strictEqual(loginRes.body.user.role, 'member');
    const memberToken = loginRes.body.token;
    console.log('✓ Test 4: Member login successful');

    // Test 5: Successful Admin Login
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@gym.com',
      password: 'password123'
    });
    assert.strictEqual(adminLoginRes.status, 200);
    assert.strictEqual(adminLoginRes.body.user.role, 'admin');
    const adminToken = adminLoginRes.body.token;
    console.log('✓ Test 5: Admin login successful');

    // Test 6: Invalid Login Credentials (401)
    const badLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@gym.com',
      password: 'wrongpassword'
    });
    assert.strictEqual(badLoginRes.status, 401);
    assert.strictEqual(badLoginRes.body.error, 'Invalid email or password');
    console.log('✓ Test 6: Invalid credentials rejected with 401');

    // Test 7: Protected Route with Missing Token (401)
    const noTokenRes = await request('GET', '/api/member/me');
    assert.strictEqual(noTokenRes.status, 401);
    assert.strictEqual(noTokenRes.body.error, 'Authentication token required');
    console.log('✓ Test 7: Missing token returns 401');

    // Test 8: Protected Route with Invalid Token (401)
    const invalidTokenRes = await request('GET', '/api/member/me', null, 'fake-token-123');
    assert.strictEqual(invalidTokenRes.status, 401);
    assert.strictEqual(invalidTokenRes.body.error, 'Invalid or expired token');
    console.log('✓ Test 8: Invalid token returns 401');

    // Test 9: Member accessing Admin-only endpoint (403 Forbidden)
    const forbiddenRes = await request('GET', '/api/admin/ping', null, memberToken);
    assert.strictEqual(forbiddenRes.status, 403);
    assert.strictEqual(forbiddenRes.body.error, 'Access forbidden: Admins only');
    console.log('✓ Test 9: Member blocked from admin endpoint with 403 Forbidden');

    // Test 10: Admin successfully accessing Admin endpoint (200 OK)
    const adminAccessRes = await request('GET', '/api/admin/ping', null, adminToken);
    assert.strictEqual(adminAccessRes.status, 200);
    assert.strictEqual(adminAccessRes.body.message, 'Admin access verified');
    console.log('✓ Test 10: Admin access authorized');

    console.log('\nALL AUTH & MIDDLEWARE TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runAuthTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
