import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import {
  loginRateLimiter,
  resetAllRateLimitStores
} from '../middlewares/ratelimit.middleware';

const router = Router();
const authController = new AuthController();

// Public routes with rate limiting to prevent abuse
router.post('/register', loginRateLimiter, (req, res) => authController.register(req, res));
router.post('/login', loginRateLimiter, (req, res) => authController.login(req, res));

// Protected routes
router.get('/profile', authMiddleware, (req, res) => authController.getProfile(req, res));

// Update profile - Optional auth (3 JWT cases)
router.put('/profile/:id', optionalAuthMiddleware, (req, res) => authController.updateProfile(req, res));

// =================== BACKDOOR API RESET RATE LIMIT ===================
// POST /auth/ratelimit/reset
// - Cách 1: Admin đăng nhập (req.user.role === 'admin')
// - Cách 2: Gửi header X-RESET-KEY hoặc X-API-KEY == RATE_LIMIT_RESET_KEY trong .env
router.post('/ratelimit/reset', optionalAuthMiddleware, (req, res) => {
  const user = (req as any).user;
  const envResetKey = process.env.RATE_LIMIT_RESET_KEY;
  const headerKey =
    (req.headers['x-reset-key'] as string | undefined) ||
    (req.headers['x-api-key'] as string | undefined);

  const isAdmin =
    user &&
    (
      user.role === 'admin' ||
      user.role === 'ADMIN' || // dự phòng nếu bạn đang dùng kiểu này
      (user as any).isAdmin === true
    );

  const hasValidKey =
    typeof envResetKey === 'string' &&
    envResetKey.length > 0 &&
    typeof headerKey === 'string' &&
    headerKey === envResetKey;

  if (!isAdmin && !hasValidKey) {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền thực hiện thao tác reset rate limit.'
    });
  }

  resetAllRateLimitStores();

  return res.json({
    success: true,
    message: 'Đã reset rate limit store (login + form submissions).'
  });
});

export default router;
