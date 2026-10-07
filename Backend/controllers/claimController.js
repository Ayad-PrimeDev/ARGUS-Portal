const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Create a new claim request for an item
// @route   POST /api/claims
// @access  Private (Requires authentication)
const createClaim = async (req, res, next) => {
    try {
        const { itemId, message, providedAnswer } = req.body;

        // 1. Validate required fields
        if (!itemId || !message) {
            res.status(400);
            throw new Error('Please provide itemId and a message explaining your claim');
        }

        // 2. Verify that the item exists
        const item = await Item.findById(itemId);
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        // 3. Create Claim document in MongoDB
        const claim = await Claim.create({
            itemId,
            requesterId: req.user._id, // Assign logged-in user ID
            message,
            providedAnswer: providedAnswer || '',
            status: 'PENDING'          // Default status
        });

        // 4. Return the created claim
        res.status(201).json(claim);
    } catch (error) {
        next(error); // Pass error to global error handler
    }
};

module.exports = {
    createClaim
};
