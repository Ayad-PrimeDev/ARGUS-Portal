const mongoose = require('mongoose');

// Schema for tracking immutable administrative and security audit events
const auditLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true,
            enum: [
                'USER_SUSPEND',
                'USER_SUSPENDED',
                'USER_REACTIVATE',
                'USER_REACTIVATED',
                'ROLE_CHANGE',
                'USER_ROLE_CHANGED',
                'ITEM_STATUS_CHANGE',
                'ITEM_STATUS_CHANGED',
                'ITEM_MODERATED',
                'ITEM_HIDDEN',
                'ITEM_UNHIDDEN',
                'ITEM_DELETED',
                'CLAIM_DECISION',
                'CLAIM_STATUS_UPDATED',
                'CLAIM_DISPUTE_RESOLVED',
                'FLAG_DISMISSED',
                'MODERATION_FLAGS_DISMISSED',
                'SYSTEM_SETTINGS_UPDATED'
            ]
        },
        targetType: {
            type: String,
            required: true,
            enum: ['USER', 'ITEM', 'CLAIM', 'SYSTEM']
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        },
        details: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            default: ''
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false } // Audit logs are immutable records
    }
);

// Index for efficient chronological audit queries and target filtering
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ adminId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
