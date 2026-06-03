const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Document title is required'] },
  category: {
    type: String,
    enum: ['will', 'passport', 'property', 'tax', 'insurance', 'legal', 'identity', 'financial', 'other'],
  },
  filePath: { type: String, required: [true, 'File path is required'] },
  fileType: { type: String },
  mimetype: { type: String },   // alias for fileType
  fileSize: { type: Number },
  size: { type: Number },       // alias for fileSize
  encrypted: { type: Boolean, default: false },
  encryptedData: { type: String },
  blockchainHash: { type: String },
  blockchainTxId: { type: String },
  notarized: { type: Boolean, default: false },
  notes: { type: String },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', documentSchema);
