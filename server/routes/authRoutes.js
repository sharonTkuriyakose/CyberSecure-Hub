const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

/** * Added forgotPassword and resetPassword to the imported controllers
 */
const { 
  register, 
  login, 
  sendOTP, 
  verifyOTP,
  changePassword,
  forgotPassword, // ✅ New
  resetPassword   // ✅ New
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Initialize a new operative account
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Step 1: Verify email/password and signal MFA requirement
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Step 2: Transmit security code via selected method
 * @access  Public
 */
router.post('/send-otp', sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Step 3: Verify code to issue final JWT session
 * @access  Public
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Initiate recovery by sending reset code to system email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Verify recovery code and establish new access key
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Update operative credentials from Settings page
 * @access  Private (Requires valid JWT)
 */
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;