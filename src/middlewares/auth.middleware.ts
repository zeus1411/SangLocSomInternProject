import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';

/**
 * Extend Express Request type để thêm user property
 * Sau khi verify token thành công, thông tin user sẽ được lưu vào req.user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Auth Middleware - Bắt buộc phải đăng nhập
 * Sử dụng cho các API cần authentication (POST, PUT, DELETE)
 * 
 * Usage:
 * router.post('/forminstances', authMiddleware, controller.create);
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Lấy Authorization header
    const authHeader = req.headers.authorization;

    // 2. Kiểm tra header có tồn tại và đúng format "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.unauthorized(res, 'No token provided. Please login first.');
    }

    // 3. Extract token (bỏ "Bearer " prefix)
    const token = authHeader.substring(7); // "Bearer ".length = 7

    // 4. Verify token
    const decoded = verifyToken(token);

    // 5. Lưu thông tin user vào request để sử dụng ở controller
    req.user = decoded;

    // 6. Cho phép request tiếp tục
    next();
  } catch (error: any) {
    // Token không hợp lệ hoặc đã hết hạn
    return ResponseUtil.unauthorized(res, error.message || 'Invalid or expired token');
  }
};

/**
 * Optional Auth Middleware - Không bắt buộc đăng nhập
 * Nếu có token hợp lệ thì set req.user, không có cũng OK
 * Sử dụng cho các API có thể truy cập cả khi chưa login nhưng có thêm tính năng khi đã login
 * 
 * Usage:
 * router.get('/forminstances', optionalAuthMiddleware, controller.getAll);
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // Nếu có token thì verify
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    // Không có token hoặc token invalid vẫn cho pass
    next();
  } catch (error) {
    // Nếu token invalid, vẫn cho pass nhưng không set req.user
    next();
  }
};

/**
 * Role-based Auth Middleware (Mở rộng sau nếu cần phân quyền)
 * 
 * Usage:
 * router.delete('/forminstances/:id', authMiddleware, roleMiddleware(['admin']), controller.delete);
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return ResponseUtil.unauthorized(res, 'Authentication required');
      }

      // TODO: Check user role from database
      // const userRole = await getUserRole(user.userId);
      // if (!allowedRoles.includes(userRole)) {
      //   return ResponseUtil.forbidden(res, 'You do not have permission to perform this action');
      // }

      next();
    } catch (error: any) {
      return ResponseUtil.serverError(res, error.message);
    }
  };
};