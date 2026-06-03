const express = require('express');
const Beneficiary = require('../models/Beneficiary');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/beneficiaries — List all beneficiaries for current user
router.get('/', async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(beneficiaries);
  } catch (error) {
    console.error('List beneficiaries error:', error.message);
    res.status(500).json({ message: 'Error fetching beneficiaries', error: error.message });
  }
});

// POST /api/beneficiaries — Create a new beneficiary
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, relationship, dateOfBirth, address, identityDocument, allocationPercentage, notes } = req.body;

    // Check for duplicate beneficiary email for this user
    const existing = await Beneficiary.findOne({ userId: req.user._id, email });
    if (existing) {
      return res.status(400).json({ message: 'A beneficiary with this email already exists' });
    }

    const beneficiary = await Beneficiary.create({
      userId: req.user._id,
      name,
      email,
      phone,
      relationship,
      dateOfBirth,
      address,
      identityDocument,
      allocationPercentage: allocationPercentage || 0,
      notes,
    });

    res.status(201).json(beneficiary);
  } catch (error) {
    console.error('Create beneficiary error:', error.message);
    res.status(500).json({ message: 'Error creating beneficiary', error: error.message });
  }
});

// GET /api/beneficiaries/:id — Get single beneficiary
router.get('/:id', async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({ _id: req.params.id, userId: req.user._id });
    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    res.json(beneficiary);
  } catch (error) {
    console.error('Get beneficiary error:', error.message);
    res.status(500).json({ message: 'Error fetching beneficiary', error: error.message });
  }
});

// PUT /api/beneficiaries/:id — Update a beneficiary
router.put('/:id', async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({ _id: req.params.id, userId: req.user._id });
    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    // Update allowed fields
    const allowedFields = ['name', 'email', 'phone', 'relationship', 'dateOfBirth', 'address', 'identityDocument', 'verified', 'allocationPercentage', 'notes'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        beneficiary[field] = req.body[field];
      }
    });

    const updated = await beneficiary.save();
    res.json(updated);
  } catch (error) {
    console.error('Update beneficiary error:', error.message);
    res.status(500).json({ message: 'Error updating beneficiary', error: error.message });
  }
});

// DELETE /api/beneficiaries/:id — Delete a beneficiary
router.delete('/:id', async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    res.json({ message: 'Beneficiary deleted successfully' });
  } catch (error) {
    console.error('Delete beneficiary error:', error.message);
    res.status(500).json({ message: 'Error deleting beneficiary', error: error.message });
  }
});

module.exports = router;
