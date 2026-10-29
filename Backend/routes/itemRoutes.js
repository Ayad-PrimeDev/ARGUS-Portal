const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, getMyItems, updateItem, deleteItem, flagItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { createItemValidation } = require('../middleware/validateMiddleware');

router.get('/', getItems);
router.get('/my', protect, getMyItems);
router.get('/:id', getItemById);
router.post('/:id/flag', protect, flagItem);
router.post('/', protect, createItemValidation, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
