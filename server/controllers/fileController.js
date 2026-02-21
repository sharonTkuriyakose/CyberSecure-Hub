const cloudinary = require('cloudinary').v2;
const File = require('../models/File');

// Configure Cloudinary using the variables in your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. Upload File (Stream to Cloudinary + Save JSON to Mongo) ---
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Direct buffer upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: "CyberSecure_Vault", 
        resource_type: "auto" 
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ msg: "Cloudinary upload failed" });
        }

        // Once the file is in Cloudinary, save the "receipt" to MongoDB Atlas
        const newFile = new File({
          user: req.user.id, // Extracted from your auth middleware
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileUrl: result.secure_url, // Use the secure HTTPS link
          public_id: result.public_id // Required for deleting the file later
        });

        await newFile.save();
        res.json({ msg: 'File protected in Cloud & metadata saved', file: newFile });
      }
    );

    // End the stream by passing the file buffer from multer
    uploadStream.end(req.file.buffer);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error during file upload');
  }
};

// --- 2. Get All Files for Logged-in User ---
exports.getFiles = async (req, res) => {
  try {
    // Find files belonging only to the authenticated user
    const files = await File.find({ user: req.user.id }).sort({ date: -1 });
    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error fetching files');
  }
};

// --- 3. Delete File (Remove from Cloudinary + Remove JSON from Mongo) ---
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ msg: 'File not found' });
    
    // Security check: Ensure the user deleting the file owns it
    if (file.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Delete the binary file from Cloudinary using its unique ID
    try {
      await cloudinary.uploader.destroy(file.public_id);
    } catch (err) {
      console.warn("File already missing from Cloudinary, cleaning up DB...");
    }

    // Delete the JSON metadata from MongoDB Atlas
    await file.deleteOne();
    res.json({ msg: 'File removed from vault' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error during deletion');
  }
};