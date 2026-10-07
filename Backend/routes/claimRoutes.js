const express = require('express');
const router = express.Router();
const { createClaim } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

// Define route to submit a claim for an item
// POST /api/claims
// Protected route - requires authentication
router.post('/', protect, createClaim);

module.exports = router;
