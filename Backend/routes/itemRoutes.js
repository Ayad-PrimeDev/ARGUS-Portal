const express = require('express');
const router = express.Router();
const { createItem, getItems, updateItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

// Define route to view all active items (with optional filters ?type=...&category=...)
// GET /api/items
// Public route
router.get('/', getItems);

// Define route to create an item
// POST /api/items
// Protected route - requires user to be logged in
router.post('/', protect, createItem);

// Define route to update an item
// PUT /api/items/:id
// Protected route - only the submitter can update their own item
router.put('/:id', protect, updateItem);

module.exports = router;
