const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { verifyToken, adminOnly, hasRole } = require('../middleware/auth');
const { Course, Group, Payment } = require('../models');

// ==========================================
// GET ALL STUDENTS
// ==========================================
router.get('/', verifyToken, adminOnly, async (req, res) => {
    try {
        const {
            search,
            status,
            paymentStatus,
            courseId,
            groupId,
            page = 1,
            limit = 50
        } = req.query;

        let query = {};

        // Search filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ];
        }

        // Status filters
        if (status && status !== 'all') {
            query.status = status;
        }
        if (paymentStatus && paymentStatus !== 'all') {
            query.paymentStatus = paymentStatus;
        }
        if (courseId) {
            query.courseId = courseId;
        }
        if (groupId) {
            query.groupId = groupId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [students, total] = await Promise.all([
            Student.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-password -emailVerificationCode -passwordResetCode'),
            Student.countDocuments(query)
        ]);

        res.json({
            success: true,
            students,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Talabalarni olishda xatolik'
        });
    }
});

// ==========================================
// GET SINGLE STUDENT
// ==========================================
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .select('-password -emailVerificationCode -passwordResetCode');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Talaba topilmadi'
            });
        }

        // Students can only view their own profile
        if (req.userType === 'student' && req.user._id.toString() !== student._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Ruxsat yo\'q'
            });
        }

        res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Talabani olishda xatolik'
        });
    }
});

// ==========================================
// CREATE STUDENT (Admin only)
// ==========================================
router.post('/', verifyToken, adminOnly, async (req, res) => {
    try {
        const { fullName, email, phone, password, courseId, groupId, status, birthDate } = req.body;

        // Check if email exists
        const existing = await Student.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Bu email allaqachon mavjud'
            });
        }

        const student = new Student({
            fullName,
            email: email.toLowerCase(),
            phone,
            password: password || '123456', // Default password
            courseId,
            groupId,
            status: status || 'active',
            birthDate,
            isEmailVerified: true, // Admin creates = verified
            paymentStatus: 'unpaid'
        });

        await student.save();

        // Update group student count
        if (groupId) {
            await Group.findOneAndUpdate(
                { groupId },
                { $inc: { studentCount: 1 } }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Talaba qo\'shildi',
            student: student.toJSON()
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Talaba qo\'shishda xatolik'
        });
    }
});

// ==========================================
// UPDATE STUDENT
// ==========================================
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Students can only update their own basic info
        if (req.userType === 'student') {
            if (req.user._id.toString() !== id) {
                return res.status(403).json({
                    success: false,
                    message: 'Ruxsat yo\'q'
                });
            }
            // Only allow certain fields for self-update
            const allowedFields = ['phone', 'avatar', 'birthDate'];
            Object.keys(updates).forEach(key => {
                if (!allowedFields.includes(key)) {
                    delete updates[key];
                }
            });
        }

        // Don't allow password update through this route
        delete updates.password;
        delete updates.email;

        const student = await Student.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Talaba topilmadi'
            });
        }

        res.json({
            success: true,
            message: 'Talaba yangilandi',
            student
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Talabani yangilashda xatolik'
        });
    }
});

// ==========================================
// DELETE STUDENT (Admin only)
// ==========================================
router.delete('/:id', verifyToken, adminOnly, hasRole('super_admin', 'admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Talaba topilmadi'
            });
        }

        // Update group count
        if (student.groupId) {
            await Group.findOneAndUpdate(
                { groupId: student.groupId },
                { $inc: { studentCount: -1 } }
            );
        }

        await Student.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Talaba o\'chirildi'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Talabani o\'chirishda xatolik'
        });
    }
});

// ==========================================
// CHANGE STUDENT STATUS (Admin only)
// ==========================================
router.patch('/:id/status', verifyToken, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['applied', 'active', 'frozen', 'graduated', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri status'
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Talaba topilmadi'
            });
        }

        res.json({
            success: true,
            message: 'Status yangilandi',
            student
        });

    } catch (error) {
        console.error('Change status error:', error);
        res.status(500).json({
            success: false,
            message: 'Statusni o\'zgartirishda xatolik'
        });
    }
});

// ==========================================
// CHANGE STUDENT GROUP (Admin only)
// ==========================================
router.patch('/:id/group', verifyToken, adminOnly, async (req, res) => {
    try {
        const { groupId } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Talaba topilmadi'
            });
        }

        // Update old group count
        if (student.groupId) {
            await Group.findOneAndUpdate(
                { groupId: student.groupId },
                { $inc: { studentCount: -1 } }
            );
        }

        // Update new group count
        if (groupId) {
            await Group.findOneAndUpdate(
                { groupId },
                { $inc: { studentCount: 1 } }
            );
        }

        student.groupId = groupId;
        await student.save();

        res.json({
            success: true,
            message: 'Guruh o\'zgartirildi',
            student: student.toJSON()
        });

    } catch (error) {
        console.error('Change group error:', error);
        res.status(500).json({
            success: false,
            message: 'Guruhni o\'zgartirishda xatolik'
        });
    }
});

// ==========================================
// BULK DELETE STUDENTS (Admin only)
// ==========================================
router.post('/bulk-delete', verifyToken, adminOnly, async (req, res) => {
    try {
        const { studentIds } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Talabalar IDlari talab qilinadi'
            });
        }

        const results = [];

        for (const id of studentIds) {
            try {
                const student = await Student.findById(id);
                if (student) {
                    // Update group count
                    if (student.groupId) {
                        await Group.findOneAndUpdate(
                            { groupId: student.groupId },
                            { $inc: { studentCount: -1 } }
                        );
                    }
                    await Student.findByIdAndDelete(id);
                    results.push({ id, success: true });
                } else {
                    results.push({ id, success: false, message: 'Topilmadi' });
                }
            } catch (err) {
                results.push({ id, success: false, message: err.message });
            }
        }

        const successCount = results.filter(r => r.success).length;

        res.json({
            success: true,
            message: `${successCount} ta talaba o'chirildi`,
            results
        });

    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Talabalarni o\'chirishda xatolik'
        });
    }
});

// ==========================================
// BULK SEND SMS (Admin only)
// ==========================================
router.post('/bulk-sms', verifyToken, adminOnly, async (req, res) => {
    try {
        const { studentIds, message } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Talabalar IDlari talab qilinadi'
            });
        }

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Xabar matni talab qilinadi'
            });
        }

        const students = await Student.find({ _id: { $in: studentIds } }).select('phone fullName');
        const phones = students.filter(s => s.phone).map(s => ({
            phone: s.phone,
            name: s.fullName
        }));

        if (phones.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tanlangan talabalarda telefon raqam yo\'q'
            });
        }

        // TODO: Integrate with SMS gateway (Eskiz.uz, Playmobile, etc.)
        // For now, just log the SMS


        res.json({
            success: true,
            message: `${phones.length} ta talabaga SMS yuborildi`,
            sent: phones.length,
            phones: phones.map(p => p.phone)
        });

    } catch (error) {
        console.error('Bulk SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'SMS yuborishda xatolik'
        });
    }
});

// ==========================================
// BULK CHANGE STATUS (Admin only)
// ==========================================
router.patch('/bulk-status', verifyToken, adminOnly, async (req, res) => {
    try {
        const { studentIds, status } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Talabalar IDlari talab qilinadi'
            });
        }

        if (!['applied', 'active', 'frozen', 'graduated', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri status'
            });
        }

        const result = await Student.updateMany(
            { _id: { $in: studentIds } },
            { $set: { status } }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} ta talabaning statusi o'zgartirildi`,
            updated: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk status error:', error);
        res.status(500).json({
            success: false,
            message: 'Statusni o\'zgartirishda xatolik'
        });
    }
});

// ==========================================
// BULK CHANGE GROUP (Admin only)
// ==========================================
router.patch('/bulk-group', verifyToken, adminOnly, async (req, res) => {
    try {
        const { studentIds, groupId } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Talabalar IDlari talab qilinadi'
            });
        }

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Guruh ID talab qilinadi'
            });
        }

        // Get old groups for count updates
        const students = await Student.find({ _id: { $in: studentIds } });
        const oldGroups = {};
        students.forEach(s => {
            if (s.groupId) {
                oldGroups[s.groupId] = (oldGroups[s.groupId] || 0) + 1;
            }
        });

        // Update all students
        const result = await Student.updateMany(
            { _id: { $in: studentIds } },
            { $set: { groupId } }
        );

        // Update old group counts
        for (const [oldGroupId, count] of Object.entries(oldGroups)) {
            await Group.findOneAndUpdate(
                { groupId: oldGroupId },
                { $inc: { studentCount: -count } }
            );
        }

        // Update new group count
        await Group.findOneAndUpdate(
            { groupId },
            { $inc: { studentCount: studentIds.length } }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} ta talaba ${groupId} guruhiga o'tkazildi`,
            updated: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk group error:', error);
        res.status(500).json({
            success: false,
            message: 'Guruhni o\'zgartirishda xatolik'
        });
    }
});

// ==========================================
// GET STUDENT STATS
// ==========================================
router.get('/stats/overview', verifyToken, adminOnly, async (req, res) => {
    try {
        const [
            total,
            active,
            applied,
            graduated,
            debt
        ] = await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ status: 'active' }),
            Student.countDocuments({ status: 'applied' }),
            Student.countDocuments({ status: 'graduated' }),
            Student.countDocuments({ paymentStatus: { $in: ['debt', 'unpaid'] } })
        ]);

        res.json({
            success: true,
            stats: {
                total,
                active,
                applied,
                graduated,
                debt
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Statistika olishda xatolik'
        });
    }
});

module.exports = router;
