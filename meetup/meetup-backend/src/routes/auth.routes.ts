import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { loginLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', registerLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/forgot-password', forgotPasswordLimiter, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, AuthController.resetPassword);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;
