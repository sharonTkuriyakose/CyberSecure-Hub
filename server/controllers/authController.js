const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const sendEmail = require('../utils/sendEmail');

/**
 * REGISTRATION LOGIC
 * Initializes a new operative profile.
 */
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Operative already registered in system.' });
    }

    user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ 
      success: true,
      msg: 'Operative profile initialized. Please log in to verify identity.' 
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ msg: 'Internal System Failure during initialization.' });
  }
};

/**
 * STEP 1: Credential Verification
 * Validates initial email/password and signals move to MFA.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Access Denied: Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Access Denied: Invalid Credentials' });

    res.json({ 
      mfaRequired: true, 
      userId: user._id,
      msg: "Credentials verified. Redirecting to security selection..." 
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error during authentication.' });
  }
};

/**
 * STEP 2: Send OTP via Email
 */
exports.sendOTP = async (req, res) => {
  const { userId, method } = req.body; 
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "Operative not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    if (method === 'email') {
      await sendEmail({
        email: user.email,
        subject: 'CyberSecure-Hub Access Code',
        otp: otp
      });
    }

    res.json({ msg: `Security code transmitted via ${method}. Check your email.` });
  } catch (err) {
    console.error("OTP Delivery Error:", err);
    res.status(500).json({ msg: "Failed to transmit security code. System fault." });
  }
};

/**
 * STEP 3: Final Verification
 */
exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user || user.otp !== otp || Date.now() > user.otpExpire) {
      return res.status(400).json({ msg: 'Invalid or expired verification code.' });
    }

    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const payload = {
      user: {
        id: user._id.toString()
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[AUTH] Vault Unlocked: Sending profile for ${user.email}`);

    res.json({ 
      token,
      user: { 
        username: user.username, 
        email: user.email 
      },
      msg: "Vault Unlocked. Redirecting to Dashboard..."
    });

  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ msg: 'Verification Error: System fault detected.' });
  }
};

/**
 * ✅ FORGOT PASSWORD: Send Reset Code
 * Generates a short-lived recovery code sent to the operative's email.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Operative email not found." });

    // Generate 6-digit Reset Code
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration for 10 minutes
    user.resetPasswordOTP = resetOTP;
    user.resetPasswordExpires = Date.now() + 600000; 
    await user.save();

    // Transmit via existing email utility
    await sendEmail({
      email: user.email,
      subject: 'CyberSecure-Hub Access Recovery',
      otp: resetOTP
    });

    res.json({ msg: "Recovery code transmitted to system email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ msg: "Server infrastructure fault." });
  }
};

/**
 * ✅ RESET PASSWORD: Finalize Credential Update
 * Verifies recovery code and applies a new master access key.
 */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() } // Must not be expired
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired recovery code." });

    // Apply new password (hashed by User model hook)
    user.password = newPassword;

    // Clear reset fields for security
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    console.log(`[AUTH] Access credentials successfully updated via recovery for: ${email}`);
    res.json({ msg: "Access credentials successfully updated." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ msg: "Reset protocol failure." });
  }
};

/**
 * ✅ SETTINGS: CHANGE PASSWORD
 * Secured via authMiddleware to allow operatives to update credentials.
 */
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "Operative profile not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password verification failed." });
    }

    user.password = newPassword;
    await user.save();

    console.log(`[AUTH] Credentials updated successfully for user ID: ${req.user.id}`);
    res.json({ msg: "Credentials updated successfully." });

  } catch (err) {
    console.error("Password Update Error:", err);
    res.status(500).json({ msg: "System failure during credential update." });
  }
};