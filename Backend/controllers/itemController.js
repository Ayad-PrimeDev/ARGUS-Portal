const Item = require('../models/Item');

// @desc    Create a new lost or found item
// @route   POST /api/items
// @access  Private (Requires authentication)
const createItem = async (req, res, next) => {
    try {
        // 1. Receive data from request body
        const {
            title,
            description,
            category,
            type,
            location,
            date,
            imageUrl,
            contactInformation,
            secretQuestion,
            secretAnswer
        } = req.body;

        // 2. Validate required fields
        if (!title || !description || !category || !type || !location || !date || !contactInformation) {
            res.status(400);
            throw new Error('Please fill in all required fields: title, description, category, type, location, date, and contactInformation');
        }

        // 3. Create Item document in MongoDB
        const item = await Item.create({
            title,
            description,
            category,
            type,
            location,
            date,
            imageUrl: imageUrl || '',
            contactInformation,
            secretQuestion: secretQuestion || '',
            secretAnswer: secretAnswer || '',
            submitterId: req.user._id, // Automatically assign logged-in user ID
            status: 'ACTIVE'           // Default status
        });

        // 4. Return the created item
        res.status(201).json(item);
    } catch (error) {
        next(error); // Pass error to global error handler
    }
};

// @desc    Get all active items with optional filters
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
    try {
        // 1. Base filter: only return ACTIVE items
        const filter = { status: 'ACTIVE' };

        // 2. Optional filter by type (LOST or FOUND)
        if (req.query.type) {
            filter.type = req.query.type;
        }

        // 3. Optional filter by category
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // 4. Query database, populate submitter info, sort newest first
        const items = await Item.find(filter)
            .populate('submitterId', 'name email profileImage')
            .sort({ createdAt: -1 });

        // 5. Return items array
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private (Submitter only)
const updateItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);

        // 1. Check if item exists
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        // 2. Check if logged-in user is the owner of the item
        if (item.submitterId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Forbidden: You can only update your own items');
        }

        // 3. Extract allowed update fields
        const { title, description, category, location, imageUrl, status } = req.body;

        // 4. Update fields if provided
        if (title !== undefined) item.title = title;
        if (description !== undefined) item.description = description;
        if (category !== undefined) item.category = category;
        if (location !== undefined) item.location = location;
        if (imageUrl !== undefined) item.imageUrl = imageUrl;
        if (status !== undefined) item.status = status;

        // 5. Save the updated item
        const updatedItem = await item.save();

        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private (Submitter only)
const deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);

        // 1. Check if item exists
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        // 2. Check if logged-in user is the owner of the item
        if (item.submitterId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Forbidden: You can only delete your own items');
        }

        // 3. Remove the item from database
        await item.deleteOne();

        // 4. Return success status message
        res.status(200).json({ message: 'Item deleted successfully', id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createItem,
    getItems,
    updateItem,
    deleteItem
};

