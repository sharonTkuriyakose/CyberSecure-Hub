const File = require('../models/File');

// --- 1. SAVE FILE METADATA (CALLED AFTER SUPABASE UPLOAD) ---
exports.uploadFile = async (req, res) => {
  try {
    const { fileName, storagePath, fileType, fileSize } = req.body;

    // Basic validation to ensure the frontend sent the Supabase path
    if (!storagePath) {
      return res.status(400).json({ msg: 'Storage path is required from Supabase' });
    }

    const newFile = new File({
      user: req.user.id, // Linked to the authenticated user
      fileName,
      storagePath,      // ✅ The internal Supabase path (e.g., "user_id/123_cv.pdf")
      fileType,
      fileSize,
      createdAt: new Date()
    });

    await newFile.save();
    res.json({ msg: 'Asset metadata secured in vault', file: newFile });
  } catch (err) {
    console.error("Metadata Sync Error:", err.message);
    res.status(500).send('Server Error during asset protection');
  }
};

// --- 2. GET ALL FILES ---
exports.getFiles = async (req, res) => {
  try {
    // Fetch only the files belonging to the logged-in user
    const files = await File.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // We send the storagePath back so the frontend can create a Signed URL
    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Vault synchronization failure');
  }
};

// --- 3. DELETE FILE ---
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ msg: 'File not found' });
    
    // Authorization check
    if (file.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Note: The actual file deletion from Supabase happens in the React frontend
    // before calling this API, but we remove the record from Mongo here.
    await file.deleteOne();
    res.json({ msg: 'Asset record removed from vault' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error during asset destruction');
  }
};