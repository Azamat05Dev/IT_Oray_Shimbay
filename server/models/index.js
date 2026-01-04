const mongoose = require('mongoose');

// Course Schema
const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'kids'],
        default: 'beginner'
    },
    duration: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    monthlyOption: {
        type: Boolean,
        default: true
    },
    fullPaymentDiscount: {
        type: Number,
        default: 0
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

// Group Schema
const groupSchema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true,
        unique: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor'
    },
    schedule: String,
    room: String,
    capacity: {
        type: Number,
        default: 15
    },
    studentCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['recruiting', 'active', 'full', 'finished'],
        default: 'recruiting'
    }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);

// Mentor Schema
const mentorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    phone: String,
    telegram: String,
    email: String,
    avatar: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    groups: [String]
}, { timestamps: true });

const Mentor = mongoose.model('Mentor', mentorSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        enum: ['cash', 'payme', 'click', 'uzcard', 'humo', 'transfer'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'partial', 'refunded', 'failed'],
        default: 'completed'
    },
    note: String,
    receiptNumber: String
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

// Application Schema (Quick registration)
const applicationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    course: String,
    format: {
        type: String,
        enum: ['offline', 'online', 'hybrid'],
        default: 'offline'
    },
    note: String,
    status: {
        type: String,
        enum: ['new', 'called', 'waiting', 'enrolled', 'rejected'],
        default: 'new'
    },
    adminNote: String,
    callbackDate: Date
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    admin: String,
    target: String,
    details: String,
    ip: String,
    userAgent: String
}, { timestamps: true });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Video Lesson Schema
const videoLessonSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    youtubeId: String,
    duration: String,
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const VideoLesson = mongoose.model('VideoLesson', videoLessonSchema);

module.exports = {
    Course,
    Group,
    Mentor,
    Payment,
    Application,
    ActivityLog,
    VideoLesson
};
