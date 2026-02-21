const Password = require('../models/Password');

// @desc    Add new password entry
// @route   POST /api/data/passwords
// @access  Private
exports.addPassword = async (req, res) => {
  try {
    const { title, username, password } = req.body;

    const newPassword = new Password({
      user: req.user.id, // From authMiddleware
      title,
      username,
      password // Stored as the encrypted string from frontend
    });

    const savedEntry = await newPassword.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Vault Write Blocked');
  }
};

// @desc    Get all user passwords
// @route   GET /api/data/passwords
// @access  Private
exports.getPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ user: req.user.id }).sort({ date: -1 });
    res.json(passwords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Vault Read Blocked');
  }
};

// @desc    Update a password entry
// @route   PUT /api/data/passwords/:id
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { title, username, password } = req.body;
    
    // Find the password by ID
    let entry = await Password.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ msg: 'Credential not found' });
    }

    // Ensure user owns the entry
    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update the fields
    entry = await Password.findByIdAndUpdate(
      req.params.id,
      { $set: { title, username, password } },
      { new: true }
    );

    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Vault Update Blocked');
  }
};

// @desc    Delete a password entry
// @route   DELETE /api/data/passwords/:id
// @access  Private
exports.deletePassword = async (req, res) => {
  try {
    const entry = await Password.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ msg: 'Credential not found' });
    }

    // Ensure user owns the entry
    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Password.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Credential removed from vault' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Vault Removal Blocked');
  }
};