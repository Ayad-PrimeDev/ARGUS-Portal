const express = require('express');
const router = express.Router();
const {
    createClaim,
    getClaims,
    getClaimById,
    getMyClaims,
    updateClaimStatus
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const { createClaimValidation } = require('../middleware/validateMiddleware');

// Define route to view all claims on items created by logged-in user (incoming claims)
// GET /api/claims
// Protected route - requires authentication
router.get('/', protect, getClaims);

// Define route to view all claims submitted by the logged-in user
// GET /api/claims/my
// Protected route - requires authentication
router.get('/my', protect, getMyClaims);

// Define route to view a specific claim with full timeline history
// GET /api/claims/:id
// Protected route - requires authentication
router.get('/:id', protect, getClaimById);

// Define route to submit a claim for an item
// POST /api/claims
// Protected route - requires authentication
router.post('/', protect, createClaimValidation, createClaim);

// Define route to update claim workflow status (UNDER_REVIEW, APPROVED, REJECTED, RETURNED)
// PUT /api/claims/:id
// Protected route - item submitter or admin only
router.put('/:id', protect, updateClaimStatus);

module.exports = router;
