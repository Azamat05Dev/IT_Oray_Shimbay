/**
 * IT CENTER - ADMIN MODALS MODULE
 * Add button handlers for Courses, Mentors, Payments, Admins
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==============================
    // COURSES - Add Course Button
    // ==============================
    const addCourseBtn = document.getElementById("add-course-btn");
    if (addCourseBtn) {
        addCourseBtn.addEventListener("click", () => openAddCourseModal());
    }

    // ==============================
    // MENTORS - Add Mentor Button
    // ==============================
    const addMentorBtn = document.getElementById("add-mentor-btn");
    if (addMentorBtn) {
        addMentorBtn.addEventListener("click", () => openAddMentorModal());
    }

    // ==============================
    // PAYMENTS - Add Payment Button
    // ==============================
    const addPaymentBtn = document.getElementById("add-payment-btn");
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener("click", () => openAddPaymentModal());
    }

    // ==============================
    // ADMINS - Add Admin Button
    // ==============================
    const addAdminBtn = document.getElementById("add-admin-btn");
    if (addAdminBtn) {
        addAdminBtn.addEventListener("click", () => openAddAdminModal());
    }
});

// ==============================
// ADD COURSE MODAL
// ==============================
window.openAddCourseModal = function () {
    let modal = document.getElementById("add-course-modal");
    if (modal) {
        modal.classList.add("open");
        return;
    }

    modal = document.createElement("div");
    modal.id = "add-course-modal";
    modal.className = "admin-modal open";

    modal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2>➕ Yangi Kurs Qo'shish</h2>
                <button class="admin-modal-close" onclick="closeAddCourseModal()">✕</button>
            </div>
            <div class="admin-modal-body">
                <div class="admin-form-group">
                    <label>Kurs nomi *</label>
                    <input type="text" id="new-course-name" class="admin-input" placeholder="Masalan: Frontend Development" required>
                </div>
                <div class="admin-form-group">
                    <label>Daraja</label>
                    <input type="text" id="new-course-level" class="admin-input" placeholder="Masalan: Boshlang'ich → Junior">
                </div>
                <div class="admin-form-group">
                    <label>Davomiyligi</label>
                    <input type="text" id="new-course-duration" class="admin-input" placeholder="Masalan: 4 oy">
                </div>
                <div class="admin-form-group">
                    <label>Narx (oyiga, so'm)</label>
                    <input type="number" id="new-course-price" class="admin-input" placeholder="1200000">
                </div>
                <div class="admin-form-group">
                    <label>Status</label>
                    <select id="new-course-status" class="admin-select">
                        <option value="active">Aktiv</option>
                        <option value="hidden">Yashirilgan</option>
                    </select>
                </div>
            </div>
            <div class="admin-modal-footer">
                <button class="admin-btn" onclick="closeAddCourseModal()">Bekor qilish</button>
                <button class="admin-btn admin-btn-primary" onclick="saveNewCourse()">💾 Saqlash</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.closeAddCourseModal = function () {
    const modal = document.getElementById("add-course-modal");
    if (modal) modal.classList.remove("open");
};

window.saveNewCourse = function () {
    const db = window.ITCenterDB;
    if (!db) return;

    const name = document.getElementById("new-course-name")?.value?.trim();
    const level = document.getElementById("new-course-level")?.value?.trim() || "Boshlang'ich";
    const duration = document.getElementById("new-course-duration")?.value?.trim() || "3 oy";
    const price = parseInt(document.getElementById("new-course-price")?.value) || 1000000;
    const status = document.getElementById("new-course-status")?.value || "active";

    if (!name) {
        if (window.adminShowToast) adminShowToast("❌ Kurs nomini kiriting", "error");
        return;
    }

    db.courses.add({
        name,
        level,
        duration,
        price,
        status
    });

    if (window.adminShowToast) adminShowToast("✅ Yangi kurs qo'shildi", "success");
    closeAddCourseModal();
    if (window.loadCourses) loadCourses();
};

// ==============================
// ADD MENTOR MODAL
// ==============================
window.openAddMentorModal = function () {
    let modal = document.getElementById("add-mentor-modal");
    if (modal) {
        modal.classList.add("open");
        return;
    }

    const db = window.ITCenterDB;
    const courses = db ? db.courses.getAll() : [];

    modal = document.createElement("div");
    modal.id = "add-mentor-modal";
    modal.className = "admin-modal open";

    modal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2>➕ Yangi Mentor Qo'shish</h2>
                <button class="admin-modal-close" onclick="closeAddMentorModal()">✕</button>
            </div>
            <div class="admin-modal-body">
                <div class="admin-form-group">
                    <label>To'liq ism *</label>
                    <input type="text" id="new-mentor-name" class="admin-input" placeholder="Ism Familiya" required>
                </div>
                <div class="admin-form-group">
                    <label>Telefon</label>
                    <input type="text" id="new-mentor-phone" class="admin-input" placeholder="+998901234567">
                </div>
                <div class="admin-form-group">
                    <label>Email</label>
                    <input type="email" id="new-mentor-email" class="admin-input" placeholder="email@mail.uz">
                </div>
                <div class="admin-form-group">
                    <label>Mutaxassislik</label>
                    <select id="new-mentor-course" class="admin-select">
                        ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
                    </select>
                </div>
                <div class="admin-form-group">
                    <label>Status</label>
                    <select id="new-mentor-status" class="admin-select">
                        <option value="active">Faol</option>
                        <option value="inactive">Nofaol</option>
                    </select>
                </div>
            </div>
            <div class="admin-modal-footer">
                <button class="admin-btn" onclick="closeAddMentorModal()">Bekor qilish</button>
                <button class="admin-btn admin-btn-primary" onclick="saveNewMentor()">💾 Saqlash</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.closeAddMentorModal = function () {
    const modal = document.getElementById("add-mentor-modal");
    if (modal) modal.classList.remove("open");
};

window.saveNewMentor = function () {
    const db = window.ITCenterDB;
    if (!db) return;

    const name = document.getElementById("new-mentor-name")?.value?.trim();
    const phone = document.getElementById("new-mentor-phone")?.value?.trim();
    const email = document.getElementById("new-mentor-email")?.value?.trim();
    const courseId = parseInt(document.getElementById("new-mentor-course")?.value);
    const status = document.getElementById("new-mentor-status")?.value || "active";

    if (!name) {
        if (window.adminShowToast) adminShowToast("❌ Mentor ismini kiriting", "error");
        return;
    }

    db.mentors.add({
        name,
        phone,
        email,
        courseId,
        status
    });

    if (window.adminShowToast) adminShowToast("✅ Yangi mentor qo'shildi", "success");
    closeAddMentorModal();
    if (window.loadMentors) loadMentors();
};

// ==============================
// ADD PAYMENT MODAL
// ==============================
window.openAddPaymentModal = function () {
    let modal = document.getElementById("add-payment-modal");
    if (modal) {
        modal.classList.add("open");
        return;
    }

    const db = window.ITCenterDB;
    const students = db ? db.students.getAll() : [];

    modal = document.createElement("div");
    modal.id = "add-payment-modal";
    modal.className = "admin-modal open";

    const today = new Date().toISOString().split("T")[0];

    modal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2>💰 Yangi To'lov Qo'shish</h2>
                <button class="admin-modal-close" onclick="closeAddPaymentModal()">✕</button>
            </div>
            <div class="admin-modal-body">
                <div class="admin-form-group">
                    <label>Talaba *</label>
                    <select id="new-payment-student" class="admin-select" required>
                        <option value="">— Talabani tanlang —</option>
                        ${students.map(s => `<option value="${s.id}">${s.fullName} (${s.id})</option>`).join("")}
                    </select>
                </div>
                <div class="admin-form-group">
                    <label>Summa (so'm) *</label>
                    <input type="number" id="new-payment-amount" class="admin-input" placeholder="500000" required>
                </div>
                <div class="admin-form-group">
                    <label>To'lov usuli</label>
                    <select id="new-payment-method" class="admin-select">
                        <option value="cash">Naqd</option>
                        <option value="card">Plastik karta</option>
                        <option value="transfer">Bank o'tkazmasi</option>
                        <option value="payme">Payme</option>
                        <option value="click">Click</option>
                    </select>
                </div>
                <div class="admin-form-group">
                    <label>Sana</label>
                    <input type="date" id="new-payment-date" class="admin-input" value="${today}">
                </div>
                <div class="admin-form-group">
                    <label>Izoh</label>
                    <input type="text" id="new-payment-note" class="admin-input" placeholder="Qo'shimcha izoh...">
                </div>
            </div>
            <div class="admin-modal-footer">
                <button class="admin-btn" onclick="closeAddPaymentModal()">Bekor qilish</button>
                <button class="admin-btn admin-btn-primary" onclick="saveNewPayment()">💾 Saqlash</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.closeAddPaymentModal = function () {
    const modal = document.getElementById("add-payment-modal");
    if (modal) modal.classList.remove("open");
};

window.saveNewPayment = function () {
    const db = window.ITCenterDB;
    if (!db) return;

    const studentId = parseInt(document.getElementById("new-payment-student")?.value);
    const amount = parseInt(document.getElementById("new-payment-amount")?.value);
    const method = document.getElementById("new-payment-method")?.value || "cash";
    const date = document.getElementById("new-payment-date")?.value;
    const note = document.getElementById("new-payment-note")?.value?.trim();

    if (!studentId) {
        if (window.adminShowToast) adminShowToast("❌ Talabani tanlang", "error");
        return;
    }

    if (!amount || amount <= 0) {
        if (window.adminShowToast) adminShowToast("❌ Summani kiriting", "error");
        return;
    }

    db.payments.add({
        studentId,
        amount,
        method,
        date: date || new Date().toISOString().split("T")[0],
        note,
        status: "completed"
    });

    if (window.adminShowToast) adminShowToast("✅ To'lov qo'shildi", "success");
    closeAddPaymentModal();
    if (window.loadPayments) loadPayments();
};



// ==============================
// ADD ADMIN MODAL
// ==============================
window.openAddAdminModal = function () {
    let modal = document.getElementById("add-admin-modal");
    if (modal) {
        modal.classList.add("open");
        return;
    }

    modal = document.createElement("div");
    modal.id = "add-admin-modal";
    modal.className = "admin-modal open";

    modal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2>🔐 Yangi Admin Qo'shish</h2>
                <button class="admin-modal-close" onclick="closeAddAdminModal()">✕</button>
            </div>
            <div class="admin-modal-body">
                <div class="admin-form-group">
                    <label>Foydalanuvchi nomi *</label>
                    <input type="text" id="new-admin-username" class="admin-input" placeholder="admin_username" required>
                </div>
                <div class="admin-form-group">
                    <label>To'liq ism</label>
                    <input type="text" id="new-admin-fullname" class="admin-input" placeholder="Ism Familiya">
                </div>
                <div class="admin-form-group">
                    <label>Email</label>
                    <input type="email" id="new-admin-email" class="admin-input" placeholder="admin@mail.uz">
                </div>
                <div class="admin-form-group">
                    <label>Parol *</label>
                    <input type="password" id="new-admin-password" class="admin-input" placeholder="••••••••" required>
                </div>
                <div class="admin-form-group">
                    <label>Parolni tasdiqlash *</label>
                    <input type="password" id="new-admin-password2" class="admin-input" placeholder="••••••••" required>
                </div>
                <div class="admin-form-group">
                    <label>Rol</label>
                    <select id="new-admin-role" class="admin-select">
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="moderator">Moderator</option>
                    </select>
                </div>
                <div class="admin-form-group">
                    <label>Status</label>
                    <select id="new-admin-status" class="admin-select">
                        <option value="active">Faol</option>
                        <option value="inactive">Nofaol</option>
                    </select>
                </div>
            </div>
            <div class="admin-modal-footer">
                <button class="admin-btn" onclick="closeAddAdminModal()">Bekor qilish</button>
                <button class="admin-btn admin-btn-primary" onclick="saveNewAdmin()">💾 Saqlash</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.closeAddAdminModal = function () {
    const modal = document.getElementById("add-admin-modal");
    if (modal) modal.classList.remove("open");
};

window.saveNewAdmin = function () {
    const db = window.ITCenterDB;

    const username = document.getElementById("new-admin-username")?.value?.trim();
    const fullName = document.getElementById("new-admin-fullname")?.value?.trim() || username;
    const email = document.getElementById("new-admin-email")?.value?.trim();
    const password = document.getElementById("new-admin-password")?.value;
    const password2 = document.getElementById("new-admin-password2")?.value;
    const role = document.getElementById("new-admin-role")?.value || "admin";
    const status = document.getElementById("new-admin-status")?.value || "active";

    if (!username) {
        if (window.adminShowToast) adminShowToast("❌ Foydalanuvchi nomini kiriting", "error");
        return;
    }

    if (!password || password.length < 6) {
        if (window.adminShowToast) adminShowToast("❌ Parol kamida 6 belgidan iborat bo'lishi kerak", "error");
        return;
    }

    if (password !== password2) {
        if (window.adminShowToast) adminShowToast("❌ Parollar bir xil emas", "error");
        return;
    }

    // Save to LocalStorage or API
    if (db && db.admins) {
        db.admins.add({
            username,
            fullName,
            email,
            password, // In production, this should be hashed
            role,
            status,
            createdAt: new Date().toISOString()
        });
    } else {
        // Fallback: save to localStorage directly
        const admins = JSON.parse(localStorage.getItem("itcenter_admins") || "[]");
        admins.push({
            id: Date.now(),
            username,
            fullName,
            email,
            role,
            status,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem("itcenter_admins", JSON.stringify(admins));
    }

    if (window.adminShowToast) adminShowToast("✅ Yangi admin qo'shildi", "success");
    closeAddAdminModal();

    // Reload admins list if function exists
    if (window.loadAdmins) loadAdmins();
};
