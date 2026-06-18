import { Router } from 'express';
import * as RoomController from '../controllers/room.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', RoomController.getAllRooms);
router.get('/:slug/messages', authMiddleware, RoomController.getMessages);
router.get('/:slug', RoomController.getRoomBySlug);
router.post('/', authMiddleware, RoomController.createRoom);
router.put('/:id', authMiddleware, RoomController.updateRoomStatus);
router.delete('/:id', authMiddleware, adminMiddleware, RoomController.deleteRoom);
router.post('/bulk-delete', authMiddleware, adminMiddleware, RoomController.bulkDelete);

export default router;