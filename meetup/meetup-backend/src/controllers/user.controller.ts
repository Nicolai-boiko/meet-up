import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, avatar: true, firstName: true, lastName: true,
        ...(isAdmin ? { role: true } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Роль должна быть USER или ADMIN' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!targetUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (Number(id) === Number(req.user!.userId)) {
      return res.status(400).json({ message: 'Нельзя изменить собственную роль' });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, name: true, email: true, avatar: true, firstName: true, lastName: true, role: true },
    });

    res.json({ message: 'Роль обновлена', user });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
