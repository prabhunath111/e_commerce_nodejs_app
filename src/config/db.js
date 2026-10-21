// Connects our app to MongoDB using Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // stop the app, it cannot work without DB
  }
};

module.exports = connectDB;
