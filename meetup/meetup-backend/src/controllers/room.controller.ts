import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const getAllRooms = async (_req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, isActive: true },
    });
    res.json(rooms);
  } catch (error) {
    console.error('getAllRooms error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getRoomBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const room = await prisma.room.findUnique({
      where: { slug },
      include: { host: { select: { id: true, name: true, email: true } } },
    });
    if (!room) return res.status(404).json({ message: 'Комната не найдена' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug } = req.body;
    const hostId = Number(req.user?.userId);
    if (!title || !slug) return res.status(400).json({ message: 'Название и slug обязательны' });

    const existing = await prisma.room.findUnique({ where: { slug } });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          message: 'Комната с таким названием уже активна. Присоединитесь к ней через поле "Войти".',
          room: existing,
        });
      }
      // Reactivate inactive room
      const room = await prisma.room.update({
        where: { id: existing.id },
        data: { isActive: true, hostId },
      });
      return res.status(200).json(room);
    }

    const room = await prisma.room.create({
      data: { title, slug, hostId, isActive: true },
    });
    res.status(201).json(room);
  } catch (error) {
    console.error('createRoom error:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании комнаты' });
  }
};

export const updateRoomStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const room = await prisma.room.update({
      where: { id: Number(id) },
      data: { isActive },
    });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при обновлении комнаты' });
  }
};