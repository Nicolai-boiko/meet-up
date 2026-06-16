import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

const meetingInclude = {
  host: { select: { id: true, name: true, email: true, avatar: true, firstName: true, lastName: true } },
  meetingParticipants: {
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, firstName: true, lastName: true } },
    },
  },
  room: { select: { id: true, title: true, slug: true, isActive: true } },
};

function meetingToResponse(m: any) {
  return {
    ...m,
    participants: m.meetingParticipants?.map((mp: any) => ({
      ...mp.user,
      status: mp.status,
      meetingParticipantId: mp.id,
    })) ?? [],
  };
}

// ── Email stub ──
function sendInviteEmailStub(hostName: string, guestEmail: string, meetingTitle: string, startTime: Date) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 [EMAIL STUB] Приглашение на встречу`);
  console.log(`   От: ${hostName}`);
  console.log(`   Кому: ${guestEmail}`);
  console.log(`   Встреча: ${meetingTitle}`);
  console.log(`   Начало: ${startTime.toLocaleString('ru-RU')}`);
  console.log(`   Статус: ОЖИДАЕТ РЕАЛИЗАЦИИ EMAIL-СЕРВИСА`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// ── GET / ──
export const getAllMeetups = async (req: Request, res: Response) => {
  try {
    const userIdsParam = req.query.userIds as string | undefined;
    const where: any = {};

    if (userIdsParam) {
      const ids = userIdsParam.split(',').map(Number).filter(Boolean);
      if (ids.length > 0) {
        where.OR = [
          { hostId: { in: ids } },
          { meetingParticipants: { some: { userId: { in: ids } } } },
        ];
      }
    }

    const meetups = await prisma.meeting.findMany({
      where,
      include: meetingInclude,
      orderBy: { startTime: 'asc' },
    });
    res.status(200).json(meetups.map(meetingToResponse));
  } catch (error) {
    console.error('getAllMeetups error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── POST / ──
export const createMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime, roomId, participantIds } = req.body;
    const hostId = Number(req.user?.userId);
    const hostEmail = req.user?.email ?? '';

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Необходимо указать название, время начала и окончания' });
    }

    const data: any = {
      title,
      description: description ?? null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      hostId,
    };

    if (roomId) {
      const room = await prisma.room.findUnique({ where: { id: Number(roomId) } });
      if (!room) return res.status(404).json({ message: 'Комната не найдена' });
      data.roomId = Number(roomId);
    }

    // Создаём встречу с участниками-приглашёнными
    const meetup = await prisma.meeting.create({
      data: {
        ...data,
        meetingParticipants: participantIds?.length
          ? {
              create: (participantIds as number[])
                .filter((id) => id !== hostId)
                .map((userId) => ({ userId, status: 'INVITED' })),
            }
          : undefined,
      },
      include: meetingInclude,
    });

    // Email stubs для приглашённых
    if (participantIds?.length) {
      const hostName = req.user?.email ?? 'Организатор'; // будет заменено на имя
      const invitedUsers = meetup.meetingParticipants.filter((mp) => mp.status === 'INVITED');
      for (const mp of invitedUsers) {
        if (mp.user.email) {
          sendInviteEmailStub(hostName, mp.user.email, title, new Date(startTime));
        }
      }
    }

    res.status(201).json({ message: 'Встреча создана', data: meetingToResponse(meetup) });
  } catch (error) {
    console.error('createMeetup error:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании встречи' });
  }
};

// ── GET /:id ──
export const getMeetupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meetup = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: meetingInclude,
    });
    if (!meetup) return res.status(404).json({ message: 'Встреча не найдена' });
    res.status(200).json(meetingToResponse(meetup));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── PUT /:id ──
export const updateMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, roomId, participantIds } = req.body;

    const existing = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: { meetingParticipants: true },
    });
    if (!existing) return res.status(404).json({ message: 'Встреча не найдена' });
    if (existing.hostId !== Number(req.user?.userId)) {
      return res.status(403).json({ message: 'Только организатор может редактировать встречу' });
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (startTime !== undefined) data.startTime = new Date(startTime);
    if (endTime !== undefined) data.endTime = new Date(endTime);
    if (roomId !== undefined) {
      if (roomId === null) {
        data.roomId = null;
      } else {
        const room = await prisma.room.findUnique({ where: { id: Number(roomId) } });
        if (!room) return res.status(404).json({ message: 'Комната не найдена' });
        data.roomId = Number(roomId);
      }
    }

    // Синхронизация участников
    if (participantIds !== undefined) {
      const hostId = existing.hostId;
      const newIds = (participantIds as number[]).filter((pid) => pid !== hostId);
      const existingMps = existing.meetingParticipants;

      // Удаляем тех, кого больше нет в списке (только INVITED)
      const toRemove = existingMps.filter(
        (mp) => !newIds.includes(mp.userId) && mp.status === 'INVITED',
      );
      if (toRemove.length) {
        await prisma.meetingParticipant.deleteMany({
          where: { id: { in: toRemove.map((mp) => mp.id) } },
        });
      }

      // Добавляем новых (кого ещё нет)
      const existingUserIds = existingMps.map((mp) => mp.userId);
      const toAdd = newIds.filter((uid) => !existingUserIds.includes(uid));
      if (toAdd.length) {
        await prisma.meetingParticipant.createMany({
          data: toAdd.map((userId) => ({ meetingId: Number(id), userId, status: 'INVITED' })),
        });

        // Email stubs для новых приглашённых
        const hostEmail = req.user?.email ?? '';
        for (const userId of toAdd) {
          const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
          if (user?.email) {
            const meetingTitle = title ?? existing.title;
            const meetingStart = startTime ? new Date(startTime) : existing.startTime;
            sendInviteEmailStub(hostEmail, user.email, meetingTitle, meetingStart);
          }
        }
      }
    }

    const meetup = await prisma.meeting.update({
      where: { id: Number(id) },
      data,
      include: meetingInclude,
    });

    res.status(200).json({ message: 'Встреча обновлена', data: meetingToResponse(meetup) });
  } catch (error) {
    console.error('updateMeetup error:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении встречи' });
  }
};

// ── DELETE /:id ──
export const deleteMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.meeting.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ message: 'Встреча не найдена' });
    if (existing.hostId !== Number(req.user?.userId)) {
      return res.status(403).json({ message: 'Только организатор может удалить встречу' });
    }

    await prisma.meeting.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Встреча удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при удалении встречи' });
  }
};

// ── POST /:id/join ──
export const joinMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.userId);

    const meetup = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: { meetingParticipants: true },
    });
    if (!meetup) return res.status(404).json({ message: 'Встреча не найдена' });

    // Найти или создать запись участия со статусом ACCEPTED
    const existing = meetup.meetingParticipants.find((mp) => mp.userId === userId);
    if (existing) {
      await prisma.meetingParticipant.update({
        where: { id: existing.id },
        data: { status: 'ACCEPTED' },
      });
    } else {
      await prisma.meetingParticipant.create({
        data: { meetingId: Number(id), userId, status: 'ACCEPTED' },
      });
    }

    const updated = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: meetingInclude,
    });

    res.status(200).json({ message: 'Вы приняли участие во встрече', data: meetingToResponse(updated) });
  } catch (error) {
    console.error('joinMeetup error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── POST /:id/decline ──
export const declineMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.userId);

    const meetup = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: { meetingParticipants: true },
    });
    if (!meetup) return res.status(404).json({ message: 'Встреча не найдена' });

    const existing = meetup.meetingParticipants.find((mp) => mp.userId === userId);
    if (existing) {
      await prisma.meetingParticipant.update({
        where: { id: existing.id },
        data: { status: 'DECLINED' },
      });
    } else {
      await prisma.meetingParticipant.create({
        data: { meetingId: Number(id), userId, status: 'DECLINED' },
      });
    }

    const updated = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: meetingInclude,
    });

    res.status(200).json({ message: 'Вы отказались от участия', data: meetingToResponse(updated) });
  } catch (error) {
    console.error('declineMeetup error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
