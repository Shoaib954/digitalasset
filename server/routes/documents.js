const express = require('express');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/documents — List all documents for current user
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { userId: req.user._id };
    if (category) filter.category = category;

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('List documents error:', error.message);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// POST /api/documents/upload — Upload a document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, category, notes, encrypted } = req.body;

    const document = await Document.create({
      userId: req.user._id,
      title: title || req.file.originalname,
      category: category || 'other',
      filePath: req.file.filename,
      fileType: req.file.mimetype,
      mimetype: req.file.mimetype,
      fileSize: req.file.size,
      size: req.file.size,
      encrypted: encrypted === 'true',
      notes,
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Upload document error:', error.message);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// GET /api/documents/:id — Get single document
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    console.error('Get document error:', error.message);
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
});

// DELETE /api/documents/:id — Delete a document (and its file)
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete the physical file
    const filePath = path.join(__dirname, '..', 'uploads', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(document._id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error.message);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

// GET /api/documents/:id/download — Download a document file
router.get('/:id/download', async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, document.title);
  } catch (error) {
    console.error('Download document error:', error.message);
    res.status(500).json({ message: 'Error downloading document', error: error.message });
  }
});

module.exports = router;
