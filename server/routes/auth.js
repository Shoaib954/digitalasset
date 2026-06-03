const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeadMansSwitch = require('../models/DeadMansSwitch');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'digiasset_secret_key_2024', { expiresIn: '30d' });
};

// POST /api/auth/register — Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({ name, email, password, role: role || 'owner' });

    // Create a welcome notification
    await Notification.create({
      userId: user._id,
      type: 'success',
      title: 'Welcome to DigiAsset!',
      message: 'Your account has been created. Start by adding your digital assets.',
      link: '/dashboard',
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// POST /api/auth/login — Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last activity
    user.lastActivity = Date.now();
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// GET /api/auth/profile — Get current user profile (protected)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
});

// PUT /api/auth/profile — Update current user profile (protected)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const { name, phone, dateOfBirth, address, profileImage } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password; // pre-save hook will hash it
    }

    user.lastActivity = Date.now();
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth,
      address: updatedUser.address,
      profileImage: updatedUser.profileImage,
      kycVerified: updatedUser.kycVerified,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// POST /api/auth/check-in — Dead man's switch heartbeat (protected)
router.post('/check-in', protect, async (req, res) => {
  try {
    const deadSwitch = await DeadMansSwitch.findOne({ userId: req.user._id });

    if (!deadSwitch) {
      return res.status(404).json({ message: 'No dead man\'s switch configured' });
    }

    // Reset check-in
    deadSwitch.lastCheckIn = Date.now();
    deadSwitch.nextCheckIn = new Date(Date.now() + deadSwitch.intervalDays * 24 * 60 * 60 * 1000);
    deadSwitch.missedCheckIns = 0;
    if (deadSwitch.status === 'warning') {
      deadSwitch.status = 'active';
    }
    await deadSwitch.save();

    // Update user's last activity
    req.user.lastActivity = Date.now();
    await req.user.save();

    res.json({
      message: 'Check-in successful',
      lastCheckIn: deadSwitch.lastCheckIn,
      nextCheckIn: deadSwitch.nextCheckIn,
    });
  } catch (error) {
    console.error('Check-in error:', error.message);
    res.status(500).json({ message: 'Server error during check-in', error: error.message });
  }
});

module.exports = router;
