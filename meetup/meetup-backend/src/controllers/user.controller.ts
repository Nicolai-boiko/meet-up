import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, avatar: true, firstName: true, lastName: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
