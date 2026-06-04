import { Router } from 'express';
import * as RoomController from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/:slug', RoomController.getRoomBySlug);
router.post('/', authMiddleware, RoomController.createRoom);
router.put('/:id', authMiddleware, RoomController.updateRoomStatus);

export default router;