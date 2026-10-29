const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Rating = require('../models/Rating');

/**
 * Tier Thresholds Definition
 */
const TIERS = [
    { name: 'Bronze',   min: 0,    max: 99 },
    { name: 'Silver',   min: 100,  max: 299 },
    { name: 'Gold',     min: 300,  max: 599 },
    { name: 'Platinum', min: 600,  max: 999 },
    { name: 'Diamond',  min: 1000, max: Infinity }
];

/**
 * Calculate Tier and Progress towards next tier from points
 * @param {number} points
 */
const calculateTierProgress = (points) => {
    let currentTier = TIERS[0];
    let nextTier = null;

    for (let i = 0; i < TIERS.length; i++) {
        if (points >= TIERS[i].min && (TIERS[i].max === Infinity || points <= TIERS[i].max)) {
            currentTier = TIERS[i];
            nextTier = i < TIERS.length - 1 ? TIERS[i + 1] : null;
            break;
        }
    }

    let progressPercent = 100;
    let pointsToNextTier = 0;

    if (nextTier) {
        const tierRange = nextTier.min - currentTier.min;
        const pointsInCurrentTier = points - currentTier.min;
        progressPercent = Math.min(100, Math.max(0, Math.round((pointsInCurrentTier / tierRange) * 100)));
        pointsToNextTier = Math.max(0, nextTier.min - points);
    }

    return {
        tier: currentTier.name,
        nextTier: nextTier ? nextTier.name : null,
        progressPercent,
        pointsToNextTier
    };
};

/**
 * Server-side calculation of verified contribution points and reputation
 * @param {string|ObjectId} userId
 */
const calculateUserReputation = async (userId) => {
    const userItems = await Item.find({ submitterId: userId })
        .select('-secretAnswer')
        .sort({ createdAt: -1 });

    const lostReports = userItems.filter((i) => i.type === 'LOST');
    const foundReports = userItems.filter((i) => i.type === 'FOUND');

    // A found item that has been claimed represents a completed return
    const returnedItems = foundReports.filter((i) => i.status === 'CLAIMED');

    const lostCount = lostReports.length;
    const foundCount = foundReports.length;
    const returnedCount = returnedItems.length;

    // Contribution Scoring:
    // - Submitting a valid lost-item report: +10 pts
    // - Found-item report resulting in successful return: +50 pts
    // - Successfully returning found item to rightful owner: +100 pts
    // (Total 150 pts per completed found item return)
    const points = (lostCount * 10) + (returnedCount * 150);

    const tierData = calculateTierProgress(points);

    const ratings = await Rating.find({ recipientId: userId })
        .populate('raterId', 'name profileImage')
        .populate('itemId', 'title type')
        .sort({ createdAt: -1 });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
        ? Math.round((ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings) * 10) / 10
        : 0;

    return {
        points,
        tier: tierData.tier,
        nextTier: tierData.nextTier,
        progressPercent: tierData.progressPercent,
        pointsToNextTier: tierData.pointsToNextTier,
        itemsReturned: returnedCount,
        lostReportsCount: lostCount,
        foundReportsCount: foundCount,
        totalReportsCount: lostCount + foundCount,
        averageRating,
        totalRatings,
        ratings,
        recentReports: userItems.slice(0, 8)
    };
};

// @desc    Get logged in user profile with reputation metrics
// @route   GET /api/users/profile
// @access  Private (Authenticated)
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const reputationData = await calculateUserReputation(user._id);

        // Find completed returns where the user was the claimant and has not rated the finder yet
        const approvedClaims = await Claim.find({
            requesterId: user._id,
            status: 'APPROVED'
        }).populate('itemId');

        const rateableReturns = [];
        for (const claim of approvedClaims) {
            if (claim.itemId && claim.itemId.status === 'CLAIMED') {
                const existingRating = await Rating.findOne({
                    itemId: claim.itemId._id,
                    raterId: user._id
                });

                if (!existingRating) {
                    const finder = await User.findById(claim.itemId.submitterId).select('name email profileImage');
                    if (finder) {
                        rateableReturns.push({
                            claimId: claim._id,
                            itemId: claim.itemId._id,
                            itemTitle: claim.itemId.title,
                            finder: {
                                _id: finder._id,
                                name: finder.name,
                                profileImage: finder.profileImage
                            }
                        });
                    }
                }
            }
        }

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'USER',
                isSuspended: !!user.isSuspended,
                suspensionReason: user.suspensionReason || '',
                profileImage: user.profileImage || '',
                bio: user.bio || '',
                phoneNumber: user.phoneNumber || '',
                createdAt: user.createdAt
            },
            reputation: {
                points: reputationData.points,
                tier: reputationData.tier,
                nextTier: reputationData.nextTier,
                progressPercent: reputationData.progressPercent,
                pointsToNextTier: reputationData.pointsToNextTier,
                itemsReturned: reputationData.itemsReturned,
                lostReportsCount: reputationData.lostReportsCount,
                foundReportsCount: reputationData.foundReportsCount,
                totalReportsCount: reputationData.totalReportsCount,
                averageRating: reputationData.averageRating,
                totalRatings: reputationData.totalRatings,
                ratings: reputationData.ratings
            },
            recentReports: reputationData.recentReports,
            rateableReturns
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update editable profile fields
// @route   PUT /api/users/profile
// @access  Private (Authenticated)
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const { name, bio, profileImage, phoneNumber } = req.body;

        if (name !== undefined) {
            if (!name.trim()) {
                res.status(400);
                throw new Error('Name cannot be empty');
            }
            user.name = name.trim();
        }

        if (bio !== undefined) {
            user.bio = bio.trim().slice(0, 300);
        }

        if (profileImage !== undefined) {
            user.profileImage = profileImage.trim();
        }

        if (phoneNumber !== undefined) {
            user.phoneNumber = phoneNumber.trim();
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage,
            bio: updatedUser.bio,
            phoneNumber: updatedUser.phoneNumber,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public profile of another user
// @route   GET /api/users/:id
// @access  Public
const getPublicProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('name profileImage bio createdAt');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const reputationData = await calculateUserReputation(user._id);

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                profileImage: user.profileImage || '',
                bio: user.bio || '',
                createdAt: user.createdAt
            },
            reputation: {
                points: reputationData.points,
                tier: reputationData.tier,
                nextTier: reputationData.nextTier,
                progressPercent: reputationData.progressPercent,
                pointsToNextTier: reputationData.pointsToNextTier,
                itemsReturned: reputationData.itemsReturned,
                totalReportsCount: reputationData.totalReportsCount,
                averageRating: reputationData.averageRating,
                totalRatings: reputationData.totalRatings,
                ratings: reputationData.ratings
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit a trust rating for a completed return
// @route   POST /api/users/rate
// @access  Private (Authenticated)
const submitRating = async (req, res, next) => {
    try {
        const { itemId, rating, review } = req.body;

        if (!itemId || !rating) {
            res.status(400);
            throw new Error('Please provide itemId and a rating score (1-5)');
        }

        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            res.status(400);
            throw new Error('Rating must be a valid number between 1 and 5');
        }

        const item = await Item.findById(itemId);
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        if (item.status !== 'CLAIMED') {
            res.status(400);
            throw new Error('Ratings can only be submitted after an item has been successfully claimed/returned');
        }

        // Determine recipient:
        // If logged-in user is the claimant with an approved claim, recipient is the item submitter (finder)
        // If logged-in user is the item submitter, recipient is the approved claimant
        let recipientId;
        const approvedClaim = await Claim.findOne({ itemId: item._id, status: 'APPROVED' });

        if (!approvedClaim) {
            res.status(400);
            throw new Error('No verified return claim exists for this item');
        }

        const isSubmitter = item.submitterId.toString() === req.user._id.toString();
        const isClaimant = approvedClaim.requesterId.toString() === req.user._id.toString();

        if (!isSubmitter && !isClaimant) {
            res.status(403);
            throw new Error('Forbidden: Only the finder and verified owner of this item can submit a rating');
        }

        if (isSubmitter) {
            recipientId = approvedClaim.requesterId;
        } else {
            recipientId = item.submitterId;
        }

        if (recipientId.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Users cannot rate themselves');
        }

        const existingRating = await Rating.findOne({
            itemId: item._id,
            raterId: req.user._id
        });

        if (existingRating) {
            res.status(400);
            throw new Error('You have already submitted a rating for this completed return');
        }

        const newRating = await Rating.create({
            itemId: item._id,
            raterId: req.user._id,
            recipientId,
            rating: Math.round(numericRating),
            review: review ? review.trim().slice(0, 500) : ''
        });

        res.status(201).json(newRating);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getPublicProfile,
    submitRating,
    calculateUserReputation
};
