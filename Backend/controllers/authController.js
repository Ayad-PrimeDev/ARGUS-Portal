const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail, isEmailConfigured } = require('../utils/helpers');

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

        if (password.length < 8) {
            res.status(400);
            throw new Error('Password must be at least 8 characters long');
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
                role: user.role || 'USER',
                isSuspended: !!user.isSuspended,
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
            if (user.isSuspended) {
                res.status(403);
                throw new Error(`Your account has been suspended${user.suspensionReason ? ': ' + user.suspensionReason : '. Please contact university support.'}`);
            }

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
                role: user.role || 'USER',
                isSuspended: !!user.isSuspended,
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

// @desc Change current user's password
// @route PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400);
            throw new Error('Please provide current password and new password');
        }

        if (newPassword.length < 8) {
            res.status(400);
            throw new Error('New password must be at least 8 characters long');
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            res.status(400);
            throw new Error('New password and confirmation do not match');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400);
            throw new Error('Current password is incorrect');
        }

        if (currentPassword === newPassword) {
            res.status(400);
            throw new Error('New password must be different from current password');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            message: 'Password updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc Request password reset token and email
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400);
            throw new Error('Please provide an email address');
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        let resetToken = null;
        let resetUrl = null;

        if (user) {
            // Generate cryptographically secure random token (32 bytes = 64 hex characters)
            resetToken = crypto.randomBytes(32).toString('hex');

            // Store SHA-256 hash in database
            user.resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            // 30 minute expiration window
            user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
            await user.save();

            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            resetUrl = `${clientUrl}/reset-password/${resetToken}`;

            if (isEmailConfigured()) {
                const messageHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E7E3DA; border-radius: 12px; background-color: #FAF8F5; color: #1C201D;">
                        <h2 style="color: #1B382B; margin-top: 0; font-size: 22px;">ARGUS Portal Password Reset</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #5C645E;">
                            You are receiving this email because a password reset was requested for your account.
                        </p>
                        <p style="margin: 24px 0;">
                            <a href="${resetUrl}" style="background-color: #1B382B; color: #FBF9F5; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                                Reset Your Password
                            </a>
                        </p>
                        <p style="font-size: 12px; color: #8A928D; line-height: 1.5;">
                            This link is time-limited and will expire in <strong>30 minutes</strong>. If you did not request this reset, you can safely ignore this email — your account remains secure.
                        </p>
                        <hr style="border: none; border-top: 1px solid #E7E3DA; margin: 20px 0;" />
                        <p style="font-size: 11px; color: #8A928D; word-break: break-all;">
                            If the button above does not work, copy and paste this URL into your browser:<br />
                            <a href="${resetUrl}" style="color: #1B382B;">${resetUrl}</a>
                        </p>
                    </div>
                `;

                const messageText = `ARGUS Portal — Password Reset Request\n\n` +
                    `You requested a password reset for your ARGUS account.\n\n` +
                    `Please visit the following URL to reset your password within 30 minutes:\n` +
                    `${resetUrl}\n\n` +
                    `If you did not request this, please ignore this email.`;

                await sendEmail({
                    to: user.email,
                    subject: 'ARGUS Portal — Password Reset Request',
                    html: messageHtml,
                    text: messageText,
                });
            } else {
                console.warn(
                    `[ARGUS NOTICE] Password reset requested for ${user.email}, but email service is not configured.\n` +
                    `Local reset URL: ${resetUrl}`
                );
            }
        }

        // If email service is not configured on the server, explain clearly to the client
        if (!isEmailConfigured()) {
            return res.status(200).json({
                message: 'Email delivery service is currently not configured on the server. Please configure SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL) to send password reset emails.',
                emailConfigured: false,
                devResetUrl: (process.env.NODE_ENV !== 'production' && resetUrl) ? resetUrl : undefined,
            });
        }

        // When configured, return neutral response to prevent email enumeration
        res.status(200).json({
            message: 'If an account with that email exists, password-reset instructions will be sent.',
            emailConfigured: true,
        });
    } catch (error) {
        next(error);
    }
};

// @desc Reset user password with token
// @route POST /api/auth/reset-password/:token
// @access Public
const resetPassword = async (req, res, next) => {
    try {
        const token = req.params.token || req.body.token;
        const { password, confirmPassword } = req.body;

        if (!token) {
            res.status(400);
            throw new Error('Reset token is required');
        }

        if (!password) {
            res.status(400);
            throw new Error('Please enter a new password');
        }

        if (password.length < 8) {
            res.status(400);
            throw new Error('Password must be at least 8 characters long');
        }

        if (confirmPassword && password !== confirmPassword) {
            res.status(400);
            throw new Error('Passwords do not match');
        }

        // Hash the incoming plaintext token to match the database SHA-256 hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400);
            throw new Error('Password reset token is invalid or has expired');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Invalidate single-use token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Invalidate any existing auth cookies
        const options = getCookieOptions();
        delete options.maxAge;
        res.clearCookie('jwt', options);

        res.status(200).json({
            message: 'Password has been reset successfully. You can now sign in with your new password.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    forgotPassword,
    resetPassword,
    getCookieOptions,
};
