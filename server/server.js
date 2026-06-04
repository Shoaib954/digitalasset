const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message, err.stack);
  process.exit(1);
});

console.log('=== DigiAsset Starting ===');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI set:', !!process.env.MONGO_URI);

const app = express();

// Allow all origins — works for localhost, Vercel, mobile
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Loading connectDB...');
const connectDB = require('./config/db');

console.log('Loading routes...');
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
console.log('All routes loaded!');

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

console.log('Connecting to MongoDB...');
connectDB().then(() => {
  console.log('MongoDB connected! Starting HTTP server...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DigiAsset running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});
