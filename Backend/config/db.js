const mongoose = require('mongoose');
const dns = require('node:dns');

const connectDB = async () => {
  try {
    // Use Google Public DNS to prevent DNS SRV lookup timeouts when connecting
    // to cloud-hosted databases (e.g., MongoDB Atlas) on restricted networks
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
