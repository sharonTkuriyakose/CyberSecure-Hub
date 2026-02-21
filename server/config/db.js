const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Safety check: Log exactly what is being passed to Mongoose
    if (!process.env.MONGO_URI) {
      console.error("CRITICAL ERROR: MONGO_URI is not defined in .env file.");
      console.log("Current working directory:", process.cwd());
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;