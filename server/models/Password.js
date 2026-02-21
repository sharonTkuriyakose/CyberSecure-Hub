const mongoose = require('mongoose');

const PasswordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  title: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }, // AES-256 storage
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('password', PasswordSchema);