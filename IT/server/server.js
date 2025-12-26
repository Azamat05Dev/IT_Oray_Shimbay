const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store verification codes temporarily (in production use Redis/DB)
const verificationCodes = new Map();

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'qalmuratovazamat14@gmail.com',
        pass: 'ptkv arcx hjws usvd'  // App Password
    }
});

// Generate 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// API ENDPOINTS
// ============================================

// Send verification code
app.post('/api/send-code', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email kiritilmagan' });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code
    verificationCodes.set(email, { code, expiresAt, name });

    // Email template
    const mailOptions = {
        from: '"IT Center" <qalmuratovazamat14@gmail.com>',
        to: email,
        subject: '🔐 IT Center - Tasdiqlash kodi',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🎓 IT Center</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Salom ${name || 'Foydalanuvchi'}! 👋</p>
          <p style="font-size: 14px; color: #666;">Ro'yxatdan o'tish uchun tasdiqlash kodingiz:</p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #999;">Bu kod 10 daqiqa ichida amal qiladi.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            Agar siz bu so'rovni yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.
          </p>
        </div>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Code sent to ${email}: ${code}`);
        res.json({ success: true, message: 'Kod yuborildi', demo: false });
    } catch (error) {
        console.error('❌ Email error:', error);
        res.json({ success: false, message: 'Email yuborishda xatolik: ' + error.message });
    }
});

// Verify code
app.post('/api/verify-code', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.json({ success: false, message: 'Email va kod kiritilmagan' });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
        return res.json({ success: false, message: 'Kod topilmadi. Qayta yuboring.' });
    }

    if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(email);
        return res.json({ success: false, message: 'Kod muddati tugagan. Qayta yuboring.' });
    }

    if (stored.code !== code) {
        return res.json({ success: false, message: 'Kod noto\'g\'ri' });
    }

    // Code is valid - remove it
    verificationCodes.delete(email);
    console.log(`✅ Code verified for ${email}`);
    res.json({ success: true, message: 'Tasdiqlandi!' });
});

// Forgot password - send reset code
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email kiritilmagan' });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    verificationCodes.set(`reset_${email}`, { code, expiresAt });

    const mailOptions = {
        from: '"IT Center" <qalmuratovazamat14@gmail.com>',
        to: email,
        subject: '🔑 IT Center - Parolni tiklash',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🔑 Parolni Tiklash</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 14px; color: #666;">Parolni tiklash uchun kod:</p>
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #999;">Bu kod 10 daqiqa ichida amal qiladi.</p>
        </div>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Reset code sent to ${email}: ${code}`);
        res.json({ success: true, message: 'Kod yuborildi' });
    } catch (error) {
        console.error('❌ Email error:', error);
        res.json({ success: false, message: 'Email yuborishda xatolik' });
    }
});

// Reset password
app.post('/api/reset-password', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.json({ success: false, message: 'Ma\'lumotlar to\'liq emas' });
    }

    const stored = verificationCodes.get(`reset_${email}`);

    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
        return res.json({ success: false, message: 'Kod noto\'g\'ri yoki muddati tugagan' });
    }

    verificationCodes.delete(`reset_${email}`);
    res.json({ success: true, message: 'Tasdiqlandi!' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`
  ==========================================
  🚀 IT Center Email Server
  ==========================================
  ✅ Server running on http://localhost:${PORT}
  📧 Gmail: qalmuratovazamat14@gmail.com
  
  API Endpoints:
  - POST /api/send-code     (email, name)
  - POST /api/verify-code   (email, code)
  - POST /api/forgot-password (email)
  - POST /api/reset-password  (email, code)
  - GET  /api/health
  ==========================================
  `);
});
