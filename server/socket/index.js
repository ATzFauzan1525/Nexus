const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const isPublic = socket.handshake.auth.isPublic;

    if (isPublic) {
      socket.isPublic = true;
      return next();
    }

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // Handle join/leave tracking room (for /lacak page) — available to ALL clients (public + authenticated)
    socket.on('lacak:join', (nomorSurat) => {
      socket.join(`lacak:${nomorSurat}`);
      console.log(`Client joined lacak room: ${nomorSurat}`);
    });

    socket.on('lacak:leave', (nomorSurat) => {
      socket.leave(`lacak:${nomorSurat}`);
      console.log(`Client left lacak room: ${nomorSurat}`);
    });

    if (socket.isPublic) {
      console.log('Public client connected (lacak)');
      return;
    }

    console.log(`User connected: ${socket.user.username} (${socket.user.role})`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Join role-specific room
    socket.join(`role:${socket.user.role}`);

    // Join bidang room for Wakasek
    if (socket.user.role === 'WAKASEK' && socket.user.bidang) {
      socket.join(`role:WAKASEK_BIDANG:${socket.user.bidang}`);
    }

    // Track socket for user
    if (!userSockets.has(socket.user.id)) {
      userSockets.set(socket.user.id, new Set());
    }
    userSockets.get(socket.user.id).add(socket.id);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.username || 'unknown'}`);
      if (socket.user?.id && userSockets.has(socket.user.id)) {
        userSockets.get(socket.user.id).delete(socket.id);
        if (userSockets.get(socket.user.id).size === 0) {
          userSockets.delete(socket.user.id);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser, emitToRole, emitToRoom };
