import { Router } from 'express';
import * as RoomController from '../controllers/room.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', RoomController.getAllRooms);
router.get('/:slug', RoomController.getRoomBySlug);
router.post('/', authMiddleware, RoomController.createRoom);
router.put('/:id', authMiddleware, RoomController.updateRoomStatus);
router.delete('/:id', authMiddleware, adminMiddleware, RoomController.deleteRoom);

export default router;