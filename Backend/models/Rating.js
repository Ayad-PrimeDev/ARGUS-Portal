const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: [true, 'Please provide the item ID']
        },
        raterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide the rater ID']
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide the recipient ID']
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a star rating from 1 to 5'],
            min: [1, 'Rating must be at least 1 star'],
            max: [5, 'Rating cannot exceed 5 stars']
        },
        review: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Review cannot exceed 500 characters']
        }
    },
    {
        timestamps: true
    }
);

// Compound index to guarantee that a user cannot rate the same completed return multiple times
ratingSchema.index({ itemId: 1, raterId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
