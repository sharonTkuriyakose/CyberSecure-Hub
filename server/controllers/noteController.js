const Note = require('../models/Note');

// Create a new encrypted note
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const newNote = new Note({
      user: req.user.id, // Extracted from JWT via authMiddleware
      title,
      content // Received as an AES encrypted string from the frontend
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all notes for the logged-in user
exports.getNotes = async (req, res) => {
  try {
    // Finds notes belonging only to the authenticated user
    const notes = await Note.find({ user: req.user.id }).sort({ date: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a specific note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Security Check: Ensure the user deleting the note actually owns it
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await note.deleteOne();
    res.json({ msg: 'Note removed successfully' });
  } catch (err) {
    console.error(err.message);
    // Handle invalid ObjectIDs
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server Error');
  }
};