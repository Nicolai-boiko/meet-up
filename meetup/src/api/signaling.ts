import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket: Socket | null = null;

export function getSignalingSocket(): Socket {
  if (!socket?.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSignaling(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}