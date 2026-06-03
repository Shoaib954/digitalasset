const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const beneficiaryRoutes = require('./routes/beneficiaries');
const documentRoutes = require('./routes/documents');
const willRoutes = require('./routes/will');
const inheritanceRoutes = require('./routes/inheritance');
const deadswitchRoutes = require('./routes/deadswitch');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();

// --- Middleware ---

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/will', willRoutes);
app.use('/api/inheritance', inheritanceRoutes);
app.use('/api/deadswitch', deadswitchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Error handling middleware ---
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 DigiAsset server running on port ${PORT}`);
    console.log(`📁 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
