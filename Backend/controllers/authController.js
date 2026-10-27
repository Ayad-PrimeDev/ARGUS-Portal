
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Cookie settings for local development and production
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
});

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields: name, email, and password');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User with this email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc Login user & get token
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please add email and password');
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not configured');
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.cookie('jwt', token, getCookieOptions());

            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc Logout user / clear cookie
// @route POST /api/auth/logout
// @access Public
const logoutUser = (req, res) => {
    const options = getCookieOptions();
    delete options.maxAge;

    res.clearCookie('jwt', options);

    res.status(200).json({
        message: 'User logged out successfully',
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};
