import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { parsePagination, paginatedResponse } from '../utils/pagination';

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

const authorSelect = { select: { id: true, name: true, avatar: true } };

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const [items, total] = await Promise.all([
      prisma.content.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: authorSelect },
      }),
      prisma.content.count(),
    ]);
    res.json(paginatedResponse(items, total, page, limit));
  } catch (error) {
    console.error('content getAll error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const item = await prisma.content.findUnique({
      where: { id: Number(req.params.id) },
      include: { author: authorSelect },
    });
    if (!item) return res.status(404).json({ message: 'Материал не найден' });
    res.json(item);
  } catch (error) {
    console.error('content getById error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, body, mediaUrl } = req.body;
    if (!title || !type) {
      return res.status(400).json({ message: 'Название и тип обязательны' });
    }
    const item = await prisma.content.create({
      data: {
        title,
        type,
        body: body ?? null,
        mediaUrl: mediaUrl ?? null,
        authorId: Number(req.user!.userId),
      },
      include: { author: authorSelect },
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('content create error:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, type, body, mediaUrl } = req.body;
    const item = await prisma.content.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(body !== undefined && { body }),
        ...(mediaUrl !== undefined && { mediaUrl }),
      },
      include: { author: authorSelect },
    });
    res.json(item);
  } catch (error) {
    console.error('content update error:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await prisma.content.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Материал удалён' });
  } catch (error) {
    console.error('content delete error:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении' });
  }
};
