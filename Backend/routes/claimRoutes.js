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

router.get('/', protect, getClaims);
router.get('/my', protect, getMyClaims);
router.get('/:id', protect, getClaimById);
router.post('/', protect, createClaimValidation, createClaim);
router.put('/:id', protect, updateClaimStatus);

module.exports = router;
