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
 * Strict auth middleware - requires valid token
 * Case 1: Token expired -> return 401 and force re-login
 * No token or invalid token -> return 401
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.unauthorized(res, 'No token provided. Please login first.');
    }
    const token = authHeader.substring(7); 
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    // Case 1: Token expired - force re-login
    if (error.message.includes('expired')) {
      return ResponseUtil.unauthorized(res, 'Token has expired. Please login again to continue editing.');
    }
    return ResponseUtil.unauthorized(res, error.message || 'Invalid or expired token');
  }
};

/**
 * Optional auth middleware - allows requests with or without token
 * Case 1: Token expired -> return 401 and force re-login
 * Case 2: Valid token -> attach user to request
 * Case 3: No token -> continue without user (IP will be captured in controller)
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        // Case 2: Valid token - attach user info
        req.user = decoded;
      } catch (error: any) {
        // Case 1: Token expired - force re-login
        if (error.message.includes('expired')) {
          return ResponseUtil.unauthorized(res, 'Token has expired. Please login again to continue editing.');
        }
        // Invalid token - treat as no token (Case 3)
        req.user = undefined;
      }
    }
    // Case 3: No token - continue (IP will be captured in controller)
    next();
  } catch (error: any) {
    return ResponseUtil.serverError(res, error.message);
  }
};