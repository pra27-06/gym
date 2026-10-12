const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const { setIo, broadcastSessionUpdate } = require('../src/socket');
const { Server } = require('socket.io');
const { io: ClientIo } = require('socket.io-client');

async function runSocketTest() {
  console.log('Running Socket.IO Real-Time Broadcast Test...');

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  setIo(io);

  await new Promise((resolve) => {
    server.listen(0, () => resolve());
  });

  const port = server.address().port;
  const clientSocket = ClientIo(`http://localhost:${port}`, {
    transports: ['websocket', 'polling']
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket connection timeout')), 3000);
      clientSocket.on('connect', () => {
        clearTimeout(timeout);
        resolve();
      });
      clientSocket.on('connect_error', reject);
    });
    console.log('✓ Socket.IO client connected successfully');

    // Test session:updated event broadcast
    const broadcastPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Broadcast receive timeout')), 3000);
      clientSocket.on('session:updated', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });

    broadcastSessionUpdate(101, { confirmed_count: 15, seats_remaining: 5 });

    const receivedData = await broadcastPromise;
    assert.strictEqual(receivedData.sessionId, 101);
    assert.strictEqual(receivedData.confirmed_count, 15);
    assert.strictEqual(receivedData.seats_remaining, 5);
    console.log('✓ Socket.IO session:updated broadcast received with accurate seat telemetry');

    console.log('ALL SOCKET.IO REAL-TIME TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    clientSocket.disconnect();
    server.close();
  }
}

runSocketTest().catch((err) => {
  console.error('Socket.IO test failed:', err);
  process.exit(1);
});
