/**
 * Secure Admin Initialization Script
 * 
 * Usage:
 *   node scripts/makeAdmin.js <user-email>
 * 
 * Example:
 *   node scripts/makeAdmin.js admin@argus.edu
 * 
 * This script safely promotes an existing registered user to the 'ADMIN' role
 * directly via the database, without exposing any public endpoints or hardcoding credentials.
 */

const mongoose = require('mongoose');
const dns = require('node:dns');
const dotenv = require('dotenv');
const path = require('path');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const emailArg = process.argv[2];

if (!emailArg) {
    console.error('❌ Please provide the email of the user to promote to ADMIN.');
    console.error('Usage: node scripts/makeAdmin.js <user-email>');
    process.exit(1);
}

const promoteUser = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is not set in environment.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Connected to MongoDB Atlas.');

        const email = emailArg.trim().toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User with email "${email}" not found.`);
            console.error('Please register this user through the ARGUS Portal first, then run this script.');
            process.exit(1);
        }

        if (user.role === 'ADMIN') {
            console.log(`ℹ️ User "${user.name}" (${user.email}) is already an ADMIN.`);
            process.exit(0);
        }

        user.role = 'ADMIN';
        user.isSuspended = false;
        await user.save();

        // Create an audit log record for this administrative bootstrap
        await AuditLog.create({
            adminId: user._id,
            action: 'ROLE_CHANGE',
            targetType: 'USER',
            targetId: user._id,
            details: `Initial administrator promotion via secure CLI script for ${user.email}`,
            reason: 'First administrator bootstrap via CLI',
            metadata: { userEmail: user.email, promotedVia: 'CLI_SCRIPT' }
        });

        console.log(` Success! User "${user.name}" (${user.email}) has been promoted to ADMIN.`);
        console.log(`They can now sign in at /login and access /admin.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to promote user:', err.message);
        process.exit(1);
    }
};

promoteUser();
