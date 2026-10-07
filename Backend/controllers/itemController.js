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

module.exports = {
    createItem,
    getItems
};

