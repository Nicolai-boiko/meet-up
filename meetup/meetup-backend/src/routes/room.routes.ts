import { Router } from 'express';
import * as RoomController from '../controllers/room.controller';
import { authMiddleware, adminMiddleware, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', RoomController.getAllRooms);
router.get('/:slug/messages', authMiddleware, RoomController.getMessages);
router.post('/:slug/verify', authMiddleware, RoomController.verifyRoomPassword);
router.get('/:slug', optionalAuth, RoomController.getRoomBySlug);
router.post('/', authMiddleware, RoomController.createRoom);
router.put('/:id', authMiddleware, RoomController.updateRoomStatus);
router.delete('/:id', authMiddleware, adminMiddleware, RoomController.deleteRoom);
router.post('/bulk-delete', authMiddleware, adminMiddleware, RoomController.bulkDelete);

export default router;