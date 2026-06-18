import { Router } from 'express';
import * as TagController from '../controllers/tag.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', TagController.getAll);
router.post('/', authMiddleware, adminMiddleware, TagController.create);
router.delete('/:id', authMiddleware, adminMiddleware, TagController.remove);

export default router;
