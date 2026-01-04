const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files settings
app.use(express.static(path.join(__dirname, './')));

// Fallback for SPA (if needed) or main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Basic API placeholder
app.get('/api/status', (req, res) => {
    res.json({ success: true, message: 'Server is running', version: '1.0.0' });
});

// Admin API placeholder
app.post('/api/auth/login', (req, res) => {
    // Future implementation for server-side auth
    res.status(501).json({ success: false, message: 'Not implemented yet. Using client-side simulation.' });
});

// Error handling
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
