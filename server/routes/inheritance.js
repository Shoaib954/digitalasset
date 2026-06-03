const express = require('express');
const InheritancePlan = require('../models/InheritancePlan');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/inheritance/timeline — Get transfer timeline for all plans
router.get('/timeline', async (req, res) => {
  try {
    const plans = await InheritancePlan.find({ userId: req.user._id })
      .populate('beneficiaries.beneficiaryId', 'name email')
      .sort({ createdAt: -1 });

    // Build timeline from all plans' transfer stages
    const timeline = [];
    plans.forEach((plan) => {
      // Add plan creation event
      timeline.push({
        planId: plan._id,
        planName: plan.name,
        event: 'Plan Created',
        status: plan.status,
        date: plan.createdAt,
        type: 'creation',
      });

      // Add transfer stage events
      if (plan.transferStages) {
        plan.transferStages.forEach((stage) => {
          timeline.push({
            planId: plan._id,
            planName: plan.name,
            event: stage.stage,
            status: stage.status,
            date: stage.completedAt || plan.createdAt,
            notes: stage.notes,
            type: 'stage',
          });
        });
      }
    });

    // Sort timeline by date descending
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(timeline);
  } catch (error) {
    console.error('Get timeline error:', error.message);
    res.status(500).json({ message: 'Error fetching timeline', error: error.message });
  }
});

// GET /api/inheritance — List all inheritance plans
router.get('/', async (req, res) => {
  try {
    const plans = await InheritancePlan.find({ userId: req.user._id })
      .populate('beneficiaries.beneficiaryId', 'name email relationship')
      .populate('beneficiaries.assets', 'name category value')
      .populate('executorId', 'name email')
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    console.error('List plans error:', error.message);
    res.status(500).json({ message: 'Error fetching inheritance plans', error: error.message });
  }
});

// POST /api/inheritance — Create a new inheritance plan
router.post('/', async (req, res) => {
  try {
    const { name, description, triggerType, triggerDate, executorId, beneficiaries, verificationRequirements } = req.body;

    const plan = await InheritancePlan.create({
      userId: req.user._id,
      name,
      description,
      triggerType,
      triggerDate,
      executorId,
      beneficiaries: beneficiaries || [],
      verificationRequirements: verificationRequirements || {},
      transferStages: [
        { stage: 'Plan Created', status: 'completed', completedAt: new Date(), notes: 'Inheritance plan initialized' },
      ],
    });

    // Create notification
    await Notification.create({
      userId: req.user._id,
      type: 'success',
      title: 'Inheritance Plan Created',
      message: `Your plan "${name}" has been created successfully.`,
      link: '/inheritance',
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error.message);
    res.status(500).json({ message: 'Error creating inheritance plan', error: error.message });
  }
});

// GET /api/inheritance/:id — Get single plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await InheritancePlan.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('beneficiaries.beneficiaryId', 'name email relationship phone')
      .populate('beneficiaries.assets', 'name category value currency')
      .populate('executorId', 'name email phone');

    if (!plan) {
      return res.status(404).json({ message: 'Inheritance plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error.message);
    res.status(500).json({ message: 'Error fetching plan', error: error.message });
  }
});

// PUT /api/inheritance/:id — Update a plan
router.put('/:id', async (req, res) => {
  try {
    const plan = await InheritancePlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Inheritance plan not found' });
    }

    if (plan.status === 'completed') {
      return res.status(400).json({ message: 'Cannot modify a completed plan' });
    }

    const allowedFields = ['name', 'description', 'triggerType', 'triggerDate', 'executorId', 'beneficiaries', 'verificationRequirements', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });

    const updated = await plan.save();
    res.json(updated);
  } catch (error) {
    console.error('Update plan error:', error.message);
    res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
});

// PUT /api/inheritance/:id/trigger — Trigger a plan (simulate inheritance activation)
router.put('/:id/trigger', async (req, res) => {
  try {
    const plan = await InheritancePlan.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('beneficiaries.beneficiaryId', 'name email');

    if (!plan) {
      return res.status(404).json({ message: 'Inheritance plan not found' });
    }

    if (plan.status === 'triggered' || plan.status === 'completed') {
      return res.status(400).json({ message: 'Plan is already triggered or completed' });
    }

    plan.status = 'triggered';
    plan.transferStages.push({
      stage: 'Plan Triggered',
      status: 'completed',
      completedAt: new Date(),
      notes: req.body.notes || 'Plan has been triggered for execution',
    });
    plan.transferStages.push({
      stage: 'Verification Pending',
      status: 'pending',
      notes: 'Awaiting required verifications',
    });

    await plan.save();

    // Notify the user
    await Notification.create({
      userId: req.user._id,
      type: 'alert',
      title: 'Inheritance Plan Triggered',
      message: `Plan "${plan.name}" has been triggered. Verification process initiated.`,
      link: '/inheritance',
    });

    res.json({ message: 'Plan triggered successfully', plan });
  } catch (error) {
    console.error('Trigger plan error:', error.message);
    res.status(500).json({ message: 'Error triggering plan', error: error.message });
  }
});

module.exports = router;
