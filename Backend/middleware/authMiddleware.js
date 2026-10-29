
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const token = req.cookies?.jwt;

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, no token',
        });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'Not authorized, user not found',
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                message: `Account suspended: ${user.suspensionReason || 'Please contact administration for assistance.'}`,
                isSuspended: true
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Not authorized, token failed',
            });
        }

        return next(error);
    }
};

/**
 * Authorization middleware for administrative privileges
 * Requires protect middleware to have executed first.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }

    return res.status(403).json({
        message: 'Access denied: Administrator privileges required'
    });
};

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

module.exports = { protect, admin, passwordResetLimiter };
