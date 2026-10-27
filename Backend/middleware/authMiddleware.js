
const jwt = require('jsonwebtoken');
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

module.exports = { protect };
