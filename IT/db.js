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
            { id: 1, username: "admin", password: "admin123", fullName: "Super Admin", email: "admin@itcenter.uz", role: "super_admin", status: "active", lastLogin: Date.now(), createdAt: Date.now() - 86400000 * 365 },
            { id: 2, username: "manager", password: "manager123", fullName: "Direktor", email: "manager@itcenter.uz", role: "admin", status: "active", lastLogin: Date.now() - 3600000, createdAt: Date.now() - 86400000 * 180 },
            { id: 3, username: "operator", password: "operator123", fullName: "O'quv bo'limi", email: "operator@itcenter.uz", role: "viewer", status: "active", lastLogin: Date.now() - 86400000, createdAt: Date.now() - 86400000 * 30 }
        ],
        loginHistory: [
            { id: 1, adminId: 1, username: "admin", action: "login", ip: "192.168.1.100", userAgent: "Chrome/Windows", timestamp: Date.now() - 60000 },
            { id: 2, adminId: 2, username: "manager", action: "login", ip: "192.168.1.101", userAgent: "Firefox/Mac", timestamp: Date.now() - 3600000 },
            { id: 3, adminId: 1, username: "admin", action: "logout", ip: "192.168.1.100", userAgent: "Chrome/Windows", timestamp: Date.now() - 86400000 }
        ],
        mentors: [
            { id: 1, name: "Azizbek", role: "Frontend", rating: 4.9, reviews: 120, phone: "+998901234567", telegram: "@azizbek_front", status: "active", groups: ["F-11", "F-12"] },
            { id: 2, name: "Jasur", role: "Backend", rating: 4.8, reviews: 90, phone: "+998901234568", telegram: "@jasur_backend", status: "active", groups: ["P-07"] },
            { id: 3, name: "Malika", role: "Kids IT", rating: 4.9, reviews: 140, phone: "+998901234569", telegram: "@malika_kids", status: "active", groups: ["K-03"] },
            { id: 4, name: "Sabina", role: "Design", rating: 4.8, reviews: 70, phone: "+998901234570", telegram: "@sabina_design", status: "active", groups: [] },
            { id: 5, name: "Bekzod", role: "Frontend", rating: 4.9, reviews: 110, phone: "+998901234571", telegram: "@bekzod_css", status: "active", groups: [] },
            { id: 6, name: "Umid", role: "Python", rating: 4.7, reviews: 60, phone: "+998901234572", telegram: "@umid_python", status: "active", groups: [] },
            { id: 7, name: "Kamron", role: "Robotics", rating: 4.8, reviews: 55, phone: "+998901234573", telegram: "@kamron_stem", status: "active", groups: [] },
            { id: 8, name: "Shahzod", role: "Mobile", rating: 4.8, reviews: 80, phone: "+998901234574", telegram: "@shahzod_flutter", status: "active", groups: [] },
            { id: 9, name: "Nilufar", role: "QA", rating: 4.7, reviews: 45, phone: "+998901234575", telegram: "@nilufar_qa", status: "active", groups: [] }
        ],
        courses: [
            { id: 1, name: "Web dasturlash (Frontend)", level: "beginner", duration: "4 oy", price: 1200000, discountPercent: 10, monthlyOption: true, fullPaymentDiscount: 5, description: "HTML, CSS, JavaScript, React", status: "active" },
            { id: 2, name: "Python dasturlash asoslari", level: "beginner", duration: "3 oy", price: 1000000, discountPercent: 0, monthlyOption: true, fullPaymentDiscount: 10, description: "Algoritmlar, botlar, backend", status: "active" },
            { id: 3, name: "Bolalar uchun IT (9-14 yosh)", level: "kids", duration: "2 oy", price: 900000, discountPercent: 15, monthlyOption: true, fullPaymentDiscount: 5, description: "Scratch, o'yinlar, robototexnika", status: "active" },
            { id: 4, name: "UI/UX Dizayn", level: "intermediate", duration: "3 oy", price: 1100000, discountPercent: 5, monthlyOption: true, fullPaymentDiscount: 8, description: "Figma, UX research, Design systems", status: "active" },
            { id: 5, name: "Mobile Development", level: "intermediate", duration: "4 oy", price: 1300000, discountPercent: 0, monthlyOption: true, fullPaymentDiscount: 10, description: "Flutter, Dart, iOS/Android", status: "active" }
        ],
        students: [
            { id: 1, fullName: "Mohira Qodirova", phone: "+998901234567", email: "mohira@mail.uz", password: "123456", courseId: 1, groupId: "F-12", status: "active", paymentStatus: "paid", enrollDate: "2024-01-15", birthDate: "2000-05-12" },
            { id: 2, fullName: "Javlon Tursunov", phone: "+998935554411", email: "javlon@mail.uz", password: "123456", courseId: 2, groupId: "P-07", status: "active", paymentStatus: "partial", enrollDate: "2024-02-01", birthDate: "1999-08-22" },
            { id: 3, fullName: "Akmalov Aziz", phone: "+998911112233", email: "aziz@mail.uz", password: "123456", courseId: 3, groupId: "K-03", status: "frozen", paymentStatus: "debt", enrollDate: "2024-01-20", birthDate: "2010-03-15" },
            { id: 4, fullName: "Dilnoza Karimova", phone: "+998901112200", email: "dilnoza@mail.uz", password: "123456", courseId: 1, groupId: "F-11", status: "graduated", paymentStatus: "paid", enrollDate: "2023-09-01", birthDate: "1998-11-08" },
            { id: 5, fullName: "Sardor Aliyev", phone: "+998907778899", email: "sardor@mail.uz", password: "123456", courseId: 4, groupId: "D-05", status: "active", paymentStatus: "paid", enrollDate: "2024-03-01", birthDate: "2001-02-28" },
            { id: 6, fullName: "Gulnoza Rahimova", phone: "+998933334455", email: "gulnoza@mail.uz", password: "123456", courseId: 5, groupId: "M-02", status: "active", paymentStatus: "partial", enrollDate: "2024-02-15", birthDate: "2000-07-19" },
            { id: 7, fullName: "Bekzod Toshev", phone: "+998905556677", email: "bekzod@mail.uz", password: "123456", courseId: 1, groupId: "F-12", status: "active", paymentStatus: "paid", enrollDate: "2024-01-15", birthDate: "1999-04-05" },
            { id: 8, fullName: "Nilufar Saidova", phone: "+998912223344", email: "nilufar@mail.uz", password: "123456", courseId: 2, groupId: "P-08", status: "active", paymentStatus: "debt", enrollDate: "2024-03-10", birthDate: "2001-09-14" },
            { id: 9, fullName: "Kamron Yusupov", phone: "+998939998877", email: "kamron@mail.uz", password: "123456", courseId: 3, groupId: "K-04", status: "applied", paymentStatus: "unpaid", enrollDate: "2024-12-10", birthDate: "2012-06-20" },
            { id: 10, fullName: "Shahzod Ergashev", phone: "+998901239876", email: "shahzod@mail.uz", password: "123456", courseId: 5, groupId: "M-02", status: "graduated", paymentStatus: "paid", enrollDate: "2023-06-01", birthDate: "1997-12-01" },
            { id: 11, fullName: "Zarina Abdullayeva", phone: "+998945554433", email: "zarina@mail.uz", password: "123456", courseId: 4, groupId: "D-05", status: "active", paymentStatus: "paid", enrollDate: "2024-03-01", birthDate: "2000-01-25" },
            { id: 12, fullName: "Madina Rakhimova", phone: "+998997776655", email: "madina@mail.uz", password: "123456", courseId: 1, groupId: "", status: "applied", paymentStatus: "unpaid", enrollDate: "2024-12-14", birthDate: "2002-10-30" }
        ],
        groups: [
            { id: "F-12", courseId: 1, mentorId: 1, schedule: "Dush / Chor / Jum • 18:00", room: "203", capacity: 18, studentCount: 14, status: "active" },
            { id: "F-11", courseId: 1, mentorId: 5, schedule: "Sesh / Pay / Shan • 10:00", room: "201", capacity: 16, studentCount: 16, status: "full" },
            { id: "P-07", courseId: 2, mentorId: 2, schedule: "Sesh / Pay • 19:00", room: "305", capacity: 15, studentCount: 10, status: "recruiting" },
            { id: "P-08", courseId: 2, mentorId: 6, schedule: "Dush / Chor / Jum • 14:00", room: "306", capacity: 15, studentCount: 8, status: "active" },
            { id: "K-03", courseId: 3, mentorId: 3, schedule: "Dush / Chor / Jum • 16:00", room: "Kids-1", capacity: 16, studentCount: 16, status: "full" },
            { id: "K-04", courseId: 3, mentorId: 3, schedule: "Sesh / Pay • 15:00", room: "Kids-2", capacity: 12, studentCount: 6, status: "recruiting" },
            { id: "D-05", courseId: 4, mentorId: 4, schedule: "Dush / Chor / Jum • 17:00", room: "Design-1", capacity: 14, studentCount: 12, status: "active" },
            { id: "M-02", courseId: 5, mentorId: 8, schedule: "Sesh / Pay / Shan • 18:00", room: "Mobile-1", capacity: 12, studentCount: 9, status: "active" }
        ],
        payments: [
            { id: 1, studentId: 1, amount: 1200000, method: "payme", date: "2024-03-15", status: "completed", note: "To'liq oylik to'lov", createdAt: Date.now() - 86400000 * 30 },
            { id: 2, studentId: 2, amount: 500000, method: "cash", date: "2024-03-14", status: "partial", note: "Birinchi qism", createdAt: Date.now() - 86400000 * 29 },
            { id: 3, studentId: 1, amount: 1200000, method: "click", date: "2024-04-15", status: "completed", note: "Aprel oyi", createdAt: Date.now() - 86400000 * 15 },
            { id: 4, studentId: 3, amount: 800000, method: "cash", date: "2024-03-20", status: "completed", note: "Naqd to'lov", createdAt: Date.now() - 86400000 * 25 },
            { id: 5, studentId: 4, amount: 1500000, method: "uzcard", date: "2024-02-10", status: "completed", note: "3 oylik to'lov", createdAt: Date.now() - 86400000 * 60 },
            { id: 6, studentId: 5, amount: 1000000, method: "humo", date: "2024-03-25", status: "completed", note: "Mart oyi", createdAt: Date.now() - 86400000 * 20 },
            { id: 7, studentId: 6, amount: 650000, method: "cash", date: "2024-04-01", status: "partial", note: "Qisman to'lov", createdAt: Date.now() - 86400000 * 14 },
            { id: 8, studentId: 7, amount: 1200000, method: "payme", date: "2024-04-10", status: "completed", note: "Aprel", createdAt: Date.now() - 86400000 * 5 },
            { id: 9, studentId: 8, amount: 400000, method: "cash", date: "2024-04-12", status: "partial", note: "Boshlang'ich to'lov", createdAt: Date.now() - 86400000 * 3 },
            { id: 10, studentId: 2, amount: 700000, method: "click", date: "2024-04-14", status: "completed", note: "Qolgan qism", createdAt: Date.now() - 86400000 * 1 },
            { id: 11, studentId: 10, amount: 2000000, method: "payme", date: "2023-06-15", status: "completed", note: "Yakuniy to'lov (bitiruvchi)", createdAt: Date.now() - 86400000 * 180 },
            { id: 12, studentId: 11, amount: 1300000, method: "uzcard", date: "2024-03-30", status: "completed", note: "UI/UX dizayn kursi", createdAt: Date.now() - 86400000 * 16 },
            { id: 13, studentId: 5, amount: 1000000, method: "payme", date: "2024-04-25", status: "pending", note: "Kutilmoqda", createdAt: Date.now() - 1000 },
            { id: 14, studentId: 9, amount: 0, method: "", date: "", status: "unpaid", note: "Ariza holati", createdAt: Date.now() }
        ],
        applications: [
            { id: 1, fullName: "Mohira Qodirova", phone: "+998901234567", course: "Frontend", format: "Offlayn", note: "", status: "new", createdAt: Date.now() - 60000, adminNote: "", callbackDate: "" },
            { id: 2, fullName: "Javlon Tursunov", phone: "+998935554411", course: "Python", format: "Onlayn", note: "Ingliz tilida darslar bormi?", status: "called", createdAt: Date.now() - 3600000, adminNote: "Qo'ng'iroq qilindi, o'ylayapti", callbackDate: "2024-12-16" },
            { id: 3, fullName: "Akmalov Aziz", phone: "+998911112233", course: "Kids IT", format: "Aralash", note: "9 yosh farzandi uchun", status: "enrolled", createdAt: Date.now() - 86400000, adminNote: "K-04 guruhiga qo'shildi", callbackDate: "" },
            { id: 4, fullName: "Dilshoda Karimova", phone: "+998907776655", course: "UI/UX Dizayn", format: "Offlayn", note: "Figma kursi kerak", status: "new", createdAt: Date.now() - 30000, adminNote: "", callbackDate: "" },
            { id: 5, fullName: "Sardor Alimov", phone: "+998901112233", course: "Frontend", format: "Onlayn", note: "", status: "waiting", createdAt: Date.now() - 7200000, adminNote: "Guruh ochilishini kutmoqda", callbackDate: "2024-12-20" },
            { id: 6, fullName: "Gulnora Tosheva", phone: "+998933334455", course: "Python", format: "Offlayn", note: "O'zbek tilida darslar", status: "called", createdAt: Date.now() - 14400000, adminNote: "2 kun ichida javob beradi", callbackDate: "2024-12-17" },
            { id: 7, fullName: "Bekzod Umarov", phone: "+998945556677", course: "Mobile Development", format: "Aralash", note: "Flutter o'rganmoqchiman", status: "new", createdAt: Date.now() - 120000, adminNote: "", callbackDate: "" },
            { id: 8, fullName: "Nodira Rahimova", phone: "+998997778899", course: "Frontend", format: "Onlayn", note: "Ish bilan birga o'qiy olamanmi?", status: "rejected", createdAt: Date.now() - 172800000, adminNote: "Boshqa shaharda, onlayn guruh yo'q", callbackDate: "" },
            { id: 9, fullName: "Jasur Qodirov", phone: "+998901239876", course: "Kids IT", format: "Offlayn", note: "7 yosh, kompyuter asoslari", status: "waiting", createdAt: Date.now() - 43200000, adminNote: "Ota-ona bilan uchrashish belgilandi", callbackDate: "2024-12-18" },
            { id: 10, fullName: "Malika Saidova", phone: "+998939998877", course: "UI/UX Dizayn", format: "Offlayn", note: "", status: "new", createdAt: Date.now() - 5000, adminNote: "", callbackDate: "" }
        ],
        attendance: [
            // Bugungi davomat yozuvlari
            // { id: 1, groupId: "F-12", date: "2024-12-14", presentStudents: 12, totalStudents: 14, percentage: 86, timestamp: Date.now() }
        ],
        settings: {
            // Portal
            portalName: "IT Center Portal",
            portalDescription: "O'zbekistondagi zamonaviy IT ta'lim markazi",
            contactPhone: "+998 71 123 45 67",
            contactEmail: "info@itcenter.uz",
            contactAddress: "Toshkent sh., Amir Temur ko'chasi 108",
            socialTelegram: "https://t.me/itcenter_uz",
            socialInstagram: "https://instagram.com/itcenter_uz",
            socialYoutube: "https://youtube.com/@itcenter_uz",

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
        activityLogs: [
            { id: 1, action: "login", admin: "Admin", target: "", details: "Tizimga kirdi", timestamp: Date.now() - 60000 },
            { id: 2, action: "payment_add", admin: "Admin", target: "Mohira Qodirova", details: "1,200,000 so'm to'lov qo'shildi", timestamp: Date.now() - 120000 },
            { id: 3, action: "student_add", admin: "Admin", target: "Sardor Alimov", details: "Yangi talaba qo'shildi", timestamp: Date.now() - 300000 },
            { id: 4, action: "group_create", admin: "Admin", target: "F-13", details: "Yangi guruh yaratildi", timestamp: Date.now() - 600000 },
            { id: 5, action: "attendance_mark", admin: "Admin", target: "F-12", details: "Davomat belgilandi (12/14)", timestamp: Date.now() - 900000 },
            { id: 6, action: "application_enroll", admin: "Admin", target: "Javlon Tursunov", details: "Ariza talabaga o'tkazildi", timestamp: Date.now() - 1800000 },
            { id: 7, action: "settings_update", admin: "Admin", target: "Portal", details: "Sozlamalar yangilandi", timestamp: Date.now() - 3600000 },
            { id: 8, action: "student_edit", admin: "Admin", target: "Akmalov Aziz", details: "Talaba ma'lumotlari tahrirlandi", timestamp: Date.now() - 7200000 },
            { id: 9, action: "payment_add", admin: "Admin", target: "Gulnora Tosheva", details: "500,000 so'm to'lov qo'shildi", timestamp: Date.now() - 14400000 },
            { id: 10, action: "login", admin: "Admin", target: "", details: "Tizimga kirdi", timestamp: Date.now() - 86400000 }
        ],
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
                    console.log("🔄 DB version outdated, refreshing with new defaults...");
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
        verifyPassword: function (password, storedPassword) {
            // Simple direct comparison for plain text passwords
            return password === storedPassword;
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
