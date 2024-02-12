const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    adminStatus: {
        type: Boolean,
        default: false,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    updateDate: Date,
    deletionDate: Date,
});

// User Model
const User = mongoose.model('UsersZholaman', userSchema);

module.exports = User;
