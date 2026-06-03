const express = require('express');
const DeadMansSwitch = require('../models/DeadMansSwitch');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/deadswitch — Get user's switch configuration
router.get('/', async (req, res) => {
  try {
    let deadSwitch = await DeadMansSwitch.findOne({ userId: req.user._id })
      .populate('linkedPlanId', 'name status');

    if (!deadSwitch) {
      // Return default configuration if none exists
      return res.json({
        exists: false,
        message: 'No dead man\'s switch configured yet',
        defaults: {
          intervalDays: 90,
          maxMissedCheckIns: 3,
        },
      });
    }

    // Calculate time remaining until next check-in
    const now = new Date();
    const nextCheckIn = new Date(deadSwitch.nextCheckIn);
    const daysRemaining = Math.max(0, Math.ceil((nextCheckIn - now) / (1000 * 60 * 60 * 24)));

    res.json({
      exists: true,
      ...deadSwitch.toObject(),
      daysRemaining,
    });
  } catch (error) {
    console.error('Get dead switch error:', error.message);
    res.status(500).json({ message: 'Error fetching dead man\'s switch', error: error.message });
  }
});

// POST /api/deadswitch — Create or update dead man's switch
router.post('/', async (req, res) => {
  try {
    const { intervalDays, maxMissedCheckIns, emergencyContacts, linkedPlanId, enabled } = req.body;

    let deadSwitch = await DeadMansSwitch.findOne({ userId: req.user._id });

    const nextCheckIn = new Date(Date.now() + (intervalDays || 90) * 24 * 60 * 60 * 1000);

    if (deadSwitch) {
      // Update existing
      if (intervalDays !== undefined) deadSwitch.intervalDays = intervalDays;
      if (maxMissedCheckIns !== undefined) deadSwitch.maxMissedCheckIns = maxMissedCheckIns;
      if (emergencyContacts) deadSwitch.emergencyContacts = emergencyContacts;
      if (linkedPlanId !== undefined) deadSwitch.linkedPlanId = linkedPlanId;
      if (enabled !== undefined) {
        deadSwitch.enabled = enabled;
        deadSwitch.status = enabled ? 'active' : 'disabled';
      }
      deadSwitch.nextCheckIn = nextCheckIn;
      deadSwitch.lastCheckIn = Date.now();
      deadSwitch = await deadSwitch.save();
    } else {
      // Create new
      deadSwitch = await DeadMansSwitch.create({
        userId: req.user._id,
        enabled: enabled || false,
        intervalDays: intervalDays || 90,
        lastCheckIn: Date.now(),
        nextCheckIn,
        maxMissedCheckIns: maxMissedCheckIns || 3,
        emergencyContacts: emergencyContacts || [],
        linkedPlanId,
        status: enabled ? 'active' : 'disabled',
      });

      // Notify user
      await Notification.create({
        userId: req.user._id,
        type: 'info',
        title: 'Dead Man\'s Switch Configured',
        message: `Your switch is set with a ${intervalDays || 90}-day check-in interval.`,
        link: '/dead-mans-switch',
      });
    }

    res.status(201).json(deadSwitch);
  } catch (error) {
    console.error('Create/update dead switch error:', error.message);
    res.status(500).json({ message: 'Error saving dead man\'s switch', error: error.message });
  }
});

// POST /api/deadswitch/checkin — Heartbeat check-in
router.post('/checkin', async (req, res) => {
  try {
    const deadSwitch = await DeadMansSwitch.findOne({ userId: req.user._id });

    if (!deadSwitch) {
      return res.status(404).json({ message: 'No dead man\'s switch configured' });
    }

    if (!deadSwitch.enabled) {
      return res.status(400).json({ message: 'Dead man\'s switch is disabled' });
    }

    // Update check-in
    deadSwitch.lastCheckIn = Date.now();
    deadSwitch.nextCheckIn = new Date(Date.now() + deadSwitch.intervalDays * 24 * 60 * 60 * 1000);
    deadSwitch.missedCheckIns = 0;
    deadSwitch.status = 'active';

    await deadSwitch.save();

    res.json({
      message: 'Check-in successful! Timer reset.',
      lastCheckIn: deadSwitch.lastCheckIn,
      nextCheckIn: deadSwitch.nextCheckIn,
      intervalDays: deadSwitch.intervalDays,
    });
  } catch (error) {
    console.error('Check-in error:', error.message);
    res.status(500).json({ message: 'Error during check-in', error: error.message });
  }
});

// PUT /api/deadswitch/toggle — Enable/disable switch
router.put('/toggle', async (req, res) => {
  try {
    const deadSwitch = await DeadMansSwitch.findOne({ userId: req.user._id });

    if (!deadSwitch) {
      return res.status(404).json({ message: 'No dead man\'s switch configured. Create one first.' });
    }

    // Toggle enabled state
    deadSwitch.enabled = !deadSwitch.enabled;
    deadSwitch.status = deadSwitch.enabled ? 'active' : 'disabled';

    if (deadSwitch.enabled) {
      // Reset timers when enabling
      deadSwitch.lastCheckIn = Date.now();
      deadSwitch.nextCheckIn = new Date(Date.now() + deadSwitch.intervalDays * 24 * 60 * 60 * 1000);
      deadSwitch.missedCheckIns = 0;
    }

    await deadSwitch.save();

    const statusText = deadSwitch.enabled ? 'enabled' : 'disabled';

    // Notify user
    await Notification.create({
      userId: req.user._id,
      type: deadSwitch.enabled ? 'success' : 'info',
      title: `Dead Man's Switch ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message: `Your dead man's switch has been ${statusText}.`,
    });

    res.json({
      message: `Dead man's switch ${statusText}`,
      enabled: deadSwitch.enabled,
      status: deadSwitch.status,
    });
  } catch (error) {
    console.error('Toggle dead switch error:', error.message);
    res.status(500).json({ message: 'Error toggling dead man\'s switch', error: error.message });
  }
});

module.exports = router;
