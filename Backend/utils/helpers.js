const nodemailer = require('nodemailer');

/**
 * Safely escapes regular expression special characters to prevent regex injection attacks.
 * @param {string} string 
 * @returns {string} 
 */
const escapeRegex = (string) => {
    if (!string || typeof string !== 'string') return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Checks whether SMTP credentials have been provided in the environment.
 * @returns {boolean}
 */
const isEmailConfigured = () => {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );
};

/**
 * Send an email using nodemailer if configured.
 * @param {Object} options - { to, subject, html, text }
 * @returns {Promise<{ success: boolean, configured: boolean, error?: string }>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
    if (!isEmailConfigured()) {
        console.warn(
            '[ARGUS Email Warning] SMTP environment variables are not configured. Email will not be dispatched.\n' +
            'Required variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL'
        );
        return {
            success: false,
            configured: false,
            error: 'Email service is not configured on this server.',
        };
    }

    try {
        const port = parseInt(process.env.SMTP_PORT || '587', 10);
        const secure = process.env.SMTP_SECURE === 'true' || port === 465;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const fromAddress = process.env.FROM_EMAIL || 'no-reply@argusportal.com';
        const fromName = process.env.FROM_NAME || 'ARGUS Portal';

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to,
            subject,
            text,
            html,
        });

        return {
            success: true,
            configured: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error('[ARGUS Email Error] Failed to send email via SMTP:', error.message);
        return {
            success: false,
            configured: true,
            error: error.message,
        };
    }
};

module.exports = {
    escapeRegex,
    isEmailConfigured,
    sendEmail,
};
