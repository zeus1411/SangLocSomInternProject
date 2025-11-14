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

// Helper: parse number from env with fallback
const parseEnvNumber = (value: string | undefined, defaultValue: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

// =================== CONFIG TỪ .ENV ===================
const LOGIN_CONFIG = {
  // 15 minutes default
  WINDOW_MS: parseEnvNumber(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 15 * 60 * 1000),
  // 5 login attempts default
  MAX_REQUESTS: parseEnvNumber(process.env.RATE_LIMIT_LOGIN_MAX_REQUESTS, 5),
  // Block 30 minutes default
  BLOCK_DURATION_MS: parseEnvNumber(
    process.env.RATE_LIMIT_LOGIN_BLOCK_DURATION_MS,
    30 * 60 * 1000
  )
};

const FORM_SUBMISSION_CONFIG = {
  // 5 minutes default
  WINDOW_MS: parseEnvNumber(process.env.RATE_LIMIT_FORM_WINDOW_MS, 5 * 60 * 1000),
  // 10 submissions per 5 min (authenticated) default
  MAX_REQUESTS_AUTHENTICATED: parseEnvNumber(
    process.env.RATE_LIMIT_FORM_MAX_AUTH,
    10
  ),
  // 3 submissions per 5 min (anonymous/IP) default
  MAX_REQUESTS_ANONYMOUS: parseEnvNumber(
    process.env.RATE_LIMIT_FORM_MAX_ANON,
    3
  ),
  // Block 10 minutes default
  BLOCK_DURATION_MS: parseEnvNumber(
    process.env.RATE_LIMIT_FORM_BLOCK_DURATION_MS,
    10 * 60 * 1000
  )
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
  console.log(
    `🧹 Rate limit cleanup: Login=${loginRateLimitStore.size}, Form=${formSubmissionRateLimitStore.size}`
  );
}, 5 * 60 * 1000);

// =================== LOGIN RATE LIMIT (THEO ACCOUNT, KHÔNG THUẦN IP) ===================
/**
 * Rate limiter for login/token generation
 * Ưu tiên limit theo username/email, fallback về IP
 */
export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.ip ||
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    'unknown') as string;

  // Ưu tiên username / email, fallback về IP
  const identifier = ((req.body?.username || req.body?.email || clientIp) as string)
    .toString()
    .toLowerCase()
    .trim();

  const now = Date.now();

  let entry = loginRateLimitStore.get(identifier);

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
    loginRateLimitStore.set(identifier, entry);
    // Header cho lần đầu
    res.setHeader('X-RateLimit-Limit', LOGIN_CONFIG.MAX_REQUESTS.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      (LOGIN_CONFIG.MAX_REQUESTS - entry.count).toString()
    );
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(entry.firstRequestTime + LOGIN_CONFIG.WINDOW_MS).toISOString()
    );
    return next();
  }

  // Increment
  entry.count++;

  // Check limit
  if (entry.count > LOGIN_CONFIG.MAX_REQUESTS) {
    entry.blockedUntil = now + LOGIN_CONFIG.BLOCK_DURATION_MS;
    loginRateLimitStore.set(identifier, entry);

    const blockMinutes = Math.ceil(LOGIN_CONFIG.BLOCK_DURATION_MS / 60000);
    return ResponseUtil.error(
      res,
      `Quá nhiều lần đăng nhập. Tài khoản của bạn đã bị khóa tạm thời trong ${blockMinutes} phút.`,
      429
    );
  }

  loginRateLimitStore.set(identifier, entry);

  // Headers
  res.setHeader('X-RateLimit-Limit', LOGIN_CONFIG.MAX_REQUESTS.toString());
  res.setHeader(
    'X-RateLimit-Remaining',
    (LOGIN_CONFIG.MAX_REQUESTS - entry.count).toString()
  );
  res.setHeader(
    'X-RateLimit-Reset',
    new Date(entry.firstRequestTime + LOGIN_CONFIG.WINDOW_MS).toISOString()
  );

  next();
};

// =================== FORM SUBMISSION RATE LIMIT ===================
/**
 * Rate limiter for form submissions
 * Different limits for authenticated vs anonymous users
 */
export const formSubmissionRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const now = Date.now();

  // Determine identifier and limits
  const isAuthenticated = !!req.user;

  const clientIp = ((req as any).clientIp ||
    req.ip ||
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    'unknown') as string;

  // identifier luôn là string
  const identifier: string = isAuthenticated
    // ưu tiên email, nếu không có thì dùng userid, cuối cùng fallback clientIp / 'unknown'
    ? (req.user!.email ?? (req.user as any).userid ?? clientIp ?? 'unknown')
    : (clientIp ?? 'unknown');

  const maxRequests = isAuthenticated
    ? FORM_SUBMISSION_CONFIG.MAX_REQUESTS_AUTHENTICATED
    : FORM_SUBMISSION_CONFIG.MAX_REQUESTS_ANONYMOUS;

  console.log(
    `🔍 Form submission rate check: ${identifier} (${isAuthenticated ? 'authenticated' : 'anonymous'})`
  );

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
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(entry.firstRequestTime + FORM_SUBMISSION_CONFIG.WINDOW_MS).toISOString()
    );

    console.log(
      `✅ Rate limit init/reset: ${identifier} (${entry.count}/${maxRequests})`
    );

    return next();
  }

  // Increment
  entry.count++;

  // Check limit
  if (entry.count > maxRequests) {
    entry.blockedUntil = now + FORM_SUBMISSION_CONFIG.BLOCK_DURATION_MS;
    formSubmissionRateLimitStore.set(identifier, entry);

    const blockMinutes = Math.ceil(FORM_SUBMISSION_CONFIG.BLOCK_DURATION_MS / 60000);

    console.log(
      `🚫 Rate limit exceeded: ${identifier} (${entry.count}/${maxRequests})`
    );

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
  res.setHeader(
    'X-RateLimit-Reset',
    new Date(entry.firstRequestTime + FORM_SUBMISSION_CONFIG.WINDOW_MS).toISOString()
  );

  console.log(
    `✅ Rate limit check passed: ${identifier} (${entry.count}/${maxRequests})`
  );

  next();
};

// =================== RESET HÀM CHO BACKDOOR API ===================
export const resetLoginRateLimitStore = () => {
  loginRateLimitStore.clear();
};

export const resetFormSubmissionRateLimitStore = () => {
  formSubmissionRateLimitStore.clear();
};

export const resetAllRateLimitStores = () => {
  loginRateLimitStore.clear();
  formSubmissionRateLimitStore.clear();
};
