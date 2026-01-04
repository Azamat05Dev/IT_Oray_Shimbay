const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token topilmadi. Iltimos, tizimga kiring.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        let user;
        if (decoded.type === 'admin') {
            user = await User.findById(decoded.id);
        } else if (decoded.type === 'student') {
            user = await Student.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        if (user.status === 'blocked' || user.status === 'inactive') {
            return res.status(403).json({
                success: false,
                message: 'Akkaunt bloklangan yoki faol emas'
            });
        }

        req.user = user;
        req.userType = decoded.type;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token muddati tugagan. Qayta kiring.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Noto\'g\'ri token'
        });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Faqat admin uchun ruxsat'
        });
    }
    next();
};

// Super admin only
const superAdminOnly = (req, res, next) => {
    if (req.userType !== 'admin' || req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Faqat super admin uchun ruxsat'
        });
    }
    next();
};

// Check specific roles
const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bu amal uchun ruxsat yo\'q'
            });
        }
        next();
    };
};

// Generate tokens
const generateTokens = (user, type = 'admin') => {
    const accessToken = jwt.sign(
        { id: user._id, type },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
        { id: user._id, type },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

module.exports = {
    verifyToken,
    adminOnly,
    superAdminOnly,
    hasRole,
    generateTokens
};
