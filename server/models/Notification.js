const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'success'],
    default: 'info',
  },
  title: { type: String, required: [true, 'Title is required'] },
  message: { type: String, required: [true, 'Message is required'] },
  read: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
