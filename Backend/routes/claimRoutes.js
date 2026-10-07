const express = require('express');
const router = express.Router();
const { createClaim, getClaims, updateClaimStatus } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const { createClaimValidation } = require('../middleware/validateMiddleware');

// Define route to view all claims on items created by logged-in user
// GET /api/claims
// Protected route - requires authentication
router.get('/', protect, getClaims);

// Define route to submit a claim for an item
// POST /api/claims
// Protected route - requires authentication
router.post('/', protect, createClaimValidation, createClaim);

// Define route to approve or reject a claim
// PUT /api/claims/:id
// Protected route - only item owner can approve or reject
router.put('/:id', protect, updateClaimStatus);

module.exports = router;
