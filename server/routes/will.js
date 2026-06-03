const express = require('express');
const Will = require('../models/Will');
const Asset = require('../models/Asset');
const Beneficiary = require('../models/Beneficiary');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/will — Get user's latest will
router.get('/', async (req, res) => {
  try {
    const will = await Will.findOne({ userId: req.user._id })
      .sort({ version: -1 })
      .populate('content.assetDistribution.assetId', 'name category value')
      .populate('content.assetDistribution.beneficiaryId', 'name email relationship');

    if (!will) {
      return res.status(404).json({ message: 'No will found. Create one to get started.' });
    }

    res.json(will);
  } catch (error) {
    console.error('Get will error:', error.message);
    res.status(500).json({ message: 'Error fetching will', error: error.message });
  }
});

// POST /api/will — Create or update will
router.post('/', async (req, res) => {
  try {
    const { title, content, witnesses } = req.body;

    // Check if a draft will already exists
    let will = await Will.findOne({ userId: req.user._id, status: 'draft' });

    if (will) {
      // Update existing draft
      if (title) will.title = title;
      if (content) will.content = content;
      if (witnesses) will.witnesses = witnesses;
      will = await will.save();
    } else {
      // Find highest version for this user
      const latestWill = await Will.findOne({ userId: req.user._id }).sort({ version: -1 });
      const newVersion = latestWill ? latestWill.version + 1 : 1;

      will = await Will.create({
        userId: req.user._id,
        title: title || 'My Digital Will',
        version: newVersion,
        content: content || {},
        witnesses: witnesses || [],
      });
    }

    res.status(201).json(will);
  } catch (error) {
    console.error('Create/update will error:', error.message);
    res.status(500).json({ message: 'Error saving will', error: error.message });
  }
});

// PUT /api/will/:id — Update will
router.put('/:id', async (req, res) => {
  try {
    const will = await Will.findOne({ _id: req.params.id, userId: req.user._id });
    if (!will) return res.status(404).json({ message: 'Will not found' });
    if (will.status === 'finalized' || will.status === 'notarized') {
      return res.status(400).json({ message: 'Cannot edit a finalized will' });
    }
    const { title, content, witnesses } = req.body;
    if (title) will.title = title;
    if (content) will.content = content;
    if (witnesses) will.witnesses = witnesses;
    will.updatedAt = Date.now();
    const updated = await will.save();
    res.json(updated);
  } catch (error) {
    console.error('Update will error:', error.message);
    res.status(500).json({ message: 'Error updating will', error: error.message });
  }
});

// PUT /api/will/:id/finalize — Finalize a will
router.put('/:id/finalize', async (req, res) => {
  try {
    const will = await Will.findOne({ _id: req.params.id, userId: req.user._id });
    if (!will) {
      return res.status(404).json({ message: 'Will not found' });
    }

    if (will.status === 'finalized' || will.status === 'notarized') {
      return res.status(400).json({ message: 'Will is already finalized' });
    }

    // Validate will has minimum required content
    if (!will.content || !will.content.personalInfo || !will.content.personalInfo.fullName) {
      return res.status(400).json({ message: 'Will must have personal information before finalizing' });
    }

    will.status = 'finalized';
    will.updatedAt = Date.now();
    const finalized = await will.save();

    res.json({ message: 'Will finalized successfully', will: finalized });
  } catch (error) {
    console.error('Finalize will error:', error.message);
    res.status(500).json({ message: 'Error finalizing will', error: error.message });
  }
});

// GET /api/will/:id/pdf — Generate PDF data for will
router.get('/:id/pdf', async (req, res) => {
  try {
    const will = await Will.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('content.assetDistribution.assetId', 'name category value currency')
      .populate('content.assetDistribution.beneficiaryId', 'name email relationship');

    if (!will) {
      return res.status(404).json({ message: 'Will not found' });
    }

    // Get all assets and beneficiaries for the user to enrich the PDF
    const assets = await Asset.find({ userId: req.user._id });
    const beneficiaries = await Beneficiary.find({ userId: req.user._id });

    // Build PDF data payload (frontend generates the actual PDF with jsPDF)
    const pdfData = {
      title: will.title,
      version: will.version,
      status: will.status,
      personalInfo: will.content.personalInfo || {},
      executorInfo: will.content.executorInfo || {},
      assetDistribution: will.content.assetDistribution || [],
      specialInstructions: will.content.specialInstructions || '',
      digitalAccountInstructions: will.content.digitalAccountInstructions || '',
      residualEstateClause: will.content.residualEstateClause || '',
      witnesses: will.witnesses || [],
      totalAssets: assets.length,
      totalBeneficiaries: beneficiaries.length,
      totalEstateValue: assets.reduce((sum, a) => sum + (a.value || 0), 0),
      generatedAt: new Date().toISOString(),
    };

    res.json(pdfData);
  } catch (error) {
    console.error('Generate will PDF error:', error.message);
    res.status(500).json({ message: 'Error generating will PDF data', error: error.message });
  }
});

module.exports = router;
