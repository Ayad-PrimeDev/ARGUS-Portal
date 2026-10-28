const Item = require('../models/Item');
const Claim = require('../models/Claim');

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

// Helper function to safely escape regex special characters
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get all active items with optional advanced filters & sorting
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
    try {
        // 1. Base filter: only return ACTIVE items
        const filter = { status: 'ACTIVE' };

        // 2. Optional filter by type (LOST or FOUND)
        if (req.query.type && ['LOST', 'FOUND'].includes(req.query.type.toUpperCase())) {
            filter.type = req.query.type.toUpperCase();
        }

        // 3. Optional filter by category (ignoring empty or 'ALL'/'All')
        if (req.query.category && req.query.category.trim() && req.query.category.toUpperCase() !== 'ALL') {
            filter.category = req.query.category.trim();
        }

        // 4. Keyword search across item title or description (case-insensitive partial match)
        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        // 5. Location filter (case-insensitive partial match)
        if (req.query.location && req.query.location.trim() && req.query.location.toUpperCase() !== 'ALL') {
            const locationRegex = new RegExp(escapeRegex(req.query.location.trim()), 'i');
            filter.location = locationRegex;
        }

        // 6. Date range filter (inclusive of boundary dates)
        const startParam = req.query.startDate || req.query.from;
        const endParam = req.query.endDate || req.query.to;
        const dateFilter = {};

        if (startParam) {
            const startDate = new Date(startParam);
            if (!isNaN(startDate.getTime())) {
                startDate.setHours(0, 0, 0, 0);
                dateFilter.$gte = startDate;
            }
        }

        if (endParam) {
            const endDate = new Date(endParam);
            if (!isNaN(endDate.getTime())) {
                endDate.setHours(23, 59, 59, 999);
                dateFilter.$lte = endDate;
            }
        }

        if (Object.keys(dateFilter).length > 0) {
            filter.date = dateFilter;
        }

        // 7. Sorting options (newest, oldest, name_asc, name_desc)
        let sortOption = { date: -1, createdAt: -1 };
        let useCollation = false;
        const sortParam = req.query.sort;

        if (sortParam === 'oldest') {
            sortOption = { date: 1, createdAt: 1 };
        } else if (sortParam === 'name_asc') {
            sortOption = { title: 1 };
            useCollation = true;
        } else if (sortParam === 'name_desc') {
            sortOption = { title: -1 };
            useCollation = true;
        } else {
            // Default newest first
            sortOption = { date: -1, createdAt: -1 };
        }

        // 8. Query database, populate submitter info, exclude secret verification answer
        let query = Item.find(filter)
            .populate('submitterId', 'name email profileImage')
            .select('-secretAnswer');

        if (useCollation) {
            query = query.collation({ locale: 'en', strength: 2 });
        }

        const items = await query.sort(sortOption);

        // 9. Return items array
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
        const { title, description, category, location, date, imageUrl, contactInformation, status } = req.body;

        // 4. Update fields if provided
        if (title !== undefined) item.title = title;
        if (description !== undefined) item.description = description;
        if (category !== undefined) item.category = category;
        if (location !== undefined) item.location = location;
        if (date !== undefined) item.date = date;
        if (imageUrl !== undefined) item.imageUrl = imageUrl;
        if (contactInformation !== undefined) item.contactInformation = contactInformation;
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

        // 3. Delete all claims linked to this item to avoid orphaned records
        await Claim.deleteMany({ itemId: item._id });

        // 4. Remove the item from database
        await item.deleteOne();

        // 5. Return success status message
        res.status(200).json({ message: 'Item deleted successfully', id: req.params.id });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('submitterId', 'name email profileImage')
            .select('-secretAnswer'); // Protect secret answer from public view

        // 1. Check if item exists
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        // 2. Return item
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all items submitted by the logged-in user
// @route   GET /api/items/my
// @access  Private (Requires authentication)
const getMyItems = async (req, res, next) => {
    try {
        const items = await Item.find({ submitterId: req.user._id })
            .select('-secretAnswer')
            .sort({ createdAt: -1 });

        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createItem,
    getItems,
    getItemById,
    getMyItems,
    updateItem,
    deleteItem
};


