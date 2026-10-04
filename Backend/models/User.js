const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true // Ensures no duplicate emails in the database
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    profileImage: {
        type: String,
        required: false // Optional field for the user's avatar/profile picture
    }
}, {
    // Automatically manages 'createdAt' and 'updatedAt' fields
    timestamps: true 
});

// Export the User model based on the schema
module.exports = mongoose.model('User', userSchema);
