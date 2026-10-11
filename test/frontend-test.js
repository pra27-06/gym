const assert = require('assert');
const http = require('http');
const app = require('../src/app');

let server;
let baseUrl;

function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runStaticTests() {
  console.log('Running Frontend Static File & Serving Tests...');

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  try {
    // 1. Check index.html is served
    const indexRes = await request('GET', '/');
    assert.strictEqual(indexRes.status, 200);
    assert(indexRes.body.includes('Gym Slot Booking'), 'index.html must contain app title');
    assert(indexRes.body.includes('app-content'), 'index.html must have root container');
    console.log('✓ index.html served correctly at /');

    // 2. Check CSS is served
    const cssRes = await request('GET', '/style.css');
    assert.strictEqual(cssRes.status, 200);
    assert(cssRes.body.includes('min-width: 360px'), 'style.css must enforce 360px responsiveness');
    console.log('✓ style.css served correctly with responsive constraints');

    // 3. Check client JS is served
    const jsRes = await request('GET', '/app.js');
    assert.strictEqual(jsRes.status, 200);
    assert(jsRes.body.includes('renderLoginRegister'), 'app.js must contain page 1');
    assert(jsRes.body.includes('renderSessions'), 'app.js must contain page 2');
    assert(jsRes.body.includes('renderMyBookings'), 'app.js must contain page 3');
    assert(jsRes.body.includes('renderAdmin'), 'app.js must contain page 4');
    console.log('✓ app.js served correctly with all 4 pages and client-side router');

    console.log('\nALL FRONTEND SERVING TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runStaticTests().catch(err => {
  console.error('Static test execution failed:', err);
  process.exit(1);
});
