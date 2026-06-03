const mongoose = require('mongoose');

const willSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'My Digital Will' },
  version: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'notarized', 'revoked'],
    default: 'draft',
  },
  content: {
    personalInfo: {
      fullName: { type: String },
      dateOfBirth: { type: String },
      address: { type: String },
      idNumber: { type: String },
    },
    executorInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    assetDistribution: [{
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
      beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
      percentage: { type: Number },
      conditions: { type: String },
    }],
    specialInstructions: { type: String },
    digitalAccountInstructions: { type: String },
    residualEstateClause: { type: String },
  },
  witnesses: [{
    name: { type: String },
    email: { type: String },
    signed: { type: Boolean, default: false },
    signedAt: { type: Date },
  }],
  generatedPdfPath: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on save
willSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Will', willSchema);
