// Authentication middleware
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            'SELECT id, full_name, phone, role FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token muddati tugagan' });
        }
        return res.status(401).json({ error: 'Yaroqsiz token' });
    }
};

// Admin only middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Faqat admin uchun ruxsat' });
    }
    next();
};

// Venue owner middleware
const venueOwnerMiddleware = (req, res, next) => {
    if (req.user.role !== 'venue_owner' && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Faqat to'yxona egasi uchun ruxsat" });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    venueOwnerMiddleware
};
