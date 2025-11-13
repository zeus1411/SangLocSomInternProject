import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
  blockedUntil?: number;
}

// Separate stores for different purposes
const loginRateLimitStore = new Map<string, RateLimitEntry>();
const formSubmissionRateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const LOGIN_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000,      // 15 minutes
  MAX_REQUESTS: 5,                 // 5 login attempts
  BLOCK_DURATION_MS: 30 * 60 * 1000 // Block 30 minutes
};

const FORM_SUBMISSION_CONFIG = {
  WINDOW_MS: 5 * 60 * 1000,        // 5 minutes
  MAX_REQUESTS_AUTHENTICATED: 10,   // 10 submissions per 5 min (authenticated)
  MAX_REQUESTS_ANONYMOUS: 3,        // 3 submissions per 5 min (anonymous/IP)
  BLOCK_DURATION_MS: 10 * 60 * 1000 // Block 10 minutes
};

// Cleanup function
const cleanupStore = (store: Map<string, RateLimitEntry>, windowMs: number) => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.blockedUntil && entry.blockedUntil < now) {
      store.delete(key);
    } else if (!entry.blockedUntil && (now - entry.firstRequestTime) > windowMs) {
      store.delete(key);
    }
  }
};

// Cleanup every 5 minutes
setInterval(() => {
  cleanupStore(loginRateLimitStore, LOGIN_CONFIG.WINDOW_MS);
  cleanupStore(formSubmissionRateLimitStore, FORM_SUBMISSION_CONFIG.WINDOW_MS);
  console.log(`🧹 Rate limit cleanup: Login=${loginRateLimitStore.size}, Form=${formSubmissionRateLimitStore.size}`);
}, 5 * 60 * 1000);

/**
 * Rate limiter for login/token generation
 */
export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
  const now = Date.now();

  let entry = loginRateLimitStore.get(clientIp);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const remainingMinutes = Math.ceil((entry.blockedUntil - now) / 60000);
    return ResponseUtil.error(
      res,
      `Quá nhiều lần đăng nhập. Vui lòng thử lại sau ${remainingMinutes} phút.`,
      429
    );
  }

  // Initialize or reset
  if (!entry || (now - entry.firstRequestTime) > LOGIN_CONFIG.WINDOW_MS) {
    entry = { count: 1, firstRequestTime: now };
    loginRateLimitStore.set(clientIp, entry);
    return next();
  }

  // Increment
  entry.count++;

  // Check limit
  if (entry.count > LOGIN_CONFIG.MAX_REQUESTS) {
    entry.blockedUntil = now + LOGIN_CONFIG.BLOCK_DURATION_MS;
    loginRateLimitStore.set(clientIp, entry);
    
    const blockMinutes = Math.ceil(LOGIN_CONFIG.BLOCK_DURATION_MS / 60000);
    return ResponseUtil.error(
      res,
      `Quá nhiều lần đăng nhập. IP của bạn đã bị khóa tạm thời trong ${blockMinutes} phút.`,
      429
    );
  }

  loginRateLimitStore.set(clientIp, entry);

  // Headers
  res.setHeader('X-RateLimit-Limit', LOGIN_CONFIG.MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', (LOGIN_CONFIG.MAX_REQUESTS - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(entry.firstRequestTime + LOGIN_CONFIG.WINDOW_MS).toISOString());

  next();
};

/**
 * Rate limiter for form submissions
 * Different limits for authenticated vs anonymous users
 */
export const formSubmissionRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  
  // Determine identifier and limits
  // => Chỉ cần check xem có req.user hay không là biết user đã đăng nhập
  const isAuthenticated = !!req.user;

  // identifier luôn là string (không để TS đoán 'string | undefined')
  const identifier: string = isAuthenticated
    // ưu tiên email, nếu không có thì dùng userid, cuối cùng fallback clientIp / 'unknown'
    ? (req.user!.email ?? (req.user as any).userid ?? (req as any).clientIp ?? 'unknown')
    : ((req as any).clientIp ?? 'unknown');

  const maxRequests = isAuthenticated 
    ? FORM_SUBMISSION_CONFIG.MAX_REQUESTS_AUTHENTICATED 
    : FORM_SUBMISSION_CONFIG.MAX_REQUESTS_ANONYMOUS;
  
  console.log(`🔍 Form submission rate check: ${identifier} (${isAuthenticated ? 'authenticated' : 'anonymous'})`);
  
  let entry = formSubmissionRateLimitStore.get(identifier);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const remainingMinutes = Math.ceil((entry.blockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Quá nhiều yêu cầu gửi form. Vui lòng thử lại sau ${remainingMinutes} phút.`,
      data: {
        limit: maxRequests,
        remaining: 0,
        resetAt: new Date(entry.blockedUntil).toISOString()
      }
    });
  }

  // Initialize or reset
  if (!entry || (now - entry.firstRequestTime) > FORM_SUBMISSION_CONFIG.WINDOW_MS) {
    entry = { count: 1, firstRequestTime: now };
    formSubmissionRateLimitStore.set(identifier, entry);

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.firstRequestTime + FORM_SUBMISSION_CONFIG.WINDOW_MS).toISOString());
    
    return next();
  }

  // Increment
  entry.count++;

  // Check limit
  if (entry.count > maxRequests) {
    entry.blockedUntil = now + FORM_SUBMISSION_CONFIG.BLOCK_DURATION_MS;
    formSubmissionRateLimitStore.set(identifier, entry);
    
    const blockMinutes = Math.ceil(FORM_SUBMISSION_CONFIG.BLOCK_DURATION_MS / 60000);
    
    console.log(`🚫 Rate limit exceeded: ${identifier} (${entry.count}/${maxRequests})`);

    return res.status(429).json({
      success: false,
      message: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${blockMinutes} phút.`,
      data: {
        limit: maxRequests,
        remaining: 0,
        resetAt: new Date(entry.blockedUntil).toISOString()
      }
    });
  }

  formSubmissionRateLimitStore.set(identifier, entry);

  // Headers
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(entry.firstRequestTime + FORM_SUBMISSION_CONFIG.WINDOW_MS).toISOString());

  console.log(`✅ Rate limit check passed: ${identifier} (${entry.count}/${maxRequests})`);
  
  next();
};