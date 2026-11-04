import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotUsername,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-username', forgotUsername);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', verifyToken, getMe);

export default router;
