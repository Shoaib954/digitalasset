const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // the asset owner
  name: { type: String, required: [true, 'Beneficiary name is required'] },
  email: { type: String, required: [true, 'Beneficiary email is required'], lowercase: true, trim: true },
  phone: { type: String },
  relationship: {
    type: String,
    enum: ['spouse', 'Spouse', 'child', 'Child', 'parent', 'Parent', 'sibling', 'Sibling', 'friend', 'Friend', 'partner', 'Partner', 'colleague', 'Colleague', 'organization', 'charity', 'Charity', 'other', 'Other'],
  },
  dateOfBirth: { type: Date },
  address: { type: String },
  identityDocument: { type: String }, // file path
  verified: { type: Boolean, default: false },
  allocationPercentage: { type: Number, default: 0 }, // overall default allocation
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
