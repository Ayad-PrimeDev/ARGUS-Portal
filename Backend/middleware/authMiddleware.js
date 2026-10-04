const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Read JWT from HTTP-only cookie
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            // 2. Verify token using JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find user from database 
            // 4. Attach user information to req.user (excluding the password)
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Continue request
            next();
        } catch (error) {
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

module.exports = { protect };
