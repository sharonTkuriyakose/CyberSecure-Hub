const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true }, // This will store the AES string
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);