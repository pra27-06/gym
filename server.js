const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { setIo } = require('./src/socket');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE']
  }
});

setIo(io);

io.on('connection', (socket) => {
  // Graceful connect
  socket.on('disconnect', () => {
    // Graceful disconnect
  });
});

server.listen(PORT, () => {
  console.log(`GYMFLOW server & WebSocket running at http://localhost:${PORT}`);
});
