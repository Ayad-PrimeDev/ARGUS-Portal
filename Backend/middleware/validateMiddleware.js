const { body, validationResult } = require('express-validator');

// Reusable middleware to inspect validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Validation rules for user registration
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    validateRequest
];

// Validation rules for changing password
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('New password and confirmation do not match');
            }
            return true;
        }),
    validateRequest
];

// Validation rules for forgot password request
const forgotPasswordValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    validateRequest
];

// Validation rules for resetting password with token
const resetPasswordValidation = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    validateRequest
];

// Validation rules for user login
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validateRequest
];

// Validation rules for item creation
const createItemValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required'),
    body('type')
        .trim()
        .notEmpty()
        .withMessage('Type is required')
        .isIn(['LOST', 'FOUND'])
        .withMessage('Type must be either LOST or FOUND'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required'),
    validateRequest
];

// Validation rules for claim creation
const createClaimValidation = [
    body('itemId')
        .trim()
        .notEmpty()
        .withMessage('Item ID is required')
        .isMongoId()
        .withMessage('Invalid Item ID format'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required'),
    validateRequest
];

module.exports = {
    validateRequest,
    registerValidation,
    loginValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    createItemValidation,
    createClaimValidation
};
