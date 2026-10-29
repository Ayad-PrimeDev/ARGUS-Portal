const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const AuditLog = require('../models/AuditLog');
const { escapeRegex } = require('../utils/helpers');

/**
 * @desc    Get aggregate platform statistics
 * @route   GET /api/admin/stats
 * @access  Private / Admin
 */
const getAdminStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            activeUsers,
            suspendedUsers,
            adminUsers,
            totalLost,
            totalFound,
            activeReports,
            returnedItems,
            pendingClaims,
            approvedClaims,
            flaggedReports,
            recentLogs
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isSuspended: false }),
            User.countDocuments({ isSuspended: true }),
            User.countDocuments({ role: 'ADMIN' }),
            Item.countDocuments({ type: 'LOST' }),
            Item.countDocuments({ type: 'FOUND' }),
            Item.countDocuments({ status: 'ACTIVE' }),
            Item.countDocuments({ status: 'CLAIMED' }),
            Claim.countDocuments({ status: 'PENDING' }),
            Claim.countDocuments({ status: 'APPROVED' }),
            Item.countDocuments({ isFlagged: true, moderationStatus: { $in: ['FLAGGED', 'CLEAN'] } }),
            AuditLog.find()
                .populate('adminId', 'name email profileImage')
                .sort({ createdAt: -1 })
                .limit(8)
                .lean()
        ]);

        res.status(200).json({
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers,
                admins: adminUsers
            },
            items: {
                totalLost,
                totalFound,
                total: totalLost + totalFound,
                active: activeReports,
                returned: returnedItems
            },
            claims: {
                pending: pendingClaims,
                approved: approvedClaims,
                total: pendingClaims + approvedClaims
            },
            moderation: {
                flagged: flaggedReports
            },
            recentActivity: recentLogs
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get paginated users list with search & filters
 * @route   GET /api/admin/users
 * @access  Private / Admin
 */
const getUsers = async (req, res, next) => {
    try {
        const { search, role, status, page = 1, limit = 15 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        if (role && ['USER', 'ADMIN'].includes(role.toUpperCase())) {
            filter.role = role.toUpperCase();
        }

        if (status === 'active') {
            filter.isSuspended = false;
        } else if (status === 'suspended') {
            filter.isSuspended = true;
        }

        if (search && search.trim()) {
            const regex = new RegExp(escapeRegex(search.trim()), 'i');
            filter.$or = [{ name: regex }, { email: regex }];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -resetPasswordToken -resetPasswordExpires')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            users,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum) || 1
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get detailed user profile including report and claim history
 * @route   GET /api/admin/users/:id
 * @access  Private / Admin
 */
const getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .lean();

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const [items, claims] = await Promise.all([
            Item.find({ submitterId: user._id }).sort({ createdAt: -1 }).lean(),
            Claim.find({ requesterId: user._id })
                .populate('itemId', 'title type status location category imageUrl')
                .sort({ createdAt: -1 })
                .lean()
        ]);

        res.status(200).json({
            user,
            items,
            claims
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Suspend or reactivate user account
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private / Admin
 */
const updateUserStatus = async (req, res, next) => {
    try {
        const { isSuspended, reason } = req.body;

        if (typeof isSuspended !== 'boolean') {
            res.status(400);
            throw new Error('isSuspended boolean flag is required');
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Prevent self-suspension
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Administrators cannot suspend their own account.');
        }

        // Protect last active administrator from being suspended
        if (user.role === 'ADMIN' && isSuspended) {
            const activeAdmins = await User.countDocuments({ role: 'ADMIN', isSuspended: false });
            if (activeAdmins <= 1) {
                res.status(400);
                throw new Error('Cannot suspend the last active administrator on the system.');
            }
        }

        user.isSuspended = isSuspended;
        user.suspensionReason = isSuspended ? (reason || 'Administrative suspension') : '';
        await user.save();

        // Record audit log
        await AuditLog.create({
            adminId: req.user._id,
            action: isSuspended ? 'USER_SUSPEND' : 'USER_REACTIVATE',
            targetType: 'USER',
            targetId: user._id,
            details: `${isSuspended ? 'Suspended' : 'Reactivated'} account for user ${user.email} (${user.name})`,
            reason: reason || (isSuspended ? 'Account suspended by admin' : 'Account reactivated by admin'),
            metadata: { userEmail: user.email, userName: user.name, newSuspendedState: isSuspended }
        });

        res.status(200).json({
            message: `User account ${isSuspended ? 'suspended' : 'reactivated'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isSuspended: user.isSuspended,
                suspensionReason: user.suspensionReason
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user role (USER <-> ADMIN)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private / Admin
 */
const updateUserRole = async (req, res, next) => {
    try {
        const { role, reason } = req.body;

        if (!role || !['USER', 'ADMIN'].includes(role.toUpperCase())) {
            res.status(400);
            throw new Error('Role must be either USER or ADMIN');
        }

        const targetRole = role.toUpperCase();
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Check if trying to demote self or demote the last active administrator
        if (user.role === 'ADMIN' && targetRole === 'USER') {
            const activeAdmins = await User.countDocuments({ role: 'ADMIN', isSuspended: false });
            if (activeAdmins <= 1) {
                res.status(400);
                throw new Error('Cannot demote the last active administrator.');
            }
        }

        const previousRole = user.role;
        user.role = targetRole;
        await user.save();

        // Record audit log
        await AuditLog.create({
            adminId: req.user._id,
            action: 'ROLE_CHANGE',
            targetType: 'USER',
            targetId: user._id,
            details: `Changed role of user ${user.email} from ${previousRole} to ${targetRole}`,
            reason: reason || `Administrative role change to ${targetRole}`,
            metadata: { userEmail: user.email, previousRole, newRole: targetRole }
        });

        res.status(200).json({
            message: `User role updated to ${targetRole} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isSuspended: user.isSuspended
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all items for admin with full filters
 * @route   GET /api/admin/items
 * @access  Private / Admin
 */
const getAdminItems = async (req, res, next) => {
    try {
        const { search, type, category, status, moderationStatus, isHidden, page = 1, limit = 15 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        if (type && ['LOST', 'FOUND'].includes(type.toUpperCase())) {
            filter.type = type.toUpperCase();
        }

        if (status && ['ACTIVE', 'CLAIMED', 'ARCHIVED'].includes(status.toUpperCase())) {
            filter.status = status.toUpperCase();
        }

        if (category && category.trim() && category.toUpperCase() !== 'ALL') {
            filter.category = category.trim();
        }

        if (moderationStatus && ['CLEAN', 'FLAGGED', 'RESOLVED', 'REMOVED'].includes(moderationStatus.toUpperCase())) {
            filter.moderationStatus = moderationStatus.toUpperCase();
        }

        if (isHidden === 'true') {
            filter.isHidden = true;
        } else if (isHidden === 'false') {
            filter.isHidden = false;
        }

        if (search && search.trim()) {
            const regex = new RegExp(escapeRegex(search.trim()), 'i');
            filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
        }

        const [items, total] = await Promise.all([
            Item.find(filter)
                .populate('submitterId', 'name email profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Item.countDocuments(filter)
        ]);

        res.status(200).json({
            items,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum) || 1
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update report status (ACTIVE, CLAIMED, ARCHIVED)
 * @route   PATCH /api/admin/items/:id/status
 * @access  Private / Admin
 */
const updateItemStatus = async (req, res, next) => {
    try {
        const { status, reason } = req.body;

        if (!status || !['ACTIVE', 'CLAIMED', 'ARCHIVED'].includes(status.toUpperCase())) {
            res.status(400);
            throw new Error('Valid status is required: ACTIVE, CLAIMED, or ARCHIVED');
        }

        const item = await Item.findById(req.params.id);
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        const previousStatus = item.status;
        item.status = status.toUpperCase();
        await item.save();

        await AuditLog.create({
            adminId: req.user._id,
            action: 'ITEM_STATUS_CHANGE',
            targetType: 'ITEM',
            targetId: item._id,
            details: `Status of item "${item.title}" changed from ${previousStatus} to ${item.status}`,
            reason: reason || `Status updated to ${item.status} by administrator`,
            metadata: { itemTitle: item.title, previousStatus, newStatus: item.status }
        });

        res.status(200).json({
            message: `Item status updated to ${item.status}`,
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Moderate item (HIDE, UNHIDE, REMOVE, RESOLVE)
 * @route   PATCH /api/admin/items/:id/moderate
 * @access  Private / Admin
 */
const moderateItem = async (req, res, next) => {
    try {
        const { action, reason } = req.body;

        if (!action || !['HIDE', 'UNHIDE', 'REMOVE', 'RESOLVE'].includes(action.toUpperCase())) {
            res.status(400);
            throw new Error('Action must be HIDE, UNHIDE, REMOVE, or RESOLVE');
        }

        const item = await Item.findById(req.params.id);
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        const act = action.toUpperCase();
        if (act === 'HIDE') {
            item.isHidden = true;
            item.moderationStatus = 'FLAGGED';
        } else if (act === 'UNHIDE') {
            item.isHidden = false;
        } else if (act === 'REMOVE') {
            item.isHidden = true;
            item.status = 'ARCHIVED';
            item.moderationStatus = 'REMOVED';
        } else if (act === 'RESOLVE') {
            item.isFlagged = false;
            item.moderationStatus = 'RESOLVED';
        }

        if (reason) {
            item.moderationReason = reason.trim();
        }

        await item.save();

        await AuditLog.create({
            adminId: req.user._id,
            action: 'ITEM_MODERATED',
            targetType: 'ITEM',
            targetId: item._id,
            details: `Applied moderation action [${act}] to item "${item.title}"`,
            reason: reason || `Moderation action ${act} applied`,
            metadata: { itemTitle: item.title, action: act, isHidden: item.isHidden, moderationStatus: item.moderationStatus }
        });

        res.status(200).json({
            message: `Moderation action ${act} applied successfully`,
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all claims with dispute / status filters
 * @route   GET /api/admin/claims
 * @access  Private / Admin
 */
const getAdminClaims = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 15 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        if (status && ['PENDING', 'APPROVED', 'REJECTED', 'DISPUTED', 'CANCELLED'].includes(status.toUpperCase())) {
            filter.status = status.toUpperCase();
        }

        const [claims, total] = await Promise.all([
            Claim.find(filter)
                .populate('itemId', 'title type status location category imageUrl submitterId')
                .populate('requesterId', 'name email profileImage phoneNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Claim.countDocuments(filter)
        ]);

        // If search term is present, filter populated fields
        let filteredClaims = claims;
        if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            filteredClaims = claims.filter((c) =>
                (c.itemId && c.itemId.title && c.itemId.title.toLowerCase().includes(s)) ||
                (c.requesterId && c.requesterId.name && c.requesterId.name.toLowerCase().includes(s)) ||
                (c.requesterId && c.requesterId.email && c.requesterId.email.toLowerCase().includes(s)) ||
                (c.verificationAnswer && c.verificationAnswer.toLowerCase().includes(s))
            );
        }

        res.status(200).json({
            claims: filteredClaims,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum) || 1
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Resolve claim dispute or administrative claim approval / rejection
 * @route   PATCH /api/admin/claims/:id/resolve
 * @access  Private / Admin
 */
const resolveClaimByAdmin = async (req, res, next) => {
    try {
        const { status, decisionReason } = req.body;

        if (!status || !['APPROVED', 'REJECTED', 'DISPUTED', 'CANCELLED'].includes(status.toUpperCase())) {
            res.status(400);
            throw new Error('Valid status is required: APPROVED, REJECTED, DISPUTED, or CANCELLED');
        }

        if (!decisionReason || !decisionReason.trim()) {
            res.status(400);
            throw new Error('Please provide an administrative reason for this claim decision');
        }

        const claim = await Claim.findById(req.params.id).populate('itemId');
        if (!claim) {
            res.status(404);
            throw new Error('Claim not found');
        }

        const targetStatus = status.toUpperCase();
        const previousStatus = claim.status;
        claim.status = targetStatus;

        // Add to claim's status history
        claim.statusHistory = claim.statusHistory || [];
        claim.statusHistory.push({
            status: targetStatus,
            timestamp: new Date(),
            note: `Administrative decision: ${decisionReason.trim()}`,
            changedBy: req.user._id
        });

        // If approving claim, mark item as CLAIMED
        if (targetStatus === 'APPROVED' && claim.itemId) {
            const item = await Item.findById(claim.itemId._id || claim.itemId);
            if (item) {
                item.status = 'CLAIMED';
                await item.save();

                // Reject any other pending claims for this item
                await Claim.updateMany(
                    { itemId: item._id, _id: { $ne: claim._id }, status: 'PENDING' },
                    {
                        $set: { status: 'REJECTED' },
                        $push: {
                            statusHistory: {
                                status: 'REJECTED',
                                timestamp: new Date(),
                                note: 'Another claim was officially verified and approved by university administration.',
                                changedBy: req.user._id
                            }
                        }
                    }
                );
            }
        }

        await claim.save();

        // Audit log
        await AuditLog.create({
            adminId: req.user._id,
            action: 'CLAIM_DECISION',
            targetType: 'CLAIM',
            targetId: claim._id,
            details: `Administrative decision on claim: ${previousStatus} -> ${targetStatus}`,
            reason: decisionReason.trim(),
            metadata: {
                claimId: claim._id,
                itemId: claim.itemId?._id || claim.itemId,
                requesterId: claim.requesterId,
                previousStatus,
                newStatus: targetStatus
            }
        });

        res.status(200).json({
            message: `Claim status updated to ${targetStatus}`,
            claim
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get moderation queue (flagged reports awaiting review)
 * @route   GET /api/admin/moderation
 * @access  Private / Admin
 */
const getModerationQueue = async (req, res, next) => {
    try {
        const flaggedItems = await Item.find({
            $or: [
                { isFlagged: true },
                { moderationStatus: { $in: ['FLAGGED', 'REMOVED'] } }
            ]
        })
            .populate('submitterId', 'name email profileImage')
            .populate('flags.reportedBy', 'name email')
            .sort({ updatedAt: -1 })
            .lean();

        res.status(200).json({
            queue: flaggedItems,
            count: flaggedItems.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Dismiss flags on an item
 * @route   POST /api/admin/moderation/:id/dismiss
 * @access  Private / Admin
 */
const dismissFlags = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const item = await Item.findById(req.params.id);

        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        item.isFlagged = false;
        item.moderationStatus = 'RESOLVED';
        item.moderationReason = reason ? reason.trim() : 'Flagged report reviewed and dismissed by administrator.';
        await item.save();

        await AuditLog.create({
            adminId: req.user._id,
            action: 'MODERATION_FLAGS_DISMISSED',
            targetType: 'ITEM',
            targetId: item._id,
            details: `Dismissed flags on item "${item.title}"`,
            reason: reason || 'Reviewed and dismissed as non-violating',
            metadata: { itemTitle: item.title, previousFlagsCount: item.flags?.length || 0 }
        });

        res.status(200).json({
            message: 'Flags dismissed and report marked clean',
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/logs
 * @access  Private / Admin
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, targetType, action } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (targetType) filter.targetType = targetType.toUpperCase();
        if (action) filter.action = action.toUpperCase();

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate('adminId', 'name email profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            AuditLog.countDocuments(filter)
        ]);

        res.status(200).json({
            logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum) || 1
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
