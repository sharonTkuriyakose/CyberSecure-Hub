const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, // URL from Google Cloud Storage
  fileSize: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', FileSchema);