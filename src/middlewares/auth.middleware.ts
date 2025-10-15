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
    return ResponseUtil.unauthorized(res, error.message || 'Invalid or expired token');
  }
};

// export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       const decoded = verifyToken(token);
//       req.user = decoded;
//     }
//     next();
//   } catch (error) {
//     next();
//   }
// };

// export const roleMiddleware = (allowedRoles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const user = req.user;

//       if (!user) {
//         return ResponseUtil.unauthorized(res, 'Authentication required');
//       }

//       next();
//     } catch (error: any) {
//       return ResponseUtil.serverError(res, error.message);
//     }
//   };
// };