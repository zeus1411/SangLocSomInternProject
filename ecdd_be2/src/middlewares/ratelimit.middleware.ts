import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

/**
 * Simple in-memory rate limiter for token generation
 * Prevents abuse by limiting token requests per IP
 */

interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
  blockedUntil?: number;
}

// Store rate limit data in memory (IP -> RateLimitEntry)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 token requests per 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // Block for 30 minutes if exceeded

/**
 * Clean up old entries periodically to prevent memory leak
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    // Remove entries older than block duration
    if (entry.blockedUntil && entry.blockedUntil < now) {
      rateLimitStore.delete(ip);
    } else if (!entry.blockedUntil && (now - entry.firstRequestTime) > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Rate limiting middleware for login/token generation endpoints
 */
export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
  const now = Date.now();

  let entry = rateLimitStore.get(clientIp);

  // Check if IP is currently blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const remainingMinutes = Math.ceil((entry.blockedUntil - now) / 60000);
    return ResponseUtil.error(
      res,
      `Too many login attempts. Please try again in ${remainingMinutes} minutes.`,
      429
    );
  }

  // Initialize or reset entry if window expired
  if (!entry || (now - entry.firstRequestTime) > RATE_LIMIT_WINDOW_MS) {
    entry = {
      count: 1,
      firstRequestTime: now
    };
    rateLimitStore.set(clientIp, entry);
    return next();
  }

  // Increment request count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    rateLimitStore.set(clientIp, entry);
    
    const blockMinutes = Math.ceil(BLOCK_DURATION_MS / 60000);
    return ResponseUtil.error(
      res,
      `Too many login attempts. Your IP has been temporarily blocked for ${blockMinutes} minutes.`,
      429
    );
  }

  // Update entry
  rateLimitStore.set(clientIp, entry);

  // Add rate limit info to response headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
  res.setHeader('X-RateLimit-Remaining', (MAX_REQUESTS_PER_WINDOW - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(entry.firstRequestTime + RATE_LIMIT_WINDOW_MS).toISOString());

  next();
};
