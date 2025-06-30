const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();
// const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, trim: true },
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

// UserSchema.pre()

UserSchema.methods.comparePassword = async function(enteredPassword) {
    return enteredPassword === this.password.trim();
}

module.exports = mongoose.model('User', UserSchema);