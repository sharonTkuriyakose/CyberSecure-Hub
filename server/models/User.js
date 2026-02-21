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
  // Fields for the Two-Step Verification flow
  otp: { 
    type: String 
  },
  otpExpire: { 
    type: Date 
  }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

/**
 * Password Hashing Middleware
 * Fixes the "next is not a function" error by removing the next callback.
 * Async middleware in Mongoose proceeds automatically upon completion.
 */
UserSchema.pre('save', async function() {
  // 1. Only hash the password if it's being modified or created
  if (!this.isModified('password')) return;

  // 2. Generate a secure salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // No next() call is required for async pre-save hooks
});

/**
 * Password Verification Method
 * Compares plain text login password with the hashed password in the DB.
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);