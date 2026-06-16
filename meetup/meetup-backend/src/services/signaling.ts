import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initSignalingServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('join-room', (roomId: string) => {
      console.log(`🚪 Client ${socket.id} joined room ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', socket.id);
    });

    socket.on('offer', (payload: { target: string; offer: any }) => {
      io.to(payload.target).emit('offer', { from: socket.id, offer: payload.offer });
    });

    socket.on('answer', (payload: { target: string; answer: any }) => {
      io.to(payload.target).emit('answer', { from: socket.id, answer: payload.answer });
    });

    socket.on('ice-candidate', (payload: { target: string; candidate: any }) => {
      io.to(payload.target).emit('ice-candidate', { from: socket.id, candidate: payload.candidate });
    });

    socket.on('media-state', (data: { to: string; muted: boolean; videoOff: boolean }) => {
      io.to(data.to).emit('media-state', { id: socket.id, muted: data.muted, videoOff: data.videoOff });
    });

    socket.on('user-info', (data: { to: string; name: string; init: string; avatar?: string | null }) => {
      io.to(data.to).emit('user-info', { id: socket.id, name: data.name, init: data.init, avatar: data.avatar });
    });

    // ── Chat ──
    socket.on('send-message', (payload: { roomId: string; text: string; userName: string; initials: string; avatar: string | null }) => {
      const msg = {
        id: `${socket.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        socketId: socket.id,
        text: payload.text.slice(0, 2000),
        userName: payload.userName,
        initials: payload.initials,
        avatar: payload.avatar,
        timestamp: new Date().toISOString(),
      };
      io.to(payload.roomId).emit('new-message', msg);
    });

    socket.on('disconnect', () => {
      console.log(`👋 Client disconnected: ${socket.id}`);
      io.emit('user-disconnected', socket.id);
    });
  });

  console.log('✅ Signaling server initialized');
};
