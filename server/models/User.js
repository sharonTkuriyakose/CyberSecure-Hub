const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // Fields for the standard Login MFA flow
  otp: { 
    type: String 
  },
  otpExpire: { 
    type: Date 
  },
  // ✅ NEW: Fields for the Forgot Password flow
  resetPasswordOTP: { 
    type: String 
  },
  resetPasswordExpires: { 
    type: Date 
  }
}, { timestamps: true });

/**
 * Password Hashing Middleware
 * Automatically hashes the password before saving to MongoDB.
 */
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Password Verification Method
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);