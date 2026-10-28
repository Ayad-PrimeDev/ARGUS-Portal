const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for password reset actions (Forgot Password & Reset Password).
 * Limits each IP address to 5 requests per 15-minute window to prevent abuse.
 */
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many password reset requests from this IP. Please try again after 15 minutes.',
    },
});

module.exports = {
    passwordResetLimiter,
};
