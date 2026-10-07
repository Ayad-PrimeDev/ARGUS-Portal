const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet()); // Sets various HTTP security headers

// Body Parsing and Cookie Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cors()); // Enable CORS
app.use(cookieParser()); // Parse cookies

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'ARGUS Backend is running' });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Item Routes
app.use('/api/items', itemRoutes);

// Claim Routes
app.use('/api/claims', claimRoutes);

// 404 handler for undefined routes
app.use(notFound);

// Centralized error handling middleware (must be registered after all routes)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
