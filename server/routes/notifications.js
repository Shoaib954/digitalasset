const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/notifications — Get all notifications for current user
router.get('/', async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const filter = { userId: req.user._id };
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);

    // Count unread
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('List notifications error:', error.message);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// PUT /api/notifications/:id/read — Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error.message);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// PUT /api/notifications/read-all — Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error.message);
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
});

// DELETE /api/notifications/:id — Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error.message);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;
