const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, getMyItems, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { createItemValidation } = require('../middleware/validateMiddleware');

// Define route to view all active items (with optional filters ?type=...&category=...)
// GET /api/items
// Public route
router.get('/', getItems);

// Define route to view all items reported by the logged-in user
// GET /api/items/my
// Protected route - requires authentication
router.get('/my', protect, getMyItems);

// Define route to view a single item by ID
// GET /api/items/:id
// Public route
router.get('/:id', getItemById);

// Define route to create an item
// POST /api/items
// Protected route - requires user to be logged in
router.post('/', protect, createItemValidation, createItem);

// Define route to update an item
// PUT /api/items/:id
// Protected route - only the submitter can update their own item
router.put('/:id', protect, updateItem);

// Define route to delete an item
// DELETE /api/items/:id
// Protected route - only the submitter can delete their own item
router.delete('/:id', protect, deleteItem);

module.exports = router;
