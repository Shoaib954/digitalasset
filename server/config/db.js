const mongoose = require('mongoose');

// Connect to MongoDB using the URI from environment variables
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://shoaib:shoaib1234@cluster0.tiumiak.mongodb.net/digiasset';
    console.log('Connecting to Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
