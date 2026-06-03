const mongoose = require('mongoose');

const deadMansSwitchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enabled: { type: Boolean, default: false },
  intervalDays: { type: Number, default: 90 }, // check-in interval in days
  lastCheckIn: { type: Date, default: Date.now },
  nextCheckIn: { type: Date },
  missedCheckIns: { type: Number, default: 0 },
  maxMissedCheckIns: { type: Number, default: 3 },
  notificationsSent: [{
    type: { type: String },
    sentAt: { type: Date },
  }],
  emergencyContacts: [{
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  }],
  linkedPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'InheritancePlan' },
  status: {
    type: String,
    enum: ['active', 'warning', 'triggered', 'disabled'],
    default: 'disabled',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DeadMansSwitch', deadMansSwitchSchema);
