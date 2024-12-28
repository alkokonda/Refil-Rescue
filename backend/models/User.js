const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash if the password is new/modified
    this.password = await bcrypt.hash(this.password, 10); // Hash the password
    next();
});


module.exports = mongoose.model('User', UserSchema);
