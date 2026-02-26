const mongoose = require('mongoose');

/**
 * SECURE FILE VAULT SCHEMA (SUPABASE VERSION)
 * Stores metadata for assets held in Supabase Private Storage.
 * The actual file is protected by Row-Level Security (RLS) policies.
 */
const FileSchema = new mongoose.Schema({
  // Reference to the authenticated user owning the asset
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  // Original name of the asset for UI display (e.g., Sharon-CV.pdf)
  fileName: { 
    type: String, 
    required: true 
  },
  
  /**
   * ✅ STORAGE PATH (REPLACES public_id & fileUrl)
   * Stores the unique path within the Supabase bucket (e.g., "user_id/17123456_file.pdf").
   * This path is used to generate temporary Signed URLs for viewing.
   */
  storagePath: { 
    type: String, 
    required: true 
  },
  
  // Stores mimetype (e.g., 'application/pdf') to handle frontend rendering
  fileType: { 
    type: String 
  },
  
  // Storage size in bytes for vault statistics
  fileSize: { 
    type: Number 
  }
}, { 
  /**
   * ✅ AUTO-TIMESTAMPS
   * Automatically creates 'createdAt' and 'updatedAt' fields.
   */
  timestamps: true 
});

module.exports = mongoose.model('File', FileSchema);