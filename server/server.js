const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const apiRoutes = require('./routes/api');

// Import middleware
const { apiLimiter } = require('./middleware/rateLimit');
const { sanitizeInput } = require('./middleware/validation');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize all input
app.use(sanitizeInput);

// Rate limiting
app.use('/api', apiLimiter);



// ==========================================
// MONGODB CONNECTION
// ==========================================

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itcenter';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create default admin user if not exists
    await createDefaultAdmin();

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Server will run in demo mode without database');
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@itcenter.uz',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!', // Will be hashed by pre-save hook
        fullName: 'Super Admin',
        role: 'super_admin',
        status: 'active'
      });
    }
  } catch (error) {
    console.error('Could not create default admin:', error.message);
  }
};

// ==========================================
// STATIC FILES
// ==========================================

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '../')));

// ==========================================
// API ROUTES
// ==========================================

// Auth routes
app.use('/api/auth', authRoutes);

// Students routes
app.use('/api/students', studentRoutes);

// Other API routes (courses, groups, payments, etc.)
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    time: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '2.0.0'
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'IT Center API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// ==========================================
// PAGE ROUTES (SPA fallback)
// ==========================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../auth.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/admin.html'));
});

app.get('/student/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../student/index.html'));
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint topilmadi'
    });
  }
  res.status(404).sendFile(path.join(__dirname, '../404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'Serverda xatolik yuz berdi',
    ...(isDev && { stack: err.stack })
  });
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start listening
  app.listen(PORT, () => {
    console.log(`
==========================================
🚀 IT Center API Server
==========================================
✅ Server running on http://localhost:${PORT}
📊 API: http://localhost:${PORT}/api
🔐 Auth: http://localhost:${PORT}/api/auth
💊 Health: http://localhost:${PORT}/api/health

Environment: ${process.env.NODE_ENV || 'development'}
MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/itcenter'}
==========================================
        `);
  });
};

startServer();

module.exports = app;
