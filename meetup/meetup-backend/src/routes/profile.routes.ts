import { Router } from 'express';
import * as ProfileController from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, ProfileController.getProfile);
router.put('/', authMiddleware, ProfileController.updateProfile);
router.put('/password', authMiddleware, ProfileController.changePassword);

export default router;
