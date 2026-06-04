import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // 👈 Импортируем createServer
import { initSignalingServer } from './services/signaling'; // 👈 Импортируем наш сервер сигнализации
import meetupRoutes from './routes/meetup.routes';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import profileRoutes from './routes/profile.routes';
import { prisma } from './config/database';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api/meetups', meetupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'UP', message: 'Server is running and database is connected.' });
  } catch (error) {
    res.status(503).json({ status: 'DOWN', message: 'Server is running but database connection failed.' });
  }
});

// 👇 Создаем HTTP сервер из нашего Express приложения
const httpServer = createServer(app);

// 👇 Инициализируем сервер сигнализации, передав ему HTTP сервер
initSignalingServer(httpServer);


const startServer = async () => {
  try {
    // 👇 Запускаем прослушивание на HTTP сервере, а не на app
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server with signaling is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start the server:', error);
  }
};

startServer();