const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getPublicProfile,
  submitRating
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
// @desc    Get currently logged in user profile and verified reputation stats
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update editable profile fields (name, bio, profileImage, phoneNumber)
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   POST /api/users/rate
// @desc    Submit a trust rating (1-5 stars) for a completed return
// @access  Private
router.post('/rate', protect, submitRating);

// @route   GET /api/users/:id
// @desc    Get public profile and reputation for a user
// @access  Public
router.get('/:id', getPublicProfile);

module.exports = router;
