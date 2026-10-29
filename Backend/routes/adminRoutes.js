const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAdminStats,
    getUsers,
    getUserDetails,
    updateUserStatus,
    updateUserRole,
    getAdminItems,
    updateItemStatus,
    moderateItem,
    getAdminClaims,
    resolveClaimByAdmin,
    getModerationQueue,
    dismissFlags,
    getAuditLogs
} = require('../controllers/adminController');

// All admin routes require authentication and ADMIN role
router.use(protect);
router.use(admin);

// Overview / Platform Stats
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);

// Lost & Found Reports Management
router.get('/items', getAdminItems);
router.patch('/items/:id/status', updateItemStatus);
router.patch('/items/:id/moderate', moderateItem);

// Claims & Disputes
router.get('/claims', getAdminClaims);
router.patch('/claims/:id/resolve', resolveClaimByAdmin);

// Content Moderation Queue
router.get('/moderation', getModerationQueue);
router.post('/moderation/:id/dismiss', dismissFlags);

// System Audit Logs
router.get('/logs', getAuditLogs);

module.exports = router;
