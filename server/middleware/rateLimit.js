const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Juda ko\'p so\'rov. 15 daqiqadan keyin urinib ko\'ring.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth rate limiter (stricter for login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        success: false,
        message: 'Juda ko\'p urinish. 15 daqiqadan keyin urinib ko\'ring.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Email sending rate limiter
const emailLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 emails per minute
    message: {
        success: false,
        message: 'Email limitiga yetdingiz. 1 daqiqadan keyin urinib ko\'ring.'
    }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: {
        success: false,
        message: 'Juda ko\'p urinish. 1 soatdan keyin urinib ko\'ring.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    emailLimiter,
    passwordResetLimiter
};
