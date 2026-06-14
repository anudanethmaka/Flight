const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://hasinthainduwara2003:myIT9DkUxhVoOvmT@cluster0-shard-00-00.1zcqk.mongodb.net:27017,cluster0-shard-00-01.1zcqk.mongodb.net:27017,cluster0-shard-00-02.1zcqk.mongodb.net:27017/skylink-auth?ssl=true&replicaSet=atlas-jwm1nc-shard-0&authSource=admin&retryWrites=true&w=majority");
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
