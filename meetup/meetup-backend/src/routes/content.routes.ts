import { Router } from 'express';
import * as ContentController from '../controllers/content.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ContentController.getAll);
router.get('/:id', ContentController.getById);
router.post('/', authMiddleware, ContentController.create);
router.put('/:id', authMiddleware, ContentController.update);
router.delete('/:id', authMiddleware, ContentController.remove);

export default router;
