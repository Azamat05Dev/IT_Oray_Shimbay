// ToyBron API - Main Entry Point
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const venuesRoutes = require('./routes/venues');
const bookingsRoutes = require('./routes/bookings');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ToyBron API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', usersRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🎉 ToyBron API Server Started      ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                            ║
║  Mode: ${process.env.NODE_ENV || 'development'}                   ║
║  URL:  http://localhost:${PORT}           ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
