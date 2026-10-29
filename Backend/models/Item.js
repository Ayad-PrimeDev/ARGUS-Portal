const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide an item title'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Please provide a description']
        },
        category: {
            type: String,
            required: [true, 'Please provide a category']
        },
        type: {
            type: String,
            required: [true, 'Please specify the item type (LOST or FOUND)'],
            enum: ['LOST', 'FOUND']
        },
        location: {
            type: String,
            required: [true, 'Please provide the location where item was lost or found']
        },
        date: {
            type: Date,
            required: [true, 'Please provide the date when item was lost or found']
        },
        imageUrl: {
            type: String,
            default: ''
        },
        contactInformation: {
            type: String,
            required: [true, 'Please provide contact information']
        },
        secretQuestion: {
            type: String,
            default: ''
        },
        secretAnswer: {
            type: String,
            default: ''
        },
        submitterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please specify the submitter']
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'CLAIMED', 'CLOSED'],
            default: 'ACTIVE'
        },
        isFlagged: {
            type: Boolean,
            default: false
        },
        flags: [
            {
                reportedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                reason: {
                    type: String,
                    required: true
                },
                details: {
                    type: String,
                    default: ''
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        moderationStatus: {
            type: String,
            enum: ['CLEAN', 'FLAGGED', 'RESOLVED', 'REMOVED'],
            default: 'CLEAN'
        },
        moderationReason: {
            type: String,
            default: ''
        },
        isHidden: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Item', itemSchema);
