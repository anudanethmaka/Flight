const mongoose = require('mongoose');

const uri = "mongodb://hasinthainduwara2003:myIT9DkUxhVoOvmT@cluster0-shard-00-00.1zcqk.mongodb.net:27017,cluster0-shard-00-01.1zcqk.mongodb.net:27017,cluster0-shard-00-02.1zcqk.mongodb.net:27017/skylink-auth?ssl=true&replicaSet=atlas-jwm1nc-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");
mongoose.connect(uri)
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
