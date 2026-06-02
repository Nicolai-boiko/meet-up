import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const getAllMeetups = async (req: Request, res: Response) => {
  try {
    const meetups = await prisma.meeting.findMany();
    res.status(200).json(meetups);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const createMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const hostId = Number(req.user?.userId);

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Необходимо указать название, время начала и окончания' });
    }

    const meetup = await prisma.meeting.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        hostId,
      },
    });

    res.status(201).json({ message: 'Митап создан', data: meetup });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера при создании митапа' });
  }
};

export const getMeetupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meetup = await prisma.meeting.findUnique({
      where: { id: Number(id) },
    });

    if (!meetup) {
      return res.status(404).json({ message: 'Митап не найден' });
    }

    res.status(200).json(meetup);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export const updateMeetup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime } = req.body;

    const meetup = await prisma.meeting.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.status(200).json({ message: 'Митап обновлен', data: meetup });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при обновлении митапа' });
  }
}

export const deleteMeetup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.meeting.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Митап удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при удалении митапа' });
  }
}