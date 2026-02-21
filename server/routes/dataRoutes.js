const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware'); //

// 1. Import Controllers
// These controllers handle the logic for your MERN stack features
const { uploadFile, getFiles, deleteFile } = require('../controllers/fileController');
const { getNotes, createNote, deleteNote } = require('../controllers/noteController'); 
const { 
  addPassword, 
  getPasswords, 
  updatePassword, 
  deletePassword 
} = require('../controllers/passwordController');

// 2. Multer Configuration
// Uses memory storage to facilitate streaming to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

/* ==========================================================================
   FILE VAULT ROUTES
   ========================================================================== */

// Upload a file to Cloudinary and save reference to MongoDB
router.post('/upload', auth, upload.single('file'), uploadFile);

// Fetch all file records for the authenticated user
router.get('/files', auth, getFiles);

// Remove file from both Cloudinary storage and MongoDB
router.delete('/files/:id', auth, deleteFile);

/* ==========================================================================
   SECURE NOTES ROUTES
   ========================================================================== */

// Retrieve all encrypted notes for the user
router.get('/notes', auth, getNotes);

// Create a new encrypted note entry
router.post('/notes', auth, createNote); 

// Permanently delete a note from the database
router.delete('/notes/:id', auth, deleteNote);

/* ==========================================================================
   PASSWORD VAULT ROUTES (Full CRUD)
   ========================================================================== */

// GET: Retrieve all stored credentials for the vault
router.get('/passwords', auth, getPasswords);

// POST: Securely add a new credential entry
router.post('/passwords', auth, addPassword);

// PUT: Update an existing credential (Change Password/Username)
router.put('/passwords/:id', auth, updatePassword);

// DELETE: Remove a credential from the vault permanently
router.delete('/passwords/:id', auth, deletePassword);

module.exports = router;