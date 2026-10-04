const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// Define route for user registration
// POST /api/auth/register
router.post('/register', registerUser);

module.exports = router;
