const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Added for protected routes

/** * Added sendOTP and changePassword to the imported controllers
 */
const { 
  register, 
  login, 
  sendOTP, 
  verifyOTP,
  changePassword 
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Initialize a new operative account
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Step 1: Verify email/password only. 
 * Does not send OTP yet; returns mfaRequired signal.
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Step 2: Triggered from the "Select Method" page.
 * Sends code via 'email' or 'phone' based on user choice.
 * @access  Public
 */
router.post('/send-otp', sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Step 3: Final verification of the 6-digit code to unlock dashboard.
 * @access  Public
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/change-password
 * @desc    Update operative credentials from Settings page
 * @access  Private (Requires JWT token)
 */
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;