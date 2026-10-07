// Middleware to handle 404 (Not Found) for unknown routes
const notFound = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Forward error to the centralized error handler
};

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    // If the status code is still 200 OK, default to 500 (Internal Server Error)
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose invalid ObjectId (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Handle Mongoose duplicate key error (e.g. duplicate email registration)
    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate value entered, record already exists';
    }

    // Handle Mongoose schema validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }

    res.status(statusCode).json({
        message,
        // Avoid exposing internal call stack traces in production for security
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = {
    notFound,
    errorHandler
};
