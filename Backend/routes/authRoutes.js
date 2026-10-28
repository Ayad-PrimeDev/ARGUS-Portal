const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { passwordResetLimiter } = require('../middleware/rateLimitMiddleware');

// Define route for user registration
// POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// Define route for user login
// POST /api/auth/login
router.post('/login', loginValidation, loginUser);

// Define route for user logout
// POST /api/auth/logout
router.post('/logout', logoutUser);

// Define route to change password for logged-in user
// PUT /api/auth/change-password
router.put('/change-password', protect, changePasswordValidation, changePassword);

// Define route to request password reset token
// POST /api/auth/forgot-password
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, forgotPassword);

// Define route to reset password using token
// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', passwordResetLimiter, resetPasswordValidation, resetPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidation, resetPassword);

module.exports = router;
