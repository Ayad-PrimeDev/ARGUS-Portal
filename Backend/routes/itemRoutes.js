const express = require('express');
const router = express.Router();
const { createItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

// Define route to create an item
// POST /api/items
// Protected route - requires user to be logged in
router.post('/', protect, createItem);

module.exports = router;
