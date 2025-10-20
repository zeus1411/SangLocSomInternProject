import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      clientIp?: string;
    }
  }
}

/**
 * Enhanced auth middleware - Handle 3 cases
 * Case 1: Token expired -> return 401 and force re-login
 * Case 2: Valid token -> attach user to request, get createdBy from token
 * Case 3: No token -> continue without user, capture IP address
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Always capture client IP (for Case 3)
    req.clientIp = (req.ip || 
                    req.headers['x-forwarded-for'] || 
                    req.socket.remoteAddress || 
                    'unknown') as string;
    
    // Handle array from x-forwarded-for
    if (Array.isArray(req.clientIp)) {
      req.clientIp = req.clientIp[0];
    }
    
    console.log(`📍 Request from IP: ${req.clientIp}`);

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // CASE 3: No token - Continue but track IP
      console.log(`⚠️ Case 3: No token provided. IP: ${req.clientIp}`);
      req.user = undefined;
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyToken(token);
      
      // CASE 2: Valid token - Attach user info
      console.log(`✅ Case 2: Valid token for user: ${decoded.email}`);
      req.user = decoded;
      next();
      
    } catch (error: any) {
      // CASE 1: Token expired or invalid
      if (error.message.includes('expired')) {
        console.log(`❌ Case 1: Token expired for IP: ${req.clientIp}`);
        return ResponseUtil.unauthorized(res, 'Token đã hết hạn. Vui lòng đăng nhập lại để tiếp tục chỉnh sửa.');
      }
      
      // Invalid token - treat as Case 3
      console.log(`⚠️ Invalid token, treating as Case 3. IP: ${req.clientIp}`);
      req.user = undefined;
      next();
    }
    
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return ResponseUtil.serverError(res, error.message);
  }
};

/**
 * Strict auth middleware - Requires valid token (for sensitive operations)
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Capture IP
    req.clientIp = (req.ip || 
                    req.headers['x-forwarded-for'] || 
                    req.socket.remoteAddress || 
                    'unknown') as string;
    
    if (Array.isArray(req.clientIp)) {
      req.clientIp = req.clientIp[0];
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.unauthorized(res, 'Không tìm thấy token. Vui lòng đăng nhập.');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    console.log(`✅ Authenticated: ${decoded.email} from IP: ${req.clientIp}`);
    req.user = decoded;
    next();
    
  } catch (error: any) {
    if (error.message.includes('expired')) {
      return ResponseUtil.unauthorized(res, 'Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    return ResponseUtil.unauthorized(res, error.message || 'Token không hợp lệ');
  }
};