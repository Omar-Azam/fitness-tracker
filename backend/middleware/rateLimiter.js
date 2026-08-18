import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware for authentication routes (/login, /register)
 * Limits requests to 15 attempts per 15 minutes per IP address to prevent brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 15, // High limit for automated testing
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
