const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Asset name is required'] },
  category: {
    type: String,
    enum: ['financial', 'Financial', 'crypto', 'Crypto', 'digital', 'Digital', 'intellectual_property', 'IP', 'ip', 'business', 'Business', 'documents', 'Documents'],
    required: [true, 'Category is required'],
  },
  subcategory: { type: String }, // e.g., 'bank_account', 'bitcoin', 'email'
  description: { type: String },
  value: { type: Number },
  currency: { type: String, default: 'USD' },
  institution: { type: String }, // bank name, exchange name, etc.
  accountId: { type: String },   // encrypted account number
  credentials: { type: String }, // encrypted JSON with username/password/keys
  url: { type: String },
  notes: { type: String },
  beneficiaries: [{
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
    percentage: { type: Number },
  }],
  status: {
    type: String,
    enum: ['active', 'pending_transfer', 'transferred', 'archived'],
    default: 'active',
  },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on save
assetSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
