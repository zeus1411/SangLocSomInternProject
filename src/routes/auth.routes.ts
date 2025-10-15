import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { loginRateLimiter } from '../middlewares/ratelimit.middleware';

const router = Router();
const authController = new AuthController();

// Public routes with rate limiting to prevent abuse
router.post('/register', loginRateLimiter, (req, res) => authController.register(req, res));
router.post('/login', loginRateLimiter, (req, res) => authController.login(req, res));

// Protected routes
router.get('/profile', authMiddleware, (req, res) => authController.getProfile(req, res));

// Update profile - Optional auth (3 JWT cases)
router.put('/profile/:id', optionalAuthMiddleware, (req, res) => authController.updateProfile(req, res));

export default router;