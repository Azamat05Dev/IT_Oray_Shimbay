/**
 * IT Center - Student Portal JavaScript
 * Talaba kabineti funksionaligi
 */

(function () {
    "use strict";

    // Centralized Online Tracking
    if (window.ITCenterDB && window.ITCenterDB.trackOnlineUser) {
        window.ITCenterDB.trackOnlineUser('student');
        setInterval(() => window.ITCenterDB.trackOnlineUser('student'), 30000);
    }

    // =========================
    // LOGIN FUNCTIONALITY
    // =========================
    const loginForm = document.getElementById("student-login-form");
    const loginError = document.getElementById("login-error");
    const loginErrorText = document.getElementById("login-error-text");
    const togglePasswordBtn = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("login-password");

    // Toggle password visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", () => {
            const type = passwordInput.type === "password" ? "text" : "password";
            passwordInput.type = type;
            togglePasswordBtn.textContent = type === "password" ? "👁️" : "🙈";
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const phone = document.getElementById("login-phone").value.replace(/\s/g, "");
            const password = document.getElementById("login-password").value;
            const remember = document.getElementById("remember-me").checked;

            // Validate inputs
            if (!phone || phone.length < 9) {
                showLoginError("Telefon raqamni to'g'ri kiriting");
                return;
            }

            if (!password || password.length < 6) {
                showLoginError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
                return;
            }

            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Yuklanmoqda...";
            }

            try {
                // Try API authentication first
                const response = await fetch("/api/auth/student/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: phone, password })
                });

                const data = await response.json();

                if (data.success) {
                    // API login successful - save JWT tokens
                    const storage = remember ? localStorage : sessionStorage;
                    storage.setItem("student_token", data.accessToken);
                    storage.setItem("student_refresh_token", data.refreshToken);
                    storage.setItem("student_session", JSON.stringify({
                        studentId: data.student._id || data.student.id,
                        studentName: data.student.fullName,
                        phone: data.student.phone,
                        groupId: data.student.groupId,
                        courseId: data.student.courseId,
                        loginTime: Date.now(),
                        remember: remember
                    }));

                    hideLoginError();
                    window.location.href = "index.html";
                    return;
                } else {
                    showLoginError(data.message || "Telefon yoki parol noto'g'ri");
                }
            } catch (apiError) {
                // API not available - fallback to LocalStorage validation
                const db = window.ITCenterDB;
                if (!db) {
                    showLoginError("Server bilan bog'lanib bo'lmadi. Keyinroq urinib ko'ring.");
                    return;
                }

                const students = db.students.getAll();
                const student = students.find(s => {
                    const cleanPhone = s.phone.replace(/\s/g, "");
                    return cleanPhone === phone || cleanPhone.endsWith(phone.slice(-9));
                });

                if (!student) {
                    showLoginError("Bu telefon raqam ro'yxatda topilmadi");
                    return;
                }

                // Check password from student record (stored in db.js)
                if (student.password && student.password !== password) {
                    showLoginError("Parol noto'g'ri");
                    return;
                }

                // Successful fallback login
                hideLoginError();

                const session = {
                    studentId: student.id,
                    studentName: student.fullName,
                    phone: student.phone,
                    groupId: student.groupId,
                    courseId: student.courseId,
                    loginTime: Date.now(),
                    remember: remember
                };

                if (remember) {
                    localStorage.setItem("student_session", JSON.stringify(session));
                } else {
                    sessionStorage.setItem("student_session", JSON.stringify(session));
                }

                db.logActivity("student_login", student.fullName, "Talaba kabinetiga kirdi");
                window.location.href = "index.html";
            } finally {
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    function showLoginError(message) {
        if (loginError && loginErrorText) {
            loginErrorText.textContent = message;
            loginError.style.display = "flex";
        }
    }

    function hideLoginError() {
        if (loginError) {
            loginError.style.display = "none";
        }
    }

    // =========================
    // SESSION MANAGEMENT
    // =========================
    function getSession() {
        const sessionData = localStorage.getItem("student_session") || sessionStorage.getItem("student_session");
        if (sessionData) {
            try {
                return JSON.parse(sessionData);
            } catch {
                return null;
            }
        }
        return null;
    }

    function checkAuth() {
        const session = getSession();
        const isLoginPage = window.location.pathname.includes("login.html");

        if (!session && !isLoginPage) {
            window.location.href = "login.html";
            return null;
        }

        if (session && isLoginPage) {
            window.location.href = "index.html";
            return null;
        }

        return session;
    }

    function logout() {
        localStorage.removeItem("student_session");
        sessionStorage.removeItem("student_session");
        window.location.href = "../index.html";
    }

    // Check auth on page load (except login page)
    if (!window.location.pathname.includes("login.html")) {
        const session = checkAuth();
        if (session) {
            initDashboard(session);
        }
    }

    // =========================
    // DASHBOARD INITIALIZATION
    // =========================
    function initDashboard(session) {
        const db = window.ITCenterDB;
        if (!db) return;

        const student = db.students.getById(session.studentId);

        if (!student) {
            logout();
            return;
        }

        // Check student status and show appropriate content
        if (student.status === 'applied' || student.status === 'postponed' || student.status === 'rejected') {
            showApplicationStatus(student, db);
            return;
        }

        // Load student data (only for active/approved students)
        loadProfile(student, db);
        loadStats(student, db);
        loadSchedule(student, db);
        loadPayments(student, db);
        loadAttendance(student, db);

        // Setup navigation
        setupNavigation();

        // Setup logout
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", logout);
        }
    }

    // =========================
    // APPLICATION STATUS (for pending students)
    // =========================
    function showApplicationStatus(student, db) {
        const mainContent = document.querySelector(".student-main");
        if (!mainContent) return;

        const course = db.courses?.getById(student.courseId);
        const courseName = course?.name || 'Tanlangan kurs';

        let statusHtml = '';
        let statusClass = '';
        let icon = '';

        if (student.status === 'applied') {
            icon = '⏳';
            statusClass = 'status-applied';
            statusHtml = `
                <h2>Arizangiz ko'rib chiqilmoqda</h2>
                <p>Administrator tez orada arizangizni ko'rib chiqadi va guruhga qo'shadi.</p>
                <div class="status-details">
                    <p>📅 Ariza sanasi: <strong>${student.applicationDate ? new Date(student.applicationDate).toLocaleDateString('uz-UZ') : student.enrollDate}</strong></p>
                    <p>📚 Tanlangan kurs: <strong>${courseName}</strong></p>
                </div>
            `;
        } else if (student.status === 'postponed') {
            icon = '📅';
            statusClass = 'status-postponed';
            statusHtml = `
                <h2>Arizangiz kechiktirilgan</h2>
                <p>Administrator arizangizni ko'rib chiqdi va belgilangan sanagacha kutishingizni so'radi.</p>
                <div class="status-details">
                    <p>📅 Kechiktirilgan sana: <strong>${student.postponedUntil || 'Belgilanmagan'}</strong></p>
                    ${student.postponeNote ? `<p>💬 Izoh: ${student.postponeNote}</p>` : ''}
                    <p>📚 Tanlangan kurs: <strong>${courseName}</strong></p>
                </div>
            `;
        } else if (student.status === 'rejected') {
            icon = '❌';
            statusClass = 'status-rejected';
            statusHtml = `
                <h2>Arizangiz rad etildi</h2>
                <p>Afsuski, arizangiz qabul qilinmadi.</p>
                <div class="status-details">
                    <p>💬 Sabab: <strong>${student.rejectionReason || 'Ko\'rsatilmagan'}</strong></p>
                    <p>📅 Rad etilgan sana: <strong>${student.rejectedAt ? new Date(student.rejectedAt).toLocaleDateString('uz-UZ') : 'Noma\'lum'}</strong></p>
                </div>
                <p class="status-help">Savollaringiz bo'lsa, biz bilan bog'laning: +998 90 123 45 67</p>
            `;
        }

        // Hide sidebar nav items except logout
        const navItems = document.querySelectorAll(".nav-item:not(.nav-logout)");
        navItems.forEach(item => item.style.display = "none");

        // Update profile info
        const profileName = document.getElementById("profile-name");
        const profileGroup = document.getElementById("profile-group");
        const profileAvatar = document.getElementById("profile-avatar");

        if (profileName) profileName.textContent = student.fullName;
        if (profileGroup) profileGroup.textContent = courseName;
        if (profileAvatar) {
            const initials = student.fullName.split(" ").map(n => n[0]).join("").substring(0, 2);
            profileAvatar.textContent = initials;
        }

        // Show status page
        mainContent.innerHTML = `
            <div class="application-status-page ${statusClass}">
                <div class="status-icon">${icon}</div>
                <div class="status-content">
                    ${statusHtml}
                </div>
                <button class="status-refresh-btn" onclick="location.reload()">🔄 Yangilash</button>
            </div>
        `;

        // Setup logout
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", logout);
        }
    }

    // =========================
    // PROFILE
    // =========================
    function loadProfile(student, db) {
        const profileName = document.getElementById("profile-name");
        const profileGroup = document.getElementById("profile-group");
        const profileAvatar = document.getElementById("profile-avatar");

        if (profileName) profileName.textContent = student.fullName;
        if (profileGroup) {
            const course = db.courses.getById(student.courseId);
            profileGroup.textContent = `${student.groupId || "—"} • ${course?.name || ""}`;
        }
        if (profileAvatar) {
            const initials = student.fullName.split(" ").map(n => n[0]).join("").substring(0, 2);
            profileAvatar.textContent = initials;
        }

        // Enhanced Profile View
        const course = db.courses.getById(student.courseId);
        const group = db.groups.getById(student.groupId);

        // View mode
        const viewName = document.getElementById("view-name");
        const viewEmail = document.getElementById("view-email");
        const viewPhone = document.getElementById("view-phone");
        const viewBirthdate = document.getElementById("view-birthdate");
        const viewCourse = document.getElementById("view-course");
        const viewGroup = document.getElementById("view-group");
        const viewEnrolled = document.getElementById("view-enrolled");
        const avatarLarge = document.getElementById("profile-avatar-large");

        if (viewName) viewName.textContent = student.fullName;
        if (viewEmail) viewEmail.textContent = student.email || "—";
        if (viewPhone) viewPhone.textContent = student.phone || "—";
        if (viewBirthdate) viewBirthdate.textContent = student.birthDate || "—";
        if (viewCourse) viewCourse.textContent = course?.name || "—";
        if (viewGroup) viewGroup.textContent = student.groupId || "—";
        if (viewEnrolled) viewEnrolled.textContent = student.enrollDate || "—";
        if (avatarLarge) {
            const initials = student.fullName.split(" ").map(n => n[0]).join("").substring(0, 2);
            avatarLarge.textContent = initials;
        }

        // Edit form
        const editName = document.getElementById("edit-name");
        const editEmail = document.getElementById("edit-email");
        const editPhone = document.getElementById("edit-phone");
        const editBirthdate = document.getElementById("edit-birthdate");

        if (editName) editName.value = student.fullName || "";
        if (editEmail) editEmail.value = student.email || "";
        if (editPhone) editPhone.value = student.phone || "";
        if (editBirthdate) editBirthdate.value = student.birthDate || "";

        // Profile edit toggle
        const editBtn = document.getElementById("edit-profile-btn");
        const cancelBtn = document.getElementById("cancel-edit-btn");
        const profileView = document.getElementById("profile-view");
        const profileEdit = document.getElementById("profile-edit");
        const profileForm = document.getElementById("profile-form");
        const profileMsg = document.getElementById("profile-msg");

        if (editBtn && profileView && profileEdit) {
            editBtn.addEventListener("click", () => {
                profileView.style.display = "none";
                profileEdit.style.display = "block";
                editBtn.style.display = "none";
            });
        }

        if (cancelBtn && profileView && profileEdit && editBtn) {
            cancelBtn.addEventListener("click", () => {
                profileView.style.display = "block";
                profileEdit.style.display = "none";
                editBtn.style.display = "inline-flex";
            });
        }

        // Profile save
        if (profileForm) {
            profileForm.addEventListener("submit", (e) => {
                e.preventDefault();

                // Validate inputs
                const name = editName.value.trim();
                const phone = editPhone.value.trim();

                if (name.length < 2) {
                    if (profileMsg) {
                        profileMsg.className = "msg msg-error";
                        profileMsg.innerHTML = "❌ Ism kamida 2 ta harf bo'lishi kerak";
                        profileMsg.style.display = "block";
                    }
                    return;
                }

                if (phone && !/^[\d\s\+\-\(\)]{9,}$/.test(phone)) {
                    if (profileMsg) {
                        profileMsg.className = "msg msg-error";
                        profileMsg.innerHTML = "❌ Telefon raqam noto'g'ri formatda";
                        profileMsg.style.display = "block";
                    }
                    return;
                }

                // Update student
                student.fullName = name;
                student.phone = phone;
                student.birthDate = editBirthdate.value;

                db.students.update(student);
                db.logActivity("profile_update", student.fullName, "Profil yangilandi");

                // Update view
                if (viewName) viewName.textContent = student.fullName;
                if (viewPhone) viewPhone.textContent = student.phone || "—";
                if (viewBirthdate) viewBirthdate.textContent = student.birthDate || "—";
                if (profileName) profileName.textContent = student.fullName;

                // Show success
                if (profileMsg) {
                    profileMsg.className = "msg msg-success";
                    profileMsg.innerHTML = "✅ Profil muvaffaqiyatli yangilandi!";
                    profileMsg.style.display = "block";
                    setTimeout(() => { profileMsg.style.display = "none"; }, 3000);
                }

                // Switch back to view
                profileView.style.display = "block";
                profileEdit.style.display = "none";
                editBtn.style.display = "inline-flex";
            });
        }

        // ===== PHOTO UPLOAD =====
        const photoInput = document.getElementById("photo-upload-input");
        const photoImg = document.getElementById("profile-photo-img");
        const photoPlaceholder = document.getElementById("profile-photo-placeholder");
        const photoStatus = document.getElementById("photo-upload-status");

        // Load existing photo
        if (student.photoURL && photoImg) {
            photoImg.src = student.photoURL;
            photoImg.style.display = "block";
            if (photoPlaceholder) photoPlaceholder.style.display = "none";
        }

        if (photoInput) {
            photoInput.addEventListener("change", async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Validate file
                if (!file.type.startsWith("image/")) {
                    if (photoStatus) {
                        photoStatus.className = "upload-status error";
                        photoStatus.textContent = "❌ Faqat rasm fayllari";
                    }
                    return;
                }

                if (file.size > 2 * 1024 * 1024) {
                    if (photoStatus) {
                        photoStatus.className = "upload-status error";
                        photoStatus.textContent = "❌ Rasm 2MB dan kichik bo'lishi kerak";
                    }
                    return;
                }

                // Show loading
                if (photoStatus) {
                    photoStatus.className = "upload-status loading";
                    photoStatus.textContent = "⏳ Yuklanmoqda...";
                }

                // Convert to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        const response = await fetch("http://localhost:3001/api/upload-profile", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                studentId: student.id,
                                imageData: reader.result
                            })
                        });
                        const data = await response.json();

                        if (data.success) {
                            // Update UI
                            if (photoImg) {
                                photoImg.src = data.url || reader.result;
                                photoImg.style.display = "block";
                            }
                            if (photoPlaceholder) photoPlaceholder.style.display = "none";

                            // Save to student
                            student.photoURL = data.url || reader.result;
                            db.students.update(student);

                            if (photoStatus) {
                                photoStatus.className = "upload-status success";
                                photoStatus.textContent = "✅ Rasm yuklandi!";
                                setTimeout(() => { photoStatus.textContent = ""; }, 3000);
                            }
                        } else {
                            throw new Error(data.message);
                        }
                    } catch (error) {
                        // Fallback - save locally
                        if (photoImg) {
                            photoImg.src = reader.result;
                            photoImg.style.display = "block";
                        }
                        if (photoPlaceholder) photoPlaceholder.style.display = "none";

                        student.photoURL = reader.result;
                        db.students.update(student);

                        if (photoStatus) {
                            photoStatus.className = "upload-status success";
                            photoStatus.textContent = "✅ Rasm saqlandi (local)";
                            setTimeout(() => { photoStatus.textContent = ""; }, 3000);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        // Load progress and modules
        loadProgress(student, db);
        loadCertificate(student, db);
    }

    // =========================
    // PROGRESS
    // =========================
    function loadProgress(student, db) {
        // Demo progress data
        const progress = student.progress || 45;
        const lessonsCompleted = Math.floor(progress * 0.3);
        const videosWatched = Math.floor(progress * 0.2);
        const testsPassed = Math.floor(progress * 0.1);

        // Update progress display
        const progressValue = document.getElementById("progress-value");
        const progressCircle = document.getElementById("progress-circle");
        const lessonsEl = document.getElementById("lessons-completed");
        const videosEl = document.getElementById("videos-watched");
        const testsEl = document.getElementById("tests-passed");

        if (progressValue) progressValue.textContent = progress + "%";
        if (progressCircle) {
            const offset = 283 - (283 * progress / 100);
            progressCircle.style.strokeDashoffset = offset;
            progressCircle.style.stroke = progress >= 80 ? "#10b981" : "#3b82f6";
        }
        if (lessonsEl) lessonsEl.textContent = lessonsCompleted;
        if (videosEl) videosEl.textContent = videosWatched;
        if (testsEl) testsEl.textContent = testsPassed;

        // Load modules
        const modulesContainer = document.getElementById("modules-container");
        if (modulesContainer) {
            const course = db.courses.getById(student.courseId);
            const modules = getModulesForCourse(course?.name || "Frontend");

            modulesContainer.innerHTML = modules.map((mod, i) => {
                const modProgress = Math.max(0, Math.min(100, progress - (i * 20) + 20));
                return `
                    <div class="module-item">
                        <div class="module-info">
                            <span class="module-icon">${mod.icon}</span>
                            <span class="module-name">${mod.name}</span>
                        </div>
                        <div class="module-progress">
                            <div class="module-progress-bar">
                                <div class="module-progress-fill" style="width: ${modProgress}%"></div>
                            </div>
                            <div class="module-progress-text">${modProgress}%</div>
                        </div>
                    </div>
                `;
            }).join("");
        }
    }

    function getModulesForCourse(courseName) {
        const modules = {
            "Frontend": [
                { icon: "📄", name: "HTML asoslari" },
                { icon: "🎨", name: "CSS va flexbox" },
                { icon: "⚡", name: "JavaScript" },
                { icon: "⚛️", name: "React.js" },
                { icon: "🚀", name: "Loyiha" }
            ],
            "Python": [
                { icon: "🐍", name: "Python asoslari" },
                { icon: "📊", name: "Data types" },
                { icon: "🔧", name: "Functions va OOP" },
                { icon: "🌐", name: "Django/Flask" },
                { icon: "🚀", name: "Loyiha" }
            ],
            default: [
                { icon: "📚", name: "Modul 1" },
                { icon: "📖", name: "Modul 2" },
                { icon: "📝", name: "Modul 3" },
                { icon: "🎯", name: "Modul 4" },
                { icon: "🚀", name: "Final loyiha" }
            ]
        };
        return modules[courseName] || modules.default;
    }

    // =========================
    // CERTIFICATE
    // =========================
    function loadCertificate(student, db) {
        const progress = student.progress || 45;
        const certLocked = document.getElementById("cert-locked");
        const certReady = document.getElementById("cert-ready");
        const certProgressFill = document.getElementById("cert-progress-fill");
        const certProgressText = document.getElementById("cert-progress-text");
        const downloadBtn = document.getElementById("download-cert-btn");

        if (certProgressFill) certProgressFill.style.width = progress + "%";
        if (certProgressText) certProgressText.textContent = `${progress}% / 100%`;

        if (progress >= 100) {
            if (certLocked) certLocked.style.display = "none";
            if (certReady) certReady.style.display = "block";
        }

        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                generateCertificate(student, db);
            });
        }
    }

    function generateCertificate(student, db) {
        const course = db.courses.getById(student.courseId);
        const certContent = `
            IT CENTER
            ═══════════════════════════════
            SERTIFIKAT
            
            ${student.fullName}
            
            "${course?.name || "IT"}" kursini
            muvaffaqiyatli tugatganligi tasdiqlanadi.
            
            Sana: ${new Date().toLocaleDateString("uz-UZ")}
            ═══════════════════════════════
        `;

        // Simple text download (in production would be PDF)
        const blob = new Blob([certContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Sertifikat_${student.fullName.replace(/\s/g, "_")}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        alert("📥 Sertifikat yuklab olindi!\n\n(Demo: Haqiqiy PDF keyinroq qo'shiladi)");
    }

    function getStatusClass(status) {
        const classes = {
            active: "status-paid",
            frozen: "status-partial",
            graduated: "status-paid",
            applied: "status-partial"
        };
        return classes[status] || "";
    }

    function getStatusLabel(status) {
        const labels = {
            active: "Faol",
            frozen: "Muzlatilgan",
            graduated: "Bitirgan",
            applied: "Ariza bergan"
        };
        return labels[status] || status;
    }

    function getPaymentStatusClass(status) {
        const classes = {
            paid: "status-paid",
            partial: "status-partial",
            debt: "status-unpaid",
            unpaid: "status-unpaid"
        };
        return classes[status] || "";
    }

    function getPaymentStatusLabel(status) {
        const labels = {
            paid: "To'langan",
            partial: "Qisman",
            debt: "Qarzdor",
            unpaid: "To'lanmagan"
        };
        return labels[status] || status;
    }

    // =========================
    // STATS
    // =========================
    function loadStats(student, db) {
        const payments = db.payments.getAll().filter(p => p.studentId === student.id);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const course = db.courses.getById(student.courseId);
        const coursePrice = course?.price || 0;

        const attendance = db.attendance.getAll();
        const groupAttendance = attendance.filter(a => a.groupId === student.groupId);
        const avgAttendance = groupAttendance.length > 0
            ? Math.round(groupAttendance.reduce((sum, a) => sum + a.percentage, 0) / groupAttendance.length)
            : 0;

        // Update stat cards
        const statPayments = document.getElementById("stat-payments");
        const statAttendance = document.getElementById("stat-attendance");
        const statProgress = document.getElementById("stat-progress");
        const statLessons = document.getElementById("stat-lessons");

        if (statPayments) statPayments.textContent = formatCurrency(totalPaid);
        if (statAttendance) statAttendance.textContent = `${avgAttendance}%`;
        if (statProgress) statProgress.textContent = "45%";
        if (statLessons) statLessons.textContent = groupAttendance.length;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
    }

    // =========================
    // SCHEDULE
    // =========================
    function loadSchedule(student, db) {
        const scheduleTable = document.getElementById("schedule-table");
        if (!scheduleTable) return;

        const group = db.groups.getById(student.groupId);
        if (!group) {
            scheduleTable.innerHTML = `<tr><td colspan="4" class="empty-message">Jadval topilmadi</td></tr>`;
            return;
        }

        const course = db.courses.getById(student.courseId);
        const mentor = db.mentors.getById(group.mentorId);

        const days = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
        const scheduleInfo = group.schedule || "Dush / Chor / Jum • 18:00";

        // Parse schedule
        const [daysStr, time] = scheduleInfo.split("•").map(s => s.trim());
        const activeDays = daysStr.split("/").map(d => d.trim());

        scheduleTable.innerHTML = days.map(day => {
            const isActive = activeDays.some(d => day.toLowerCase().startsWith(d.toLowerCase().substring(0, 3)));
            return `
        <tr class="${isActive ? 'schedule-active' : ''}">
          <td>${day}</td>
          <td>${isActive ? time || "18:00" : "—"}</td>
          <td>${isActive ? (course?.name || "—") : "—"}</td>
          <td>${isActive ? (mentor?.name || "—") : "—"}</td>
        </tr>
      `;
        }).join("");
    }

    // =========================
    // PAYMENTS
    // =========================
    function loadPayments(student, db) {
        const paymentsTable = document.getElementById("payments-table");
        if (!paymentsTable) return;

        const payments = db.payments.getAll().filter(p => p.studentId === student.id);

        if (payments.length === 0) {
            paymentsTable.innerHTML = `<tr><td colspan="4" class="empty-message">To'lovlar topilmadi</td></tr>`;
            return;
        }

        paymentsTable.innerHTML = payments.map(p => `
      <tr>
        <td>${p.date}</td>
        <td>${formatCurrency(p.amount)}</td>
        <td>${p.method === "cash" ? "💵 Naqd" : p.method === "card" ? "💳 Karta" : p.method}</td>
        <td><span class="status-badge status-paid">${p.status === "confirmed" ? "Tasdiqlangan" : "Kutilmoqda"}</span></td>
      </tr>
    `).join("");
    }

    // =========================
    // ATTENDANCE
    // =========================
    function loadAttendance(student, db) {
        const attendanceList = document.getElementById("attendance-list");
        if (!attendanceList) return;

        const attendance = db.attendance.getAll()
            .filter(a => a.groupId === student.groupId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (attendance.length === 0) {
            attendanceList.innerHTML = `<div class="empty-message">Davomat ma'lumotlari topilmadi</div>`;
            return;
        }

        attendanceList.innerHTML = attendance.map(a => `
      <div class="attendance-item">
        <div class="attendance-date">${formatDate(a.date)}</div>
        <div class="attendance-stats">
          <span>${a.presentStudents}/${a.totalStudents}</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${a.percentage}%"></div>
          </div>
          <span>${a.percentage}%</span>
        </div>
      </div>
    `).join("");
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });
    }

    // =========================
    // NAVIGATION
    // =========================
    function setupNavigation() {
        const navItems = document.querySelectorAll(".nav-item[data-section]");
        const sections = document.querySelectorAll(".student-section");

        navItems.forEach(item => {
            item.addEventListener("click", () => {
                const sectionId = item.dataset.section;

                // Update nav
                navItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                // Update sections
                sections.forEach(s => {
                    s.classList.remove("active");
                    if (s.id === sectionId) {
                        s.classList.add("active");
                    }
                });
            });
        });
    }

    // =========================
    // MOBILE MENU
    // =========================
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.querySelector(".student-sidebar");

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });

        // Close on nav item click
        document.querySelectorAll(".nav-item").forEach(item => {
            item.addEventListener("click", () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove("open");
                }
            });
        });
    }

    // Expose logout for onclick
    window.studentLogout = logout;

})();
