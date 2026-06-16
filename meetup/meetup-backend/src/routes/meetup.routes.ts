import { Router } from 'express';
import * as MeetupController from '../controllers/meetup.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', MeetupController.getAllMeetups);
router.get('/:id', MeetupController.getMeetupById);
router.post('/', authMiddleware, MeetupController.createMeetup);
router.put('/:id', authMiddleware, MeetupController.updateMeetup);
router.delete('/:id', authMiddleware, MeetupController.deleteMeetup);
router.post('/:id/join', authMiddleware, MeetupController.joinMeetup);
router.post('/:id/decline', authMiddleware, MeetupController.declineMeetup);

export default router;
