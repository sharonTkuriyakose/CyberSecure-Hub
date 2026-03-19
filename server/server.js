const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// 1. Load Environment Variables
dotenv.config(); 

console.log('--- System Initialization ---');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// 2. Connect to Database (MongoDB Atlas)
connectDB();

const app = express();

// 3. Updated CORS Configuration for Production
// ✅ Added your new potential Vercel subdomains here
const allowedOrigins = [
  'http://localhost:5173',                   // Local Vite dev
  'http://localhost:3000',                   // Local React dev (CRA)
  'https://cyber-secure-hub-mu.vercel.app',  // Old Vercel URL
  'https://cyber-vault-hub.vercel.app',      // Potential New URL
  'https://cyber-vault-operative.vercel.app',// Potential New URL
  'https://cybersecure-hub.in'               // Your Custom Domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our whitelist
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("🚫 CORS Blocked for Origin:", origin);
      callback(new Error('Not allowed by CORS Policy'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 4. Route Imports
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

// 5. Link Routes to Paths
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Base Route for Health Check & Deployment Verification
app.get('/', (req, res) => {
  res.json({ 
    status: "Online", 
    message: "CyberSecure-Hub API is fully operational.",
    timestamp: new Date().toISOString()
  });
});

// 6. Start the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server active on port ${PORT}`);
  
  // Final verification logs for operational status (Secure version)
  console.log(`--- Security Intelligence Check ---`);
  console.log(`MongoDB Connection: ${process.env.MONGO_URI ? '✅ SECURE' : '❌ OFFLINE'}`);
  console.log(`Mailjet (OTP): ${process.env.MJ_APIKEY_PUBLIC ? '✅ ARMED' : '❌ DISABLED'}`);
  console.log(`Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  console.log(`Encryption Key: ${process.env.ENCRYPTION_KEY ? '✅ LOADED' : '❌ MISSING'}`);
});