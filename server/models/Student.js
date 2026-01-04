const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    birthDate: {
        type: Date
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    groupId: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['applied', 'active', 'frozen', 'graduated', 'rejected'],
        default: 'applied'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid', 'debt'],
        default: 'unpaid'
    },
    enrollDate: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: ''
    },
    // Email verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,

    // Password reset
    passwordResetCode: String,
    passwordResetExpires: Date,

    // Session tracking
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date
}, {
    timestamps: true
});

// Password hashing
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
studentSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification code
studentSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerificationCode = code;
    this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return code;
};

// Generate password reset code
studentSchema.methods.generatePasswordResetCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.passwordResetCode = code;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return code;
};

// Check if locked
studentSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

// Hide sensitive fields
studentSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.emailVerificationCode;
    delete obj.emailVerificationExpires;
    delete obj.passwordResetCode;
    delete obj.passwordResetExpires;
    delete obj.loginAttempts;
    delete obj.lockUntil;
    return obj;
};

// Virtual for age
studentSchema.virtual('age').get(function () {
    if (!this.birthDate) return null;
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
});

module.exports = mongoose.model('Student', studentSchema);
