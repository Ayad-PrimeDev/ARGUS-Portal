const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Define route for user registration
// POST /api/auth/register
router.post('/register', registerUser);

// Define route for user login
// POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;
