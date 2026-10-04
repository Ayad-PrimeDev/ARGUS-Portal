// Simple global error handler
const errorHandler = (err, req, res, next) => {
  // If the status code is 200 (default), change it to 500 for server errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  // Return a readable JSON error message
  res.json({
    message: err.message,
    // Only show stack trace in development mode for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
