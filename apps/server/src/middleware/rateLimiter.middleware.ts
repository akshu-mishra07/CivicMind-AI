import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for all API endpoints
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 * 15 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login or registration attempts. Please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for expensive AI endpoints (chat assistant, image analysis, transcribing)
 * 20 requests per 5 minutes
 */
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 AI operations per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI requests. Please try again after 5 minutes.',
  },
});
