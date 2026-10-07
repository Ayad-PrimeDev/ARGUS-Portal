const mongoose = require('mongoose');

// Define the Item Schema for Lost and Found posts
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
            enum: ['LOST', 'FOUND'] // Restricts type strictly to LOST or FOUND
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
            default: '' // Optional URL for uploaded item picture
        },
        contactInformation: {
            type: String,
            required: [true, 'Please provide contact information']
        },
        secretQuestion: {
            type: String,
            default: '' // Optional security question to verify ownership
        },
        secretAnswer: {
            type: String,
            default: '' // Optional security answer to verify ownership
        },
        submitterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model who submitted the item
            required: [true, 'Please specify the submitter']
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'CLAIMED', 'CLOSED'], // Allowed status values
            default: 'ACTIVE'
        }
    },
    {
        // Automatically manages 'createdAt' and 'updatedAt' fields
        timestamps: true
    }
);

// Export the Item model based on the schema
module.exports = mongoose.model('Item', itemSchema);
