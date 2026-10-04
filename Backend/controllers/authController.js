const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        // 1. Receive data from request body
        const { name, email, password } = req.body;

        // Validate inputs
        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields: name, email, and password');
        }

        // 2. Check if email already exists in database
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User with this email already exists');
        }

        // 3. Hash password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save user into MongoDB
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 5. Return user information without password
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error); // Pass errors to global error handler
    }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        // 1. Receive data from request body
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please add email and password');
        }

        // 2. Find user by email
        const user = await User.findOne({ email });

        // 3. Compare password using bcrypt
        if (user && (await bcrypt.compare(password, user.password))) {
            
            // 4. Generate JWT token
            const token = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '30d' }
            );

            // 5. Store JWT token in HTTP-only cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // 6. Return user details without password
            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser
};
