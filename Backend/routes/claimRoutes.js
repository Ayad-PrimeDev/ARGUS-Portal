const express = require('express');
const router = express.Router();
const { createClaim, getClaims } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

// Define route to view all claims on items created by logged-in user
// GET /api/claims
// Protected route - requires authentication
router.get('/', protect, getClaims);

// Define route to submit a claim for an item
// POST /api/claims
// Protected route - requires authentication
router.post('/', protect, createClaim);

module.exports = router;
