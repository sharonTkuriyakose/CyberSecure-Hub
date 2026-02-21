const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// 1. Load and Debug Environment Variables (CRITICAL STEP)
// We must load these before connectDB() or any route imports
const envPath = path.join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

console.log('--- Environment Check ---');
console.log('File Path:', envPath);

if (result.error) {
  console.log('❌ Error loading .env file:', result.error.message);
} else {
  const keys = Object.keys(result.parsed || {});
  console.log(`✅ Loaded ${keys.length} variables from .env`);
  
  // Debugging specifically for Nodemailer credentials
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? 'FOUND (' + process.env.EMAIL_USER + ')' : '❌ NOT FOUND'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'FOUND (Length: ' + process.env.EMAIL_PASS.length + ')' : '❌ NOT FOUND'}`);

  if (keys.length === 0) {
    console.log('⚠️ WARNING: .env file found but it appears to be empty or misformatted.');
  }
}

// 2. Connect to Database (MongoDB Atlas)
connectDB();

const app = express();

// 3. Explicit Middleware Configuration
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json());

// 4. Route Imports
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

// 5. Link Routes to Paths
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('CyberSecure-Hub API is running...');
});

// 6. Start the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  
  // Final verification logs for operational status
  console.log(`--- System Readiness Check ---`);
  console.log(`Cloudinary Name: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}`);
  console.log(`Mongo URI: ${process.env.MONGO_URI ? '✅' : '❌'}`);
  console.log(`SMTP Credentials: ${process.env.EMAIL_PASS ? '✅ Ready for OTP' : '❌ OTP Service Disabled'}`);
});