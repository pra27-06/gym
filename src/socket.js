let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  return ioInstance;
}

function broadcastSessionUpdate(sessionId, updatedData) {
  if (ioInstance) {
    ioInstance.emit('session:updated', {
      sessionId,
      ...updatedData
    });
  }
}

module.exports = { setIo, getIo, broadcastSessionUpdate };
