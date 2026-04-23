const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    /\.onrender\.com$/,
    /\.netlify\.app$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lost & Found API is running!',
    version: '1.0.0',
    endpoints: {
      auth: ['/api/register', '/api/login'],
      items: ['/api/items (GET, POST)', '/api/items/:id (GET, PUT, DELETE)', '/api/items/search?name=xyz']
    }
  });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  });

module.exports = app;
