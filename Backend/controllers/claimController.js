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

        // 3. Verify user is not claiming their own item
        if (item.submitterId.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('You cannot submit a claim for an item you reported');
        }

        // 4. Verify item is active and eligible for claims
        if (item.status !== 'ACTIVE') {
            res.status(400);
            throw new Error('This item is no longer available for claims');
        }

        // 5. Create Claim document in MongoDB with initial SUBMITTED timeline event
        const claim = await Claim.create({
            itemId,
            requesterId: req.user._id, // Assign logged-in user ID
            message: message.trim(),
            providedAnswer: (providedAnswer || '').trim(),
            status: 'SUBMITTED',
            timeline: [
                {
                    status: 'SUBMITTED',
                    changedAt: new Date(),
                    changedBy: req.user._id,
                    note: 'Claim submitted with verification details.'
                }
            ]
        });

        // 6. Return the created claim populated with item information
        const populatedClaim = await Claim.findById(claim._id)
            .populate('itemId', 'title description category type location imageUrl status')
            .populate('requesterId', 'name email profileImage')
            .populate('timeline.changedBy', 'name email profileImage role');

        res.status(201).json(populatedClaim);
    } catch (error) {
        next(error); // Pass error to global error handler
    }
};

// @desc    Get all claims related to items created by the logged-in user (incoming claims)
// @route   GET /api/claims
// @access  Private (Requires authentication)
const getClaims = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'admin';
        let queryFilter = {};

        if (!isAdmin) {
            // Find all items submitted by the logged-in user
            const userItems = await Item.find({ submitterId: req.user._id }).select('_id');
            const itemIds = userItems.map((item) => item._id);
            queryFilter = { itemId: { $in: itemIds } };
        }

        // Find all claims made on those items
        const claims = await Claim.find(queryFilter)
            .populate('requesterId', 'name email profileImage')
            .populate('itemId', 'title description category type location imageUrl status submitterId')
            .populate('timeline.changedBy', 'name email profileImage role')
            .sort({ createdAt: -1 });

        res.status(200).json(claims);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single claim by its ID with full timeline history
// @route   GET /api/claims/:id
// @access  Private (Requester, Item Submitter, or Admin)
const getClaimById = async (req, res, next) => {
    try {
        const claim = await Claim.findById(req.params.id)
            .populate('requesterId', 'name email profileImage')
            .populate('itemId', 'title description category type location imageUrl status submitterId')
            .populate('timeline.changedBy', 'name email profileImage role');

        if (!claim) {
            res.status(404);
            throw new Error('Claim not found');
        }

        const isRequester = claim.requesterId?._id?.toString() === req.user._id.toString();
        const isItemSubmitter = claim.itemId?.submitterId?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'admin';

        if (!isRequester && !isItemSubmitter && !isAdmin) {
            res.status(403);
            throw new Error('Forbidden: You are not authorized to view this claim');
        }

        res.status(200).json(claim);
    } catch (error) {
        next(error);
    }
};

// @desc    Update claim status workflow (UNDER_REVIEW, APPROVED, REJECTED, RETURNED)
// @route   PUT /api/claims/:id
// @access  Private (Item submitter or Admin only)
const updateClaimStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;
        const targetStatus = status ? status.toUpperCase() : null;

        // 1. Validate status input
        const allowedStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED'];
        if (!targetStatus || !allowedStatuses.includes(targetStatus)) {
            res.status(400);
            throw new Error('Please provide a valid status: UNDER_REVIEW, APPROVED, REJECTED, or RETURNED');
        }

        // 2. Find the claim
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            res.status(404);
            throw new Error('Claim not found');
        }

        // 3. Find associated item and verify review authority
        const item = await Item.findById(claim.itemId);
        if (!item) {
            res.status(404);
            throw new Error('Associated item not found');
        }

        const isItemOwner = item.submitterId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'admin';

        if (!isItemOwner && !isAdmin) {
            res.status(403);
            throw new Error('Forbidden: Only the item reporter or an administrator can update claim status');
        }

        // 4. Validate workflow transitions
        // Normalize legacy PENDING to SUBMITTED
        const currentNormalized = (claim.status === 'PENDING') ? 'SUBMITTED' : claim.status;

        if (currentNormalized === targetStatus) {
            res.status(400);
            throw new Error(`Claim is already in "${targetStatus}" status`);
        }

        if (currentNormalized === 'REJECTED') {
            res.status(400);
            throw new Error('Rejected claims cannot progress to Approved or Returned without a new claim process');
        }

        if (currentNormalized === 'RETURNED') {
            res.status(400);
            throw new Error('This claim has already recorded item return and is completed');
        }

        if (targetStatus === 'RETURNED' && currentNormalized !== 'APPROVED') {
            res.status(400);
            throw new Error('An item can only be marked as RETURNED after the claim has been APPROVED and handover completed');
        }

        if (targetStatus === 'UNDER_REVIEW' && currentNormalized !== 'SUBMITTED') {
            res.status(400);
            throw new Error('Only newly submitted claims can transition to UNDER_REVIEW');
        }

        // 5. Update claim status & store rejection reason if applicable
        claim.status = targetStatus;
        if (targetStatus === 'REJECTED') {
            claim.rejectionReason = note?.trim() || 'Claim declined by reviewer';
        }

        // 6. Handle side effects for APPROVED and RETURNED
        if (targetStatus === 'APPROVED') {
            item.status = 'CLAIMED';
            await item.save();

            // Auto-reject any other active claims for the same item
            const otherClaims = await Claim.find({
                itemId: item._id,
                _id: { $ne: claim._id },
                status: { $in: ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'] }
            });

            for (const other of otherClaims) {
                other.status = 'REJECTED';
                other.rejectionReason = 'Item claimed and approved for another verified claimant.';
                other.timeline.push({
                    status: 'REJECTED',
                    changedAt: new Date(),
                    changedBy: req.user._id,
                    note: 'Item claimed and approved for another verified claimant.'
                });
                await other.save();
            }
        }

        // 7. Append status change to timeline history
        const defaultNotes = {
            UNDER_REVIEW: 'Reviewer is examining verification details and security answer.',
            APPROVED: 'Ownership verified. Claim approved; item is awaiting physical handover.',
            REJECTED: note?.trim() || 'Claim declined by reviewer.',
            RETURNED: note?.trim() || 'Physical handover verified and completed. Item successfully recovered.'
        };

        const eventNote = note?.trim() || defaultNotes[targetStatus] || `Status updated to ${targetStatus}.`;

        claim.timeline.push({
            status: targetStatus,
            changedAt: new Date(),
            changedBy: req.user._id,
            note: eventNote
        });

        await claim.save();

        // 8. Return populated claim
        const updatedClaim = await Claim.findById(claim._id)
            .populate('requesterId', 'name email profileImage')
            .populate('itemId', 'title description category type location imageUrl status submitterId')
            .populate('timeline.changedBy', 'name email profileImage role');

        res.status(200).json(updatedClaim);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all claims submitted by the logged-in user
// @route   GET /api/claims/my
// @access  Private (Requires authentication)
const getMyClaims = async (req, res, next) => {
    try {
        const claims = await Claim.find({ requesterId: req.user._id })
            .populate('itemId', 'title description category type location imageUrl status submitterId')
            .populate('timeline.changedBy', 'name email profileImage role')
            .sort({ createdAt: -1 });

        res.status(200).json(claims);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createClaim,
    getClaims,
    getClaimById,
    getMyClaims,
    updateClaimStatus
};
