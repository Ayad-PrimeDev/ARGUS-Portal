const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { escapeRegex } = require('../utils/helpers');

// @desc    Create a new lost or found item
// @route   POST /api/items
// @access  Private (Requires authentication)
const createItem = async (req, res, next) => {
    try {
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

        if (!title || !description || !category || !type || !location || !date || !contactInformation) {
            res.status(400);
            throw new Error('Please fill in all required fields: title, description, category, type, location, date, and contactInformation');
        }

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
            submitterId: req.user._id,
            status: 'ACTIVE'
        });

        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active items with optional advanced filters & sorting
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
    try {
        const filter = { status: 'ACTIVE', isHidden: { $ne: true } };

        if (req.query.type && ['LOST', 'FOUND'].includes(req.query.type.toUpperCase())) {
            filter.type = req.query.type.toUpperCase();
        }

        if (req.query.category && req.query.category.trim() && req.query.category.toUpperCase() !== 'ALL') {
            filter.category = req.query.category.trim();
        }

        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        if (req.query.location && req.query.location.trim() && req.query.location.toUpperCase() !== 'ALL') {
            const locationRegex = new RegExp(escapeRegex(req.query.location.trim()), 'i');
            filter.location = locationRegex;
        }

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
            sortOption = { date: -1, createdAt: -1 };
        }

        let query = Item.find(filter)
            .populate('submitterId', 'name email profileImage')
            .select('-secretAnswer');

        if (useCollation) {
            query = query.collation({ locale: 'en', strength: 2 });
        }

        const items = await query.sort(sortOption);

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

        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        if (item.submitterId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Forbidden: You can only update your own items');
        }

        const { title, description, category, location, date, imageUrl, contactInformation, status } = req.body;

        if (title !== undefined) item.title = title;
        if (description !== undefined) item.description = description;
        if (category !== undefined) item.category = category;
        if (location !== undefined) item.location = location;
        if (date !== undefined) item.date = date;
        if (imageUrl !== undefined) item.imageUrl = imageUrl;
        if (contactInformation !== undefined) item.contactInformation = contactInformation;
        if (status !== undefined) item.status = status;

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

        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        if (item.submitterId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Forbidden: You can only delete your own items');
        }

        // Delete all claims linked to this item to avoid orphaned records
        await Claim.deleteMany({ itemId: item._id });

        await item.deleteOne();

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

        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

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

// @desc    Report / flag an item for moderator review
// @route   POST /api/items/:id/flag
// @access  Private (Authenticated)
const flagItem = async (req, res, next) => {
    try {
        const { reason, details } = req.body;

        if (!reason || !reason.trim()) {
            res.status(400);
            throw new Error('Please provide a reason for flagging this report');
        }

        const item = await Item.findById(req.params.id);
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        // Check if user already flagged this item recently
        const alreadyFlagged = item.flags && item.flags.some(
            (f) => f.reportedBy && f.reportedBy.toString() === req.user._id.toString()
        );

        if (alreadyFlagged) {
            res.status(400);
            throw new Error('You have already submitted a flag report for this item. Our moderation team is reviewing it.');
        }

        item.flags = item.flags || [];
        item.flags.push({
            reportedBy: req.user._id,
            reason: reason.trim(),
            details: details ? details.trim() : '',
            createdAt: new Date()
        });

        item.isFlagged = true;
        if (item.moderationStatus !== 'REMOVED') {
            item.moderationStatus = 'FLAGGED';
        }

        await item.save();

        res.status(200).json({
            message: 'Report submitted for review. Thank you for helping keep the campus community safe.',
            isFlagged: true
        });
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
    deleteItem,
    flagItem
};


