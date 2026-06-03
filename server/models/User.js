const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  role: {
    type: String,
    enum: ['owner', 'beneficiary', 'executor', 'lawyer', 'notary', 'admin'],
    default: 'owner',
  },
  phone: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  kycVerified: { type: Boolean, default: false },
  kycDocuments: [{ type: String }], // file paths
  profileImage: { type: String },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
