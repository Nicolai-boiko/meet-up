import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { parsePagination, paginatedResponse } from '../utils/pagination';

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

const authorSelect = { select: { id: true, name: true, avatar: true } };
const tagsInclude = { include: { contentTags: { include: { tag: true } } } };

function itemToResponse(item: any, userId?: number) {
  return {
    ...item,
    tags: item.contentTags?.map((ct: any) => ct.tag) ?? [],
    isFavorited: userId ? item.favorites?.some((f: any) => f.userId === userId) ?? false : false,
  };
}

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const tagId = req.query.tagId ? Number(req.query.tagId) : null;
    const favoritesOnly = req.query.favorites === '1';
    const authReq = req as AuthRequest;
    const userId = authReq.user ? Number(authReq.user.userId) : null;

    // Сортировка
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
    const allowedSortFields = ['createdAt', 'title', 'type'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy = { [field]: sortOrder };

    const where: any = {};
    if (tagId) {
      where.contentTags = { some: { tagId } };
    }
    if (favoritesOnly && userId) {
      where.favorites = { some: { userId } };
    }

    const include = {
      author: authorSelect,
      contentTags: { include: { tag: true } },
      ...(userId ? { favorites: { where: { userId }, select: { userId: true } } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include,
      }),
      prisma.content.count({ where }),
    ]);

    res.json(paginatedResponse(items.map((i) => itemToResponse(i, userId ?? undefined)), total, page, limit));
  } catch (error) {
    console.error('content getAll error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const item = await prisma.content.findUnique({
      where: { id: Number(req.params.id) },
      include: { author: authorSelect, contentTags: { include: { tag: true } } },
    });
    if (!item) return res.status(404).json({ message: 'Материал не найден' });
    res.json(itemToResponse(item));
  } catch (error) {
    console.error('content getById error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, body, mediaUrl, tagIds } = req.body;
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
        contentTags: tagIds?.length
          ? { create: (tagIds as number[]).map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: { author: authorSelect, contentTags: { include: { tag: true } } },
    });
    res.status(201).json(itemToResponse(item));
  } catch (error) {
    console.error('content create error:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, type, body, mediaUrl, tagIds } = req.body;

    if (tagIds !== undefined) {
      // Sync tags: delete old, create new
      await prisma.contentTag.deleteMany({ where: { contentId: Number(id) } });
      if (tagIds.length) {
        await prisma.contentTag.createMany({
          data: (tagIds as number[]).map((tagId) => ({ contentId: Number(id), tagId })),
        });
      }
    }

    const item = await prisma.content.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(body !== undefined && { body }),
        ...(mediaUrl !== undefined && { mediaUrl }),
      },
      include: { author: authorSelect, contentTags: { include: { tag: true } } },
    });
    res.json(itemToResponse(item));
  } catch (error) {
    console.error('content update error:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const contentId = Number(req.params.id);
    const userId = Number(req.user!.userId);

    const existing = await prisma.favorite.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
    } else {
      await prisma.favorite.create({ data: { userId, contentId } });
      res.json({ favorited: true });
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
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

export const bulkDelete = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids должен быть непустым массивом' });
    }
    const numericIds = ids.map(Number);
    const result = await prisma.content.deleteMany({ where: { id: { in: numericIds } } });
    res.json({ deleted: result.count });
  } catch (error) {
    console.error('content bulkDelete error:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении' });
  }
};
