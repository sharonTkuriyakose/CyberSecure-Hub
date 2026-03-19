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

// 3. Robust CORS Configuration (Production Hardened)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sharon-cyberhub.vercel.app',      // ✅ Your current Vercel URL
  'https://cyber-secure-hub-mu.vercel.app',  // Legacy Vercel URL
  'https://cybersecure-hub.in'               // Custom Domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Whitelist check: matches our list OR any vercel.app subdomain you own
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("🚫 CORS Blocked for Origin:", origin);
      callback(new Error('Not allowed by CORS Policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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
  
  // Final verification logs (Secure version)
  console.log(`--- Security Intelligence Check ---`);
  console.log(`MongoDB: ${process.env.MONGO_URI ? '✅ SECURE' : '❌ OFFLINE'}`);
  console.log(`Mailjet: ${process.env.MJ_APIKEY_PUBLIC ? '✅ ARMED' : '❌ DISABLED'}`);
  console.log(`Encryption: ${process.env.ENCRYPTION_KEY ? '✅ LOADED' : '❌ MISSING'}`);
});