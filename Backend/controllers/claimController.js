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

// @desc    Get all claims related to items created by the logged-in user
// @route   GET /api/claims
// @access  Private (Requires authentication)
const getClaims = async (req, res, next) => {
    try {
        // 1. Find all items submitted by the logged-in user
        const userItems = await Item.find({ submitterId: req.user._id }).select('_id');
        const itemIds = userItems.map((item) => item._id);

        // 2. Find all claims made on those items
        const claims = await Claim.find({ itemId: { $in: itemIds } })
            .populate('requesterId', 'name email profileImage')
            .populate('itemId', 'title description category type location imageUrl status')
            .sort({ createdAt: -1 });

        // 3. Return the claims array
        res.status(200).json(claims);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve or reject a claim
// @route   PUT /api/claims/:id
// @access  Private (Item submitter only)
const updateClaimStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        // 1. Validate status input
        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            res.status(400);
            throw new Error('Please provide a valid status: APPROVED or REJECTED');
        }

        // 2. Find the claim
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            res.status(404);
            throw new Error('Claim not found');
        }

        // 3. Find the associated item and verify ownership
        const item = await Item.findById(claim.itemId);
        if (!item || item.submitterId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Forbidden: Only the item owner can approve or reject claims');
        }

        // 4. Update the claim status
        claim.status = status;
        const updatedClaim = await claim.save();

        // 5. Return updated claim
        res.status(200).json(updatedClaim);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createClaim,
    getClaims,
    updateClaimStatus
};
