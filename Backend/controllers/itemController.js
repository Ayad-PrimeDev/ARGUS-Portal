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

module.exports = {
    createItem
};
