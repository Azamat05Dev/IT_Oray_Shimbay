const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const { generateTokens, verifyToken } = require('../middleware/auth');
const { authLimiter, emailLimiter, passwordResetLimiter } = require('../middleware/rateLimit');
const {
    loginValidation,
    studentRegisterValidation,
    emailValidation,
    codeValidation,
    passwordResetValidation
} = require('../middleware/validation');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// ==========================================
// STUDENT AUTHENTICATION
// ==========================================

// Register new student
router.post('/register', authLimiter, studentRegisterValidation, async (req, res) => {
    try {
        const { fullName, email, phone, password, courseId, birthDate } = req.body;

        // Check if email already exists
        const existingStudent = await Student.findOne({ email: email.toLowerCase() });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
            });
        }

        // Create student
        const student = new Student({
            fullName,
            email: email.toLowerCase(),
            phone,
            password,
            courseId,
            birthDate,
            status: 'applied',
            paymentStatus: 'unpaid'
        });

        // Generate verification code
        const verificationCode = student.generateVerificationCode();

        await student.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, fullName, verificationCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Still return success, code is saved
        }

        res.status(201).json({
            success: true,
            message: 'Ro\'yxatdan o\'tdingiz! Email ga tasdiqlash kodi yuborildi.',
            studentId: student._id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Ro\'yxatdan o\'tishda xatolik yuz berdi'
        });
    }
});

// Verify email
router.post('/verify-email', authLimiter, codeValidation, async (req, res) => {
    try {
        const { email, code } = req.body;

        const student = await Student.findOne({
            email: email.toLowerCase(),
            emailVerificationCode: code,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!student) {
            return res.status(400).json({
                success: false,
                message: 'Kod noto\'g\'ri yoki muddati tugagan'
            });
        }

        // Mark as verified
        student.isEmailVerified = true;
        student.emailVerificationCode = undefined;
        student.emailVerificationExpires = undefined;
        await student.save();

        // Generate tokens
        const tokens = generateTokens(student, 'student');

        res.json({
            success: true,
            message: 'Email tasdiqlandi!',
            ...tokens,
            student: student.toJSON()
        });

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Tasdiqlashda xatolik'
        });
    }
});

// Resend verification code
router.post('/resend-code', emailLimiter, emailValidation, async (req, res) => {
    try {
        const { email } = req.body;

        const student = await Student.findOne({ email: email.toLowerCase() });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Bu email topilmadi'
            });
        }

        if (student.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email allaqachon tasdiqlangan'
            });
        }

        // Generate new code
        const code = student.generateVerificationCode();
        await student.save();

        // Send email
        await sendVerificationEmail(email, student.fullName, code);

        res.json({
            success: true,
            message: 'Yangi kod yuborildi'
        });

    } catch (error) {
        console.error('Resend code error:', error);
        res.status(500).json({
            success: false,
            message: 'Kod yuborishda xatolik'
        });
    }
});

// Student login
router.post('/student/login', authLimiter, loginValidation, async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const normalizedId = identifier.toLowerCase().trim();

        // Find by email or phone
        const student = await Student.findOne({
            $or: [
                { email: normalizedId },
                { phone: { $regex: normalizedId.replace(/\D/g, '').slice(-9) } }
            ]
        });

        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Email/telefon yoki parol noto\'g\'ri'
            });
        }

        // Check if locked
        if (student.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Akkaunt vaqtincha bloklangan. Keyinroq urinib ko\'ring.'
            });
        }

        // Verify password
        const isMatch = await student.comparePassword(password);

        if (!isMatch) {
            // Increment login attempts
            student.loginAttempts = (student.loginAttempts || 0) + 1;
            if (student.loginAttempts >= 5) {
                student.lockUntil = Date.now() + 15 * 60 * 1000;
            }
            await student.save();

            return res.status(401).json({
                success: false,
                message: 'Email/telefon yoki parol noto\'g\'ri'
            });
        }

        // Reset login attempts
        student.loginAttempts = 0;
        student.lockUntil = undefined;
        student.lastLogin = new Date();
        await student.save();

        // Generate tokens
        const tokens = generateTokens(student, 'student');

        res.json({
            success: true,
            message: 'Muvaffaqiyatli kirdingiz!',
            ...tokens,
            student: student.toJSON()
        });

    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({
            success: false,
            message: 'Kirishda xatolik'
        });
    }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// Admin login
router.post('/admin/login', authLimiter, loginValidation, async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const normalizedId = identifier.toLowerCase().trim();

        // Find admin by username or email
        const admin = await User.findOne({
            $or: [
                { username: normalizedId },
                { email: normalizedId }
            ]
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Login yoki parol noto\'g\'ri'
            });
        }

        // Check if locked
        if (admin.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Akkaunt vaqtincha bloklangan. 15 daqiqadan keyin urinib ko\'ring.'
            });
        }

        // Check status
        if (admin.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Akkaunt faol emas'
            });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            await admin.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Login yoki parol noto\'g\'ri'
            });
        }

        // Reset login attempts
        await admin.resetLoginAttempts();

        // Generate tokens
        const tokens = generateTokens(admin, 'admin');

        res.json({
            success: true,
            message: 'Admin panelga xush kelibsiz!',
            ...tokens,
            admin: admin.toJSON()
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Kirishda xatolik'
        });
    }
});

// ==========================================
// PASSWORD RESET
// ==========================================

// Request password reset
router.post('/forgot-password', passwordResetLimiter, emailValidation, async (req, res) => {
    try {
        const { email } = req.body;

        // Check students first, then admins
        let user = await Student.findOne({ email: email.toLowerCase() });
        let userType = 'student';

        if (!user) {
            user = await User.findOne({ email: email.toLowerCase() });
            userType = 'admin';
        }

        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'Agar email mavjud bo\'lsa, kod yuborildi'
            });
        }

        // Generate reset code
        const code = user.generatePasswordResetCode();
        await user.save();

        // Send email
        await sendPasswordResetEmail(email, user.fullName || user.username, code);

        res.json({
            success: true,
            message: 'Parolni tiklash kodi yuborildi'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Xatolik yuz berdi'
        });
    }
});

// Verify reset code
router.post('/verify-reset-code', authLimiter, codeValidation, async (req, res) => {
    try {
        const { email, code } = req.body;

        // Check students first
        let user = await Student.findOne({
            email: email.toLowerCase(),
            passwordResetCode: code,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            user = await User.findOne({
                email: email.toLowerCase(),
                passwordResetCode: code,
                passwordResetExpires: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Kod noto\'g\'ri yoki muddati tugagan'
            });
        }

        res.json({
            success: true,
            message: 'Kod tasdiqlandi. Yangi parol kiriting.'
        });

    } catch (error) {
        console.error('Verify reset code error:', error);
        res.status(500).json({
            success: false,
            message: 'Xatolik'
        });
    }
});

// Reset password
router.post('/reset-password', authLimiter, passwordResetValidation, async (req, res) => {
    try {
        const { email, code, password } = req.body;

        // Find user with valid code
        let user = await Student.findOne({
            email: email.toLowerCase(),
            passwordResetCode: code,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            user = await User.findOne({
                email: email.toLowerCase(),
                passwordResetCode: code,
                passwordResetExpires: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Kod noto\'g\'ri yoki muddati tugagan'
            });
        }

        // Update password
        user.password = password;
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Parol muvaffaqiyatli yangilandi!'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Parolni yangilashda xatolik'
        });
    }
});

// ==========================================
// TOKEN VERIFICATION
// ==========================================

// Verify token
router.get('/verify-token', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: req.user.toJSON(),
        type: req.userType
    });
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token kerak'
            });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

        let user;
        if (decoded.type === 'admin') {
            user = await User.findById(decoded.id);
        } else {
            user = await Student.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        const tokens = generateTokens(user, decoded.type);

        res.json({
            success: true,
            ...tokens
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token yaroqsiz'
        });
    }
});

// Logout (just for logging)
router.post('/logout', verifyToken, async (req, res) => {
    // In a real app, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Muvaffaqiyatli chiqdingiz'
    });
});

module.exports = router;
