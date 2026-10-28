const mongoose = require('mongoose');

// Schema for tracking individual status transition history events
const claimHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            required: true,
            enum: ['SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED']
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: {
            type: String,
            default: ''
        }
    },
    { _id: true }
);

// Define the Claim Schema for item ownership requests
const claimSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item', // Reference to the Item being claimed
            required: [true, 'Please provide the item ID']
        },
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User requesting the claim
            required: [true, 'Please provide the requester ID']
        },
        message: {
            type: String,
            required: [true, 'Please provide a message explaining your claim']
        },
        providedAnswer: {
            type: String,
            default: '' // Answer to the item's secret question for verification
        },
        status: {
            type: String,
            enum: ['SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED'],
            default: 'SUBMITTED'
        },
        rejectionReason: {
            type: String,
            default: ''
        },
        timeline: [claimHistorySchema]
    },
    {
        // Automatically manages 'createdAt' and 'updatedAt' timestamps
        timestamps: true
    }
);

// Export the Claim model based on the schema
module.exports = mongoose.model('Claim', claimSchema);
