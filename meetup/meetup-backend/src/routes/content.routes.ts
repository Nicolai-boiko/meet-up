import { Router } from 'express';
import * as ContentController from '../controllers/content.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ContentController.getAll);
router.get('/:id', ContentController.getById);
router.post('/', authMiddleware, adminMiddleware, ContentController.create);
router.put('/:id', authMiddleware, adminMiddleware, ContentController.update);
router.delete('/:id', authMiddleware, adminMiddleware, ContentController.remove);
router.post('/bulk-delete', authMiddleware, adminMiddleware, ContentController.bulkDelete);

export default router;
