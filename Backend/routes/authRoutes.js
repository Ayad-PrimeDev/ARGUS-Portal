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
const { protect, passwordResetLimiter } = require('../middleware/authMiddleware');

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/logout', logoutUser);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPasswordValidation, resetPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidation, resetPassword);

module.exports = router;
