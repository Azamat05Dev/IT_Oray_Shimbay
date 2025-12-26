// Authentication controller
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Generate OTP code
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Send OTP code
const sendCode = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Telefon raqami kiritilmagan' });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/\s/g, '');

        // Generate OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to database
        await pool.query(
            'INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3)',
            [cleanPhone, code, expiresAt]
        );

        // In production, send SMS here
        // For demo, log the code
        console.log(`📱 OTP for ${cleanPhone}: ${code}`);

        res.json({
            success: true,
            message: 'Kod yuborildi',
            // Only in development
            ...(process.env.NODE_ENV === 'development' && { code })
        });
    } catch (error) {
        console.error('Send code error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Verify OTP code
const verifyCode = async (req, res) => {
    try {
        const { phone, code, fullName } = req.body;

        if (!phone || !code) {
            return res.status(400).json({ error: 'Telefon va kod kiritilmagan' });
        }

        const cleanPhone = phone.replace(/\s/g, '');

        // Find valid OTP
        const otpResult = await pool.query(
            `SELECT * FROM otp_codes 
       WHERE phone = $1 AND code = $2 AND expires_at > NOW() AND is_used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
            [cleanPhone, code]
        );

        if (otpResult.rows.length === 0) {
            return res.status(400).json({ error: "Kod noto'g'ri yoki muddati o'tgan" });
        }

        // Mark OTP as used
        await pool.query(
            'UPDATE otp_codes SET is_used = TRUE WHERE id = $1',
            [otpResult.rows[0].id]
        );

        // Find or create user
        let userResult = await pool.query(
            'SELECT * FROM users WHERE phone = $1',
            [cleanPhone]
        );

        let user;

        if (userResult.rows.length === 0) {
            // Create new user
            if (!fullName) {
                return res.status(400).json({ error: "Ro'yxatdan o'tish uchun ism kerak" });
            }

            const newUser = await pool.query(
                `INSERT INTO users (full_name, phone, phone_verified) 
         VALUES ($1, $2, TRUE) 
         RETURNING id, full_name, phone, role`,
                [fullName, cleanPhone]
            );
            user = newUser.rows[0];
        } else {
            // Update existing user
            await pool.query(
                'UPDATE users SET phone_verified = TRUE, updated_at = NOW() WHERE id = $1',
                [userResult.rows[0].id]
            );
            user = userResult.rows[0];
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Muvaffaqiyatli kirish',
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            'SELECT id, full_name, phone, role, created_at FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                fullName: user.full_name,
                phone: user.phone,
                role: user.role,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(401).json({ error: 'Yaroqsiz token' });
    }
};

// Logout
const logout = async (req, res) => {
    // In stateless JWT, just tell client to remove token
    res.json({ success: true, message: 'Chiqish muvaffaqiyatli' });
};

module.exports = {
    sendCode,
    verifyCode,
    getCurrentUser,
    logout
};
