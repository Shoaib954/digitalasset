const express = require('express');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Beneficiary = require('../models/Beneficiary');
const Document = require('../models/Document');
const Will = require('../models/Will');
const InheritancePlan = require('../models/InheritancePlan');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect);
router.use(adminOnly);

// GET /api/admin/users — List all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password -mfaSecret')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Admin list users error:', error.message);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// GET /api/admin/stats — System-wide statistics
router.get('/stats', async (req, res) => {
  try {
    // Count totals across the system
    const totalUsers = await User.countDocuments();
    const totalAssets = await Asset.countDocuments();
    const totalBeneficiaries = await Beneficiary.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const totalWills = await Will.countDocuments();
    const totalPlans = await InheritancePlan.countDocuments();

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Assets by category
    const assetsByCategory = await Asset.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
      { $sort: { totalValue: -1 } },
    ]);

    // Total asset value system-wide
    const totalValueAgg = await Asset.aggregate([
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    const totalAssetValue = totalValueAgg.length > 0 ? totalValueAgg[0].total : 0;

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Active plans
    const activePlans = await InheritancePlan.countDocuments({ status: 'active' });

    // Wills by status
    const willsByStatus = await Will.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      overview: {
        totalUsers,
        totalAssets,
        totalBeneficiaries,
        totalDocuments,
        totalWills,
        totalPlans,
        totalAssetValue,
        newUsersThisMonth,
        activePlans,
      },
      usersByRole,
      assetsByCategory,
      willsByStatus,
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// GET /api/admin/audit-log — Recent activity log
router.get('/audit-log', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Build audit log from recent notifications and user activity
    const recentNotifications = await Notification.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Recent user registrations
    const recentUsers = await User.find()
      .select('name email role createdAt lastActivity')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent assets created
    const recentAssets = await Asset.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent plans
    const recentPlans = await InheritancePlan.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Combine into a unified audit log
    const auditLog = [];

    recentNotifications.forEach((n) => {
      auditLog.push({
        type: 'notification',
        action: n.title,
        details: n.message,
        user: n.userId ? { name: n.userId.name, email: n.userId.email } : null,
        timestamp: n.createdAt,
      });
    });

    recentUsers.forEach((u) => {
      auditLog.push({
        type: 'user_registration',
        action: 'New User Registered',
        details: `${u.name} (${u.email}) joined as ${u.role}`,
        user: { name: u.name, email: u.email },
        timestamp: u.createdAt,
      });
    });

    recentAssets.forEach((a) => {
      auditLog.push({
        type: 'asset_created',
        action: 'Asset Added',
        details: `${a.name} (${a.category}) — $${a.value || 0}`,
        user: a.userId ? { name: a.userId.name, email: a.userId.email } : null,
        timestamp: a.createdAt,
      });
    });

    recentPlans.forEach((p) => {
      auditLog.push({
        type: 'plan_created',
        action: 'Inheritance Plan Created',
        details: `${p.name} — Status: ${p.status}`,
        user: p.userId ? { name: p.userId.name, email: p.userId.email } : null,
        timestamp: p.createdAt,
      });
    });

    // Sort combined log by timestamp descending
    auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(auditLog.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Admin audit log error:', error.message);
    res.status(500).json({ message: 'Error fetching audit log', error: error.message });
  }
});

module.exports = router;
