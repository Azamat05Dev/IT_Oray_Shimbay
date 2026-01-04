const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validatsiya xatosi',
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// User registration validation
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username 3-30 belgi bo\'lishi kerak')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username faqat harf, raqam va _ bo\'lishi mumkin'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email noto\'g\'ri formatda'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Parol kamida 6 belgi bo\'lishi kerak'),
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Ism 2-100 belgi bo\'lishi kerak'),
    handleValidationErrors
];

// Login validation
const loginValidation = [
    body('identifier')
        .trim()
        .notEmpty()
        .withMessage('Login kiritilmagan'),
    body('password')
        .notEmpty()
        .withMessage('Parol kiritilmagan'),
    handleValidationErrors
];

// Student registration validation
const studentRegisterValidation = [
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Ism 2-100 belgi bo\'lishi kerak'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email noto\'g\'ri formatda'),
    body('phone')
        .optional()
        .trim()
        .matches(/^\+998[0-9]{9}$/)
        .withMessage('Telefon +998XXXXXXXXX formatida bo\'lishi kerak'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Parol kamida 6 belgi bo\'lishi kerak'),
    body('courseId')
        .optional()
        .isMongoId()
        .withMessage('Noto\'g\'ri kurs ID'),
    handleValidationErrors
];

// Email validation
const emailValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email noto\'g\'ri formatda'),
    handleValidationErrors
];

// Code validation
const codeValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email noto\'g\'ri formatda'),
    body('code')
        .trim()
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Kod 6 xonali raqam bo\'lishi kerak'),
    handleValidationErrors
];

// Password reset validation
const passwordResetValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email noto\'g\'ri formatda'),
    body('code')
        .trim()
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Kod 6 xonali raqam bo\'lishi kerak'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Yangi parol kamida 6 belgi bo\'lishi kerak'),
    handleValidationErrors
];

// Payment validation
const paymentValidation = [
    body('studentId')
        .isMongoId()
        .withMessage('Noto\'g\'ri talaba ID'),
    body('amount')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Summa 0 dan katta bo\'lishi kerak'),
    body('method')
        .isIn(['cash', 'payme', 'click', 'uzcard', 'humo', 'transfer'])
        .withMessage('Noto\'g\'ri to\'lov usuli'),
    handleValidationErrors
];

// Sanitize input (XSS prevention)
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove potential XSS
                obj[key] = obj[key]
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) sanitize(req.body);
    next();
};

module.exports = {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    studentRegisterValidation,
    emailValidation,
    codeValidation,
    passwordResetValidation,
    paymentValidation,
    sanitizeInput
};
