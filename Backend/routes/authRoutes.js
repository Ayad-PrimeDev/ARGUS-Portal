const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

// Define route for user registration
// POST /api/auth/register
router.post('/register', registerUser);

// Define route for user login
// POST /api/auth/login
router.post('/login', loginUser);

// Define route for user logout
// POST /api/auth/logout
router.post('/logout', logoutUser);

module.exports = router;
