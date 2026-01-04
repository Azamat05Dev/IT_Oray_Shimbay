/**
 * IT Center Portal - Shared Database Layer
 * LocalStorage asosidagi umumiy ma'lumotlar bazasi
 * Admin panel va asosiy sahifa bir xil data ishlatadi
 */

const ITCenterDB = (function () {
    const STORAGE_KEY = "itcenter_db";

    // Default seed data
    const DEFAULT_DATA = {
        adminUsers: [
            // Admin users will be created via backend API
        ],
        loginHistory: [],
        mentors: [
            // Mentors will be added by admin
        ],
        courses: [
            { id: 1, name: "Web dasturlash (Frontend)", level: "beginner", duration: "4 oy", price: 1200000, discountPercent: 10, monthlyOption: true, fullPaymentDiscount: 5, description: "HTML, CSS, JavaScript, React", status: "active" },
            { id: 2, name: "Python dasturlash asoslari", level: "beginner", duration: "3 oy", price: 1000000, discountPercent: 0, monthlyOption: true, fullPaymentDiscount: 10, description: "Algoritmlar, botlar, backend", status: "active" },
            { id: 3, name: "Bolalar uchun IT (9-14 yosh)", level: "kids", duration: "2 oy", price: 900000, discountPercent: 15, monthlyOption: true, fullPaymentDiscount: 5, description: "Scratch, o'yinlar, robototexnika", status: "active" },
            { id: 4, name: "UI/UX Dizayn", level: "intermediate", duration: "3 oy", price: 1100000, discountPercent: 5, monthlyOption: true, fullPaymentDiscount: 8, description: "Figma, UX research, Design systems", status: "active" },
            { id: 5, name: "Mobile Development", level: "intermediate", duration: "4 oy", price: 1300000, discountPercent: 0, monthlyOption: true, fullPaymentDiscount: 10, description: "Flutter, Dart, iOS/Android", status: "active" }
        ],
        students: [
            // Students will register through the portal
        ],
        groups: [
            // Groups will be created by admin
        ],
        payments: [
            // Payments will be recorded by admin
        ],
        applications: [
            // Applications come from website form
        ],
        attendance: [],
        settings: {
            // Portal
            portalName: "Shımbay IT O'quv Orayı",
            portalDescription: "Shımbay rayonındagı zamonaviy IT ta'lim ortalıgı",
            contactPhone: "+998 XX XXX XX XX",
            contactEmail: "info@it-oray.uz",
            contactAddress: "Shımbay rayonı",
            socialTelegram: "",
            socialInstagram: "",
            socialYoutube: "",

            // Appearance
            defaultTheme: "dark",
            primaryColor: "#3b82f6",
            accentColor: "#8b5cf6",

            // Localization
            language: "uz",
            dateFormat: "DD.MM.YYYY",
            currencySymbol: "so'm",
            timezone: "Asia/Tashkent",

            // Security
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireStrongPassword: true,

            // Notifications
            notifyOnNewApplication: true,
            notifyOnPayment: true,
            notifyOnNewGroup: true,
            emailNotifications: true,
            smsNotifications: false,

            // Integrations
            paymeEnabled: false,
            paymeMerchantId: "",
            paymeSecretKey: "",
            clickEnabled: false,
            clickMerchantId: "",
            clickSecretKey: "",
            smsGateway: "eskiz",
            smsApiKey: "",
            smtpHost: "",
            smtpPort: 587,
            smtpUser: "",
            smtpPassword: "",

            // Data
            autoBackup: true,
            backupFrequency: "weekly",

            // System
            version: "2.1.0",
            lastBackupDate: "",
            createdAt: Date.now(),
            lastUpdated: Date.now()
        },
        activityLogs: [],
        videoLessons: [
            // Frontend (courseId: 1)
            { id: 1, courseId: 1, title: "HTML asoslari - Kirish", youtubeId: "qz0aGYrrlhU", duration: "1:08:57", order: 1 },
            { id: 2, courseId: 1, title: "CSS asoslari - Styling", youtubeId: "1Rs2ND1ryYc", duration: "11:29:15", order: 2 },
            { id: 3, courseId: 1, title: "JavaScript to'liq kurs", youtubeId: "PkZNo7MFNFg", duration: "3:26:42", order: 3 },
            { id: 4, courseId: 1, title: "JavaScript DOM manipulation", youtubeId: "5fb2aPlgoys", duration: "1:00:00", order: 4 },
            { id: 5, courseId: 1, title: "React JS to'liq kurs", youtubeId: "bMknfKXIFA8", duration: "11:55:04", order: 5 },
            { id: 6, courseId: 1, title: "React Hooks Tutorial", youtubeId: "O6P86uwfdR0", duration: "1:28:24", order: 6 },
            // Python (courseId: 2)
            { id: 7, courseId: 2, title: "Python asoslari - Kirish", youtubeId: "rfscVS0vtbw", duration: "4:26:52", order: 1 },
            { id: 8, courseId: 2, title: "Python OOP - Classes", youtubeId: "JeznW_7DlB0", duration: "1:00:12", order: 2 },
            { id: 9, courseId: 2, title: "Python Django Framework", youtubeId: "F5mRW0jo-U4", duration: "3:45:00", order: 3 },
            { id: 10, courseId: 2, title: "Python Data Structures", youtubeId: "pkYVOmU3MgA", duration: "12:30:00", order: 4 },
            { id: 11, courseId: 2, title: "Python Telegram Bot", youtubeId: "vZtm1wuA2yc", duration: "2:33:00", order: 5 },
            // Kids IT (courseId: 3)
            { id: 12, courseId: 3, title: "Scratch - Birinchi o'yin", youtubeId: "VIpmkeqJhmQ", duration: "45:00", order: 1 },
            { id: 13, courseId: 3, title: "Scratch Animation", youtubeId: "5N4_K9lZ4ng", duration: "30:00", order: 2 },
            { id: 14, courseId: 3, title: "Scratch - O'yin yaratish", youtubeId: "OfeXz716guw", duration: "1:15:00", order: 3 },
            { id: 15, courseId: 3, title: "Bolalar uchun Coding", youtubeId: "kL6pVCa-7M0", duration: "55:00", order: 4 },
            // UI/UX Design (courseId: 4)
            { id: 16, courseId: 4, title: "Figma Tutorial - Kirish", youtubeId: "FTFaQWZBqQ8", duration: "2:30:00", order: 1 },
            { id: 17, courseId: 4, title: "UI Design Fundamentals", youtubeId: "tRpoI6vkqLs", duration: "2:00:00", order: 2 },
            { id: 18, courseId: 4, title: "UX Research Methods", youtubeId: "v6n1i0qojws", duration: "1:45:00", order: 3 },
            { id: 19, courseId: 4, title: "Design Systems", youtubeId: "Dtd40cHQQlk", duration: "1:30:00", order: 4 },
            { id: 20, courseId: 4, title: "Mobile App Design", youtubeId: "UuBtp2JqPNo", duration: "2:15:00", order: 5 },
            // Mobile Development (courseId: 5)
            { id: 21, courseId: 5, title: "Flutter to'liq kurs", youtubeId: "VPvVD8t02U8", duration: "37:30:00", order: 1 },
            { id: 22, courseId: 5, title: "Dart Programming", youtubeId: "Ej_Pcr4uC2Q", duration: "3:45:00", order: 2 },
            { id: 23, courseId: 5, title: "Flutter Widgets", youtubeId: "x0uinJvhNxI", duration: "2:00:00", order: 3 },
            { id: 24, courseId: 5, title: "Flutter Firebase", youtubeId: "sfA3NWDBPZ4", duration: "4:00:00", order: 4 },
            { id: 25, courseId: 5, title: "Flutter State Management", youtubeId: "3tm-R7ymwhc", duration: "2:30:00", order: 5 }
        ]
    };

    // Load data from LocalStorage or use defaults
    const DB_VERSION = 6; // v6 = reverted to plain text passwords

    function loadData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Check if old data (no passwords on students)
                if (!parsed._dbVersion || parsed._dbVersion < DB_VERSION) {

                    const newData = JSON.parse(JSON.stringify(DEFAULT_DATA));
                    newData._dbVersion = DB_VERSION;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
                    return newData;
                }
                return parsed;
            }
        } catch (e) {
            console.error("DB load error:", e);
        }
        const newData = JSON.parse(JSON.stringify(DEFAULT_DATA));
        newData._dbVersion = DB_VERSION;
        return newData;
    }

    // Save data to LocalStorage
    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            // Update timestamp for polling-based sync
            localStorage.setItem(STORAGE_KEY + "_lastupdate", Date.now().toString());
            // Dispatch event for other tabs/windows
            window.dispatchEvent(new CustomEvent("itcenter-db-update", { detail: data }));
        } catch (e) {
            console.error("DB save error:", e);
        }
    }

    // Get next ID for a collection
    function getNextId(collection) {
        if (!collection || collection.length === 0) return 1;
        const maxId = Math.max(...collection.map(item => typeof item.id === 'number' ? item.id : 0));
        return maxId + 1;
    }

    // Initialize data
    let data = loadData();

    // CRUD helpers
    function createCRUD(collectionName) {
        return {
            getAll: () => data[collectionName] || [],
            getById: (id) => (data[collectionName] || []).find(item => item.id === id),
            add: (item) => {
                if (!data[collectionName]) data[collectionName] = [];
                const newItem = { ...item, id: getNextId(data[collectionName]) };
                data[collectionName].push(newItem);
                saveData(data);
                return newItem;
            },
            update: (id, updates) => {
                const index = (data[collectionName] || []).findIndex(item => item.id === id);
                if (index !== -1) {
                    data[collectionName][index] = { ...data[collectionName][index], ...updates };
                    saveData(data);
                    return data[collectionName][index];
                }
                return null;
            },
            delete: (id) => {
                const index = (data[collectionName] || []).findIndex(item => item.id === id);
                if (index !== -1) {
                    data[collectionName].splice(index, 1);
                    saveData(data);
                    return true;
                }
                return false;
            }
        };
    }

    // Public API
    return {
        adminUsers: createCRUD("adminUsers"),
        mentors: createCRUD("mentors"),
        courses: createCRUD("courses"),
        students: createCRUD("students"),
        videoLessons: {
            ...createCRUD("videoLessons"),
            getByCourse: (courseId) => {
                // Reload fresh data from localStorage for real-time sync
                const freshData = loadData();
                return (freshData.videoLessons || []).filter(v => v.courseId === courseId).sort((a, b) => a.order - b.order);
            },
            getAll: () => {
                // Reload fresh data from localStorage
                const freshData = loadData();
                return freshData.videoLessons || [];
            }
        },
        groups: {
            getAll: () => data.groups || [],
            getById: (id) => (data.groups || []).find(g => g.id === id),
            add: (group) => {
                if (!data.groups) data.groups = [];
                data.groups.push(group);
                saveData(data);
                return group;
            },
            update: (id, updates) => {
                const index = (data.groups || []).findIndex(g => g.id === id);
                if (index !== -1) {
                    data.groups[index] = { ...data.groups[index], ...updates };
                    saveData(data);
                    return data.groups[index];
                }
                return null;
            },
            delete: (id) => {
                const index = (data.groups || []).findIndex(g => g.id === id);
                if (index !== -1) {
                    data.groups.splice(index, 1);
                    saveData(data);
                    return true;
                }
                return false;
            }
        },
        payments: createCRUD("payments"),
        applications: {
            ...createCRUD("applications"),
            updateStatus: (id, status) => {
                const index = (data.applications || []).findIndex(a => a.id === id);
                if (index !== -1) {
                    data.applications[index].status = status;
                    saveData(data);
                    return data.applications[index];
                }
                return null;
            }
        },
        attendance: {
            getAll: () => data.attendance || [],
            getTodayByGroup: (groupId) => {
                const today = new Date().toISOString().split('T')[0];
                return (data.attendance || []).find(a => a.groupId === groupId && a.date === today);
            },
            getToday: () => {
                const today = new Date().toISOString().split('T')[0];
                return (data.attendance || []).filter(a => a.date === today);
            },
            markAttendance: (groupId, presentStudents, totalStudents) => {
                if (!data.attendance) data.attendance = [];
                const today = new Date().toISOString().split('T')[0];
                const percentage = Math.round((presentStudents / totalStudents) * 100);

                // Check if already exists for today
                const existingIndex = data.attendance.findIndex(a => a.groupId === groupId && a.date === today);

                const record = {
                    id: existingIndex >= 0 ? data.attendance[existingIndex].id : getNextId(data.attendance),
                    groupId,
                    date: today,
                    presentStudents,
                    totalStudents,
                    percentage,
                    timestamp: Date.now()
                };

                if (existingIndex >= 0) {
                    data.attendance[existingIndex] = record;
                } else {
                    data.attendance.push(record);
                }

                saveData(data);
                return record;
            }
        },
        settings: {
            get: () => data.settings || {},
            update: (updates) => {
                data.settings = { ...data.settings, ...updates };
                saveData(data);
                return data.settings;
            }
        },
        // Activity logs
        logs: {
            getAll: () => (data.activityLogs || []).sort((a, b) => b.timestamp - a.timestamp),
            add: (log) => {
                if (!data.activityLogs) data.activityLogs = [];
                const newLog = {
                    id: getNextId(data.activityLogs),
                    ...log,
                    timestamp: Date.now()
                };
                data.activityLogs.push(newLog);
                saveData(data);
                return newLog;
            },
            clear: () => {
                data.activityLogs = [];
                saveData(data);
            }
        },
        // Helper to log activity
        logActivity: (action, target, details) => {
            if (!data.activityLogs) data.activityLogs = [];
            const newLog = {
                id: getNextId(data.activityLogs),
                action,
                admin: "Admin",
                target: target || "",
                details: details || "",
                timestamp: Date.now()
            };
            data.activityLogs.push(newLog);
            saveData(data);
            return newLog;
        },
        // Stats for dashboard
        getStats: () => ({
            totalStudents: (data.students || []).length,
            activeStudents: (data.students || []).filter(s => s.status === "active").length,
            activeGroups: (data.groups || []).filter(g => g.status === "active" || g.status === "recruiting").length,
            totalPayments: (data.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0),
            monthlyPayments: (data.payments || []).filter(p => {
                const paymentDate = new Date(p.date);
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
            }).reduce((sum, p) => sum + (p.amount || 0), 0),
            debtStudents: (data.students || []).filter(s => s.paymentStatus === "debt" || s.paymentStatus === "unpaid").length,
            newApplications: (data.applications || []).filter(a => a.status === "new").length,
            todayAttendance: (() => {
                const today = new Date().toISOString().split('T')[0];
                const todayRecords = (data.attendance || []).filter(a => a.date === today);
                if (todayRecords.length === 0) return 0;
                return Math.round(todayRecords.reduce((sum, r) => sum + r.percentage, 0) / todayRecords.length);
            })()
        }),
        // Reset to defaults
        reset: () => {
            data = JSON.parse(JSON.stringify(DEFAULT_DATA));
            saveData(data);
        },
        // Reload from storage (for sync between tabs)
        reload: () => {
            data = loadData();
        },
        // Centralized Online User Tracking
        trackOnlineUser: (type = 'portal') => {
            let sessionId = sessionStorage.getItem('itc_session_id');
            if (!sessionId) {
                sessionId = 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('itc_session_id', sessionId);
            }

            let activeSessions = {};
            try {
                activeSessions = JSON.parse(localStorage.getItem('itc_active_sessions') || '{}');
            } catch (e) { }

            activeSessions[sessionId] = {
                timestamp: Date.now(),
                type: type,
                path: window.location.pathname
            };

            // Clean up sessions older than 2 minutes
            const threshold = Date.now() - 2 * 60 * 1000;
            let changed = false;
            Object.keys(activeSessions).forEach(key => {
                if (activeSessions[key].timestamp < threshold) {
                    delete activeSessions[key];
                    changed = true;
                }
            });

            localStorage.setItem('itc_active_sessions', JSON.stringify(activeSessions));
            // Trigger storage event for other tabs if not changed by cleanup
            if (!changed) {
                localStorage.setItem('itc_sessions_ping', Date.now().toString());
            }
        },
        getOnlineCount: () => {
            try {
                const activeSessions = JSON.parse(localStorage.getItem('itc_active_sessions') || '{}');
                // Clean up on read as well
                const threshold = Date.now() - 2 * 60 * 1000;
                const count = Object.values(activeSessions).filter(s => s.timestamp >= threshold).length;
                return Math.max(1, count); // At least 1 (the current user)
            } catch (e) {
                return 1;
            }
        },
        // Hash password (for local demo mode, server uses bcrypt)
        hashPassword: async function (password) {
            return password; // Plain text for demo, bcrypt on server
        },
        verifyPassword: function (password, storedPassword) {
            return password === storedPassword;
        },
        // API Client for MongoDB Backend
        api: {
            baseUrl: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
                ? 'http://localhost:3001/api'
                : (typeof window !== 'undefined' ? window.location.origin + '/api' : '/api'),

            async request(endpoint, options = {}) {
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    ...options.headers
                };

                try {
                    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
                    return await response.json();
                } catch (error) {
                    console.error('API Error:', error);
                    return { success: false, message: 'Server bilan aloqa yo\'q' };
                }
            },

            async login(identifier, password, type = 'student') {
                return this.request(type === 'admin' ? '/auth/admin/login' : '/auth/student/login', {
                    method: 'POST',
                    body: JSON.stringify({ identifier, password })
                });
            },

            async register(data) {
                return this.request('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
        }
    };
})();

// Listen for updates from other tabs
window.addEventListener("storage", (e) => {
    if (e.key === "itcenter_db") {
        ITCenterDB.reload();
        window.dispatchEvent(new CustomEvent("itcenter-db-sync"));
    }
});

// Export for use
if (typeof window !== "undefined") {
    window.ITCenterDB = ITCenterDB;
}

// ========================
// SESSION SECURITY
// ========================
const SessionManager = (function () {
    const SESSION_KEY = "student_session";
    const ENCRYPTION_KEY = "itcenter_2024_secure";

    // Simple encryption (XOR based)
    function encrypt(text) {
        if (!text) return "";
        let result = "";
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
            );
        }
        return btoa(result);
    }

    function decrypt(encoded) {
        if (!encoded) return "";
        try {
            const text = atob(encoded);
            let result = "";
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
                );
            }
            return result;
        } catch (e) {
            return "";
        }
    }

    return {
        save: function (session) {
            const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
            session.token = token;
            session.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            const encrypted = encrypt(JSON.stringify(session));
            localStorage.setItem(SESSION_KEY, encrypted);
            return token;
        },
        get: function () {
            const encrypted = localStorage.getItem(SESSION_KEY);
            if (!encrypted) return null;
            try {
                const session = JSON.parse(decrypt(encrypted));
                if (session.expiresAt && Date.now() > session.expiresAt) {
                    this.clear();
                    return null;
                }
                return session;
            } catch (e) {
                return null;
            }
        },
        clear: function () {
            localStorage.removeItem(SESSION_KEY);
        },
        isValid: function () {
            const session = this.get();
            return session && session.token && session.studentId;
        }
    };
})();

// ========================
// VALIDATION UTILITIES
// ========================
const Validators = {
    email: function (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    phone: function (phone) {
        const cleaned = phone.replace(/\D/g, "");
        return cleaned.length >= 9 && cleaned.length <= 15;
    },
    password: function (password) {
        return password && password.length >= 6;
    },
    name: function (name) {
        return name && name.trim().length >= 2;
    }
};

// Export
if (typeof window !== "undefined") {
    window.SessionManager = SessionManager;
    window.Validators = Validators;
}
