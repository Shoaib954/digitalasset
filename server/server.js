const express = require('express');
const cors = require('cors');
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
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

console.log('Loading connectDB...');
const connectDB = require('./config/db');

console.log('Loading routes one by one...');

console.log('1. auth');
const authRoutes = require('./routes/auth');
console.log('2. assets');
const assetRoutes = require('./routes/assets');
console.log('3. beneficiaries');
const beneficiaryRoutes = require('./routes/beneficiaries');
console.log('4. documents');
const documentRoutes = require('./routes/documents');
console.log('5. will');
const willRoutes = require('./routes/will');
console.log('6. inheritance');
const inheritanceRoutes = require('./routes/inheritance');
console.log('7. deadswitch');
const deadswitchRoutes = require('./routes/deadswitch');
console.log('8. ai');
const aiRoutes = require('./routes/ai');
console.log('9. notifications');
const notificationRoutes = require('./routes/notifications');
console.log('10. admin');
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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DigiAsset running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});
