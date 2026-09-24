const mongoose = require('mongoose');
const dns = require('node:dns');

const connectDB = async () => {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    // Connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
