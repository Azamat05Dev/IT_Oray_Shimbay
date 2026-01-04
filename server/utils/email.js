const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Email template wrapper
const emailTemplate = (title, content, gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f5;">
    <div style="max-width: 500px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: ${gradient}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎓 IT Center</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${title}</p>
        </div>
        <div style="padding: 30px;">
            ${content}
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} IT Center Portal. Barcha huquqlar himoyalangan.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Send verification email
const sendVerificationEmail = async (email, name, code) => {
    const transporter = createTransporter();

    const content = `
        <p style="font-size: 16px; color: #374151;">Salom ${name}! 👋</p>
        <p style="font-size: 14px; color: #6b7280;">Ro'yxatdan o'tish uchun tasdiqlash kodingiz:</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 10px;">${code}</span>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Bu kod 10 daqiqa ichida amal qiladi.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
            Agar siz bu so'rovni yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.
        </p>
    `;

    await transporter.sendMail({
        from: `"IT Center" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 IT Center - Tasdiqlash kodi',
        html: emailTemplate('Tasdiqlash kodi', content)
    });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, code) => {
    const transporter = createTransporter();

    const content = `
        <p style="font-size: 16px; color: #374151;">Salom ${name}! 👋</p>
        <p style="font-size: 14px; color: #6b7280;">Parolni tiklash uchun kod:</p>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 10px;">${code}</span>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Bu kod 10 daqiqa ichida amal qiladi.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
            Agar siz bu so'rovni yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring va parolingiz o'zgarmaydi.
        </p>
    `;

    await transporter.sendMail({
        from: `"IT Center" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔑 IT Center - Parolni tiklash',
        html: emailTemplate('Parolni tiklash', content, 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')
    });
};

// Send welcome email
const sendWelcomeEmail = async (email, name, courseName) => {
    const transporter = createTransporter();

    const content = `
        <p style="font-size: 16px; color: #374151;">Tabriklaymiz, ${name}! 🎉</p>
        <p style="font-size: 14px; color: #6b7280;">
            Siz IT Center portalida muvaffaqiyatli ro'yxatdan o'tdingiz!
        </p>
        <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 16px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px;">
                <strong>Tanlangan kurs:</strong> ${courseName || 'Hali tanlanmagan'}
            </p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
            Sizning arizangiz ko'rib chiqilmoqda. Tez orada siz bilan bog'lanamiz.
        </p>
        <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Kabinetga kirish →
            </a>
        </div>
    `;

    await transporter.sendMail({
        from: `"IT Center" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 IT Center - Xush kelibsiz!',
        html: emailTemplate('Xush kelibsiz!', content, 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)')
    });
};

// Send payment confirmation
const sendPaymentConfirmation = async (email, name, amount, method) => {
    const transporter = createTransporter();

    const formattedAmount = new Intl.NumberFormat('uz-UZ').format(amount);

    const content = `
        <p style="font-size: 16px; color: #374151;">Salom ${name}! 👋</p>
        <p style="font-size: 14px; color: #6b7280;">To'lovingiz muvaffaqiyatli qabul qilindi!</p>
        <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #166534; font-size: 14px;">
                <strong>Summa:</strong> ${formattedAmount} so'm
            </p>
            <p style="margin: 0; color: #166534; font-size: 14px;">
                <strong>To'lov usuli:</strong> ${method}
            </p>
        </div>
        <p style="font-size: 12px; color: #9ca3af;">
            Savollaringiz bo'lsa, bizga murojaat qiling.
        </p>
    `;

    await transporter.sendMail({
        from: `"IT Center" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '💰 IT Center - To\'lov tasdiqlandi',
        html: emailTemplate('To\'lov tasdiqlandi', content, 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)')
    });
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPaymentConfirmation
};
