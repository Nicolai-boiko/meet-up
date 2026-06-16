import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, UserController.getUsers);

export default router;
