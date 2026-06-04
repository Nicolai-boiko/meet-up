import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initSignalingServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('join-room', (roomId: string, userInfo?: { displayName: string; initials: string; avatar: string | null }) => {
      console.log(`🚪 Client ${socket.id} joined room ${roomId}`);

      (socket as any).userInfo = userInfo;

      socket.join(roomId);

      socket.to(roomId).emit('user-connected', socket.id, userInfo);
    });

    socket.on('offer', (payload: { target: string; offer: any }) => {
      io.to(payload.target).emit('offer', {
        from: socket.id,
        offer: payload.offer,
      });
    });

    socket.on('answer', (payload: { target: string; answer: any }) => {
      io.to(payload.target).emit('answer', {
        from: socket.id,
        answer: payload.answer,
      });
    });

    socket.on('ice-candidate', (payload: { target: string; candidate: any }) => {
      io.to(payload.target).emit('ice-candidate', {
        from: socket.id,
        candidate: payload.candidate,
      });
    });

    socket.on('disconnect', () => {
      console.log(`👋 Client disconnected: ${socket.id}`);
      io.emit('user-disconnected', socket.id);
    });
  });

  console.log('✅ Signaling server initialized');
};
