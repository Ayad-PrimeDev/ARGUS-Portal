const User = require('../models/User');
const bcrypt = require('bcrypt');

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

module.exports = {
    registerUser
};
