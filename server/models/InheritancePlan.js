const mongoose = require('mongoose');

const inheritancePlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Plan name is required'] },
  description: { type: String },
  status: {
    type: String,
    enum: ['draft', 'active', 'triggered', 'completed', 'cancelled'],
    default: 'draft',
  },
  triggerType: {
    type: String,
    enum: ['death', 'incapacity', 'date', 'deadmans_switch', 'custom_date', 'dead_mans_switch'],
  },
  triggerDate: { type: Date },
  executorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  beneficiaries: [{
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
    percentage: { type: Number },
  }],
  verificationRequirements: {
    deathCertificate: { type: Boolean, default: false },
    courtOrder: { type: Boolean, default: false },
    executorApproval: { type: Boolean, default: false },
  },
  transferStages: [{
    stage: { type: String },
    status: { type: String },
    completedAt: { type: Date },
    notes: { type: String },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on save
inheritancePlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InheritancePlan', inheritancePlanSchema);
