const express = require('express');
const Asset = require('../models/Asset');
const { protect } = require('../middleware/auth');
const { encryptData } = require('../utils/encryption');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/assets/stats/summary — Aggregate stats for dashboard
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user._id;

    // Total assets count
    const totalAssets = await Asset.countDocuments({ userId });

    // Total value across all assets
    const valueAgg = await Asset.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, totalValue: { $sum: '$value' } } },
    ]);
    const totalValue = valueAgg.length > 0 ? valueAgg[0].totalValue : 0;

    // Assets by category
    const byCategory = await Asset.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$category', count: { $sum: 1 }, value: { $sum: '$value' } } },
      { $sort: { value: -1 } },
    ]);

    // Assets by status
    const byStatus = await Asset.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent assets (last 5)
    const recentAssets = await Asset.find({ userId }).sort({ createdAt: -1 }).limit(5);

    res.json({
      totalAssets,
      totalValue,
      byCategory,
      byStatus,
      recentAssets,
    });
  } catch (error) {
    console.error('Asset stats error:', error.message);
    res.status(500).json({ message: 'Error fetching asset stats', error: error.message });
  }
});

// GET /api/assets — List all user's assets
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } },
      ];
    }

    const assets = await Asset.find(filter)
      .populate('beneficiaries.beneficiaryId', 'name email')
      .sort({ createdAt: -1 });

    res.json(assets);
  } catch (error) {
    console.error('List assets error:', error.message);
    res.status(500).json({ message: 'Error fetching assets', error: error.message });
  }
});

// POST /api/assets — Create a new asset
router.post('/', async (req, res) => {
  try {
    const { name, category, subcategory, description, value, currency, institution, accountId, credentials, url, notes, beneficiaries } = req.body;

    // Encrypt sensitive fields if provided
    const encryptedAccountId = accountId ? encryptData(accountId) : undefined;
    const encryptedCredentials = credentials ? encryptData(credentials) : undefined;

    const asset = await Asset.create({
      userId: req.user._id,
      name,
      category,
      subcategory,
      description,
      value,
      currency,
      institution,
      accountId: encryptedAccountId,
      credentials: encryptedCredentials,
      url,
      notes,
      beneficiaries: beneficiaries || [],
    });

    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error.message);
    res.status(500).json({ message: 'Error creating asset', error: error.message });
  }
});

// GET /api/assets/:id — Get single asset
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('beneficiaries.beneficiaryId', 'name email relationship')
      .populate('documents');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error.message);
    res.status(500).json({ message: 'Error fetching asset', error: error.message });
  }
});

// PUT /api/assets/:id — Update an asset
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Update fields
    const allowedFields = ['name', 'category', 'subcategory', 'description', 'value', 'currency', 'institution', 'url', 'notes', 'status', 'beneficiaries'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        asset[field] = req.body[field];
      }
    });

    // Re-encrypt sensitive fields if updated
    if (req.body.accountId) asset.accountId = encryptData(req.body.accountId);
    if (req.body.credentials) asset.credentials = encryptData(req.body.credentials);

    const updatedAsset = await asset.save();
    res.json(updatedAsset);
  } catch (error) {
    console.error('Update asset error:', error.message);
    res.status(500).json({ message: 'Error updating asset', error: error.message });
  }
});

// DELETE /api/assets/:id — Delete an asset
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error.message);
    res.status(500).json({ message: 'Error deleting asset', error: error.message });
  }
});

// PUT /api/assets/:id/beneficiaries — Assign beneficiaries to an asset
router.put('/:id/beneficiaries', async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const { beneficiaries } = req.body; // [{ beneficiaryId, percentage }]

    // Validate total percentage doesn't exceed 100
    const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
    if (totalPercentage > 100) {
      return res.status(400).json({ message: 'Total allocation percentage cannot exceed 100%' });
    }

    asset.beneficiaries = beneficiaries;
    const updatedAsset = await asset.save();

    const populated = await Asset.findById(updatedAsset._id)
      .populate('beneficiaries.beneficiaryId', 'name email relationship');

    res.json(populated);
  } catch (error) {
    console.error('Assign beneficiaries error:', error.message);
    res.status(500).json({ message: 'Error assigning beneficiaries', error: error.message });
  }
});

module.exports = router;
