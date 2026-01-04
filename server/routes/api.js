const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Course, Group, Mentor, Payment, Application, ActivityLog, VideoLesson } = require('../models');
const Student = require('../models/Student');
const { verifyToken, adminOnly, hasRole } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

// In-memory verification code storage (for demo mode)
const verificationCodes = new Map();

// Demo data for when MongoDB is not connected
const DEMO_DATA = {
    courses: [
        { _id: '1', name: 'Frontend Development', level: 'beginner', duration: '3 oy', price: 1500000, status: 'active' },
        { _id: '2', name: 'Backend Development', level: 'intermediate', duration: '4 oy', price: 2000000, status: 'active' },
        { _id: '3', name: 'Python Dasturlash', level: 'beginner', duration: '3 oy', price: 1200000, status: 'active' },
        { _id: '4', name: 'Mobile Development', level: 'advanced', duration: '5 oy', price: 2500000, status: 'active' },
        { _id: '5', name: 'Kids Coding', level: 'kids', duration: '2 oy', price: 800000, status: 'active' }
    ],
    groups: [],
    mentors: [
        { _id: '1', name: 'Azamat Qalmuratov', role: 'Senior Developer', rating: 5, status: 'active' }
    ]
};

// Check if MongoDB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// ==========================================
// EMAIL VERIFICATION (Send Code)
// ==========================================

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send verification code
router.post('/send-code', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email kiritilmadi' });
        }

        const code = generateCode();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store code in memory
        verificationCodes.set(email.toLowerCase(), { code, expiresAt, name });

        // Try to send email
        let emailSent = false;
        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                await sendVerificationEmail(email, name || 'Foydalanuvchi', code);
                emailSent = true;

            }
        } catch (emailError) {

        }

        // In demo mode or if email fails, return code in response
        const isDemoMode = !emailSent || process.env.NODE_ENV !== 'production';

        res.json({
            success: true,
            message: emailSent ? 'Tasdiqlash kodi yuborildi' : 'Demo: Kod quyida',
            demo: isDemoMode,
            code: isDemoMode ? code : undefined
        });

    } catch (error) {
        console.error('Send code error:', error);
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});

// Verify code
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email va kod kiritilishi shart' });
        }

        const stored = verificationCodes.get(email.toLowerCase());

        if (!stored) {
            return res.status(400).json({ success: false, message: 'Kod topilmadi. Qayta yuborib ko\'ring.' });
        }

        if (Date.now() > stored.expiresAt) {
            verificationCodes.delete(email.toLowerCase());
            return res.status(400).json({ success: false, message: 'Kod muddati tugagan' });
        }

        if (stored.code !== code) {
            return res.status(400).json({ success: false, message: 'Kod noto\'g\'ri' });
        }

        // Code verified, remove from storage
        verificationCodes.delete(email.toLowerCase());

        res.json({ success: true, message: 'Kod tasdiqlandi!' });

    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});

// ==========================================
// COURSES
// ==========================================


// Get all courses
router.get('/courses', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json({ success: true, courses: DEMO_DATA.courses, demo: true });
        }
        const courses = await Course.find({ status: 'active' }).sort({ name: 1 });
        res.json({ success: true, courses });
    } catch (error) {
        console.error('Courses error:', error);
        // Return demo data on error
        res.json({ success: true, courses: DEMO_DATA.courses, demo: true });
    }
});

// Create course
router.post('/courses', verifyToken, adminOnly, async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Kurs yaratishda xatolik' });
    }
});

// Update course
router.put('/courses/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!course) {
            return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
        }
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// Delete course
router.delete('/courses/:id', verifyToken, adminOnly, hasRole('super_admin'), async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Kurs o\'chirildi' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// ==========================================
// GROUPS
// ==========================================

// Get all groups (public for demo mode)
router.get('/groups', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json({ success: true, groups: DEMO_DATA.groups, demo: true });
        }
        const groups = await Group.find()
            .populate('courseId', 'name')
            .populate('mentorId', 'name')
            .sort({ groupId: 1 });
        res.json({ success: true, groups });
    } catch (error) {
        res.json({ success: true, groups: DEMO_DATA.groups, demo: true });
    }
});

// Get group with students
router.get('/groups/:id', verifyToken, async (req, res) => {
    try {
        const group = await Group.findOne({ groupId: req.params.id })
            .populate('courseId')
            .populate('mentorId');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const students = await Student.find({ groupId: req.params.id })
            .select('-password');

        res.json({ success: true, group, students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// Create group
router.post('/groups', verifyToken, adminOnly, async (req, res) => {
    try {
        const { groupId, courseId, mentorId, schedule, room, capacity } = req.body;

        const existing = await Group.findOne({ groupId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Bu guruh ID allaqachon mavjud'
            });
        }

        const group = await Group.create({
            groupId,
            courseId,
            mentorId,
            schedule,
            room,
            capacity: capacity || 15,
            studentCount: 0,
            status: 'recruiting'
        });

        res.status(201).json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Guruh yaratishda xatolik' });
    }
});

// Update group
router.put('/groups/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        const group = await Group.findOneAndUpdate(
            { groupId: req.params.id },
            req.body,
            { new: true }
        );
        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// Delete group
router.delete('/groups/:id', verifyToken, adminOnly, hasRole('super_admin', 'admin'), async (req, res) => {
    try {
        const studentsInGroup = await Student.countDocuments({ groupId: req.params.id });
        if (studentsInGroup > 0) {
            return res.status(400).json({
                success: false,
                message: `Guruhda ${studentsInGroup} ta talaba bor. Avval ularni ko'chiring.`
            });
        }
        await Group.findOneAndDelete({ groupId: req.params.id });
        res.json({ success: true, message: 'Guruh o\'chirildi' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// ==========================================
// MENTORS
// ==========================================

router.get('/mentors', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json({ success: true, mentors: DEMO_DATA.mentors, demo: true });
        }
        const mentors = await Mentor.find({ status: 'active' }).sort({ name: 1 });
        res.json({ success: true, mentors });
    } catch (error) {
        res.json({ success: true, mentors: DEMO_DATA.mentors, demo: true });
    }
});

router.post('/mentors', verifyToken, adminOnly, async (req, res) => {
    try {
        const mentor = await Mentor.create(req.body);
        res.status(201).json({ success: true, mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Mentor qo\'shishda xatolik' });
    }
});

router.put('/mentors/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

router.delete('/mentors/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        await Mentor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Mentor o\'chirildi' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// ==========================================
// PAYMENTS
// ==========================================

router.get('/payments', verifyToken, adminOnly, async (req, res) => {
    try {
        const { studentId, status, startDate, endDate, page = 1, limit = 50 } = req.query;

        let query = {};
        if (studentId) query.studentId = studentId;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('studentId', 'fullName email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Payment.countDocuments(query)
        ]);

        // Calculate totals
        const totalAmount = await Payment.aggregate([
            { $match: { ...query, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            success: true,
            payments,
            totalAmount: totalAmount[0]?.total || 0,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Payments error:', error);
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

router.post('/payments', verifyToken, adminOnly, async (req, res) => {
    try {
        const { studentId, amount, method, note } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Talaba topilmadi' });
        }

        const payment = await Payment.create({
            studentId,
            amount,
            method,
            note,
            status: 'completed',
            date: new Date()
        });

        // Update student payment status based on course price
        // This is simplified - in production, calculate based on total paid
        student.paymentStatus = 'paid';
        await student.save();

        res.status(201).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'To\'lov qo\'shishda xatolik' });
    }
});

router.get('/payments/stats', verifyToken, adminOnly, async (req, res) => {
    try {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [thisMonthTotal, lastMonthTotal, totalEver] = await Promise.all([
            Payment.aggregate([
                { $match: { date: { $gte: thisMonth }, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $match: { date: { $gte: lastMonth, $lt: thisMonth }, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            success: true,
            stats: {
                thisMonth: thisMonthTotal[0]?.total || 0,
                lastMonth: lastMonthTotal[0]?.total || 0,
                total: totalEver[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// ==========================================
// APPLICATIONS (Quick registrations)
// ==========================================

router.get('/applications', verifyToken, adminOnly, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;

        const applications = await Application.find(query).sort({ createdAt: -1 });
        res.json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

router.post('/applications', async (req, res) => {
    try {
        const application = await Application.create({
            ...req.body,
            status: 'new'
        });
        res.status(201).json({ success: true, application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ariza yuborishda xatolik' });
    }
});

router.patch('/applications/:id/status', verifyToken, adminOnly, async (req, res) => {
    try {
        const { status, adminNote, callbackDate } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status, adminNote, callbackDate },
            { new: true }
        );
        res.json({ success: true, application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// Convert application to student
router.post('/applications/:id/enroll', verifyToken, adminOnly, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Ariza topilmadi' });
        }

        const { courseId, groupId, password } = req.body;

        // Create student from application
        const student = await Student.create({
            fullName: application.fullName,
            phone: application.phone,
            email: `${application.phone.replace(/\D/g, '')}@temp.itcenter.uz`,
            password: password || '123456',
            courseId,
            groupId,
            status: 'active',
            paymentStatus: 'unpaid',
            isEmailVerified: true
        });

        // Update application status
        application.status = 'enrolled';
        await application.save();

        // Update group count
        if (groupId) {
            await Group.findOneAndUpdate(
                { groupId },
                { $inc: { studentCount: 1 } }
            );
        }

        res.json({ success: true, student });
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// ==========================================
// VIDEO LESSONS
// ==========================================

router.get('/videos', async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = {};
        if (courseId) query.courseId = courseId;

        const videos = await VideoLesson.find(query)
            .populate('courseId', 'name')
            .sort({ order: 1 });
        res.json({ success: true, videos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

router.post('/videos', verifyToken, adminOnly, async (req, res) => {
    try {
        const video = await VideoLesson.create(req.body);
        res.status(201).json({ success: true, video });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

router.delete('/videos/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        await VideoLesson.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Video o\'chirildi' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// ==========================================
// ACTIVITY LOGS
// ==========================================

router.get('/logs', verifyToken, adminOnly, hasRole('super_admin'), async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

router.post('/logs', verifyToken, async (req, res) => {
    try {
        const log = await ActivityLog.create({
            ...req.body,
            admin: req.user.fullName || req.user.username
        });
        res.status(201).json({ success: true, log });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

// ==========================================
// DASHBOARD STATS
// ==========================================

router.get('/dashboard/stats', verifyToken, adminOnly, async (req, res) => {
    try {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalStudents,
            activeStudents,
            activeGroups,
            totalCourses,
            totalMentors,
            newApplications,
            debtStudents,
            monthlyPayments
        ] = await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ status: 'active' }),
            Group.countDocuments({ status: { $in: ['active', 'recruiting'] } }),
            Course.countDocuments({ status: 'active' }),
            Mentor.countDocuments({ status: 'active' }),
            Application.countDocuments({ status: 'new' }),
            Student.countDocuments({ paymentStatus: { $in: ['debt', 'unpaid'] } }),
            Payment.aggregate([
                { $match: { date: { $gte: thisMonth }, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeStudents,
                activeGroups,
                totalCourses,
                totalMentors,
                newApplications,
                debtStudents,
                monthlyPayments: monthlyPayments[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Xatolik' });
    }
});

module.exports = router;
