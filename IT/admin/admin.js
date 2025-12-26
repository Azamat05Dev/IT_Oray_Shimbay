// IT CENTER – ADMIN PANEL FRONTEND LOGIC
// LocalStorage asosidagi database bilan ishlaydi (db.js)

// ==============================
// YORDAMCHI FUNKSIYALAR
// ==============================

// LocalStorage orqali ishlash (backend o'rniga)
function adminApiRequest(path, options = {}) {
  // ITCenterDB orqali LocalStorage bilan ishlash
  return new Promise((resolve, reject) => {
    try {
      const db = window.ITCenterDB;
      if (!db) {
        reject(new Error("Database yuklanmadi"));
        return;
      }

      const method = (options.method || "GET").toUpperCase();
      const body = options.body ? JSON.parse(options.body) : null;

      // Route handling
      if (path === "/analytics" && method === "GET") {
        const stats = db.getStats();
        resolve({
          kpi: {
            "1200": stats.totalStudents,
            "35": stats.activeGroups,
            "18400000": stats.totalPayments,
            "14": stats.debtStudents
          },
          paymentsTrend: [12, 15, 18, 14, 20, 22],
          coursesDistribution: [
            { label: "Frontend", value: 45 },
            { label: "Python", value: 30 },
            { label: "Kids", value: 25 }
          ]
        });
      }
      else if (path === "/students" && method === "GET") {
        const students = db.students.getAll();
        const courses = db.courses.getAll();
        const groups = db.groups.getAll();
        resolve(students.map(s => {
          const course = courses.find(c => c.id === s.courseId);
          const group = groups.find(g => g.id === s.groupId);
          return {
            id: `ST-${String(s.id).padStart(4, '0')}`,
            fullName: s.fullName,
            phone: s.phone,
            course: course?.name || s.courseId,
            group: group?.id || s.groupId,
            status: s.status === "active" ? "Aktiv" : s.status === "frozen" ? "Muzlatilgan" : "Bitirgan",
            paymentStatus: s.paymentStatus === "paid" ? "To'langan" : s.paymentStatus === "partial" ? "Qisman" : "Qarzdor"
          };
        }));
      }
      else if (path === "/groups" && method === "GET") {
        const groups = db.groups.getAll();
        const courses = db.courses.getAll();
        const mentors = db.mentors.getAll();
        resolve(groups.map(g => {
          const course = courses.find(c => c.id === g.courseId);
          const mentor = mentors.find(m => m.id === g.mentorId);
          return {
            id: g.id,
            course: course?.name || "",
            mentor: mentor?.name || "",
            schedule: g.schedule,
            room: g.room,
            count: g.studentCount,
            capacity: g.capacity,
            status: g.status === "active" ? "Aktiv" : g.status === "full" ? "To'la" : "Yangi to'planyapti"
          };
        }));
      }
      else if (path === "/courses" && method === "GET") {
        resolve(db.courses.getAll());
      }
      else if (path === "/mentors" && method === "GET") {
        resolve(db.mentors.getAll());
      }
      else if (path.startsWith("/mentors") && method === "POST") {
        const newMentor = db.mentors.add(body);
        resolve(newMentor);
      }
      else if (path.startsWith("/mentors/") && method === "PUT") {
        const id = parseInt(path.split("/")[2]);
        const updated = db.mentors.update(id, body);
        resolve(updated);
      }
      else if (path.startsWith("/mentors/") && method === "DELETE") {
        const id = parseInt(path.split("/")[2]);
        db.mentors.delete(id);
        resolve({ success: true });
      }
      else if (path.startsWith("/courses") && method === "POST") {
        const newCourse = db.courses.add(body);
        resolve(newCourse);
      }
      else if (path.startsWith("/courses/") && method === "PUT") {
        const id = parseInt(path.split("/")[2]);
        const updated = db.courses.update(id, body);
        resolve(updated);
      }
      else if (path.startsWith("/groups") && method === "POST") {
        const newGroup = db.groups.add({ ...body, id: body.name });
        resolve(newGroup);
      }
      else if (path.startsWith("/groups/") && method === "PUT") {
        const id = path.split("/")[2];
        const updated = db.groups.update(id, body);
        resolve(updated);
      }
      else if (path === "/applications" && method === "GET") {
        const apps = db.applications.getAll();
        resolve(apps.map(a => ({
          id: a.id,
          name: a.fullName,
          phone: a.phone,
          course: a.course,
          source: a.format,
          status: a.status,
          statusText: a.status === "new" ? "Yangi" : a.status === "called" ? "Qo'ng'iroq qilindi" : a.status === "enrolled" ? "Guruhga qo'shilgan" : "Yopilgan",
          statusClass: `admin-status-${a.status}`
        })));
      }
      else if (path === "/sync" && method === "POST") {
        db.reload();
        resolve({ success: true });
      }
      else if (path === "/notifications" && method === "GET") {
        resolve([
          { title: "Yangi tez ariza", text: "Mohira Qodirova • Frontend", time: "Bir necha soniya oldin", unread: true }
        ]);
      }
      else if (path === "/notifications/clear" && method === "POST") {
        resolve({ success: true });
      }
      else if (path.startsWith("/students/") && method === "GET") {
        const id = parseInt(path.split("/")[2].replace("ST-", ""));
        const student = db.students.getById(id);
        if (student) {
          resolve({
            ...student,
            id: `ST-${String(student.id).padStart(4, '0')}`,
            payments: db.payments.getAll().filter(p => p.studentId === student.id).map(p => ({
              amount: p.amount.toLocaleString(),
              method: p.method,
              date: p.date
            }))
          });
        } else {
          reject(new Error("Talaba topilmadi"));
        }
      }
      else {
        // Default empty response
        resolve([]);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function adminShowToast(message, type = "info") {
  // type: "info" | "success" | "error"
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.style.position = "fixed";
    toast.style.zIndex = "9999";
    toast.style.right = "18px";
    toast.style.bottom = "18px";
    toast.style.maxWidth = "360px";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "999px";
    toast.style.fontSize = "0.85rem";
    toast.style.backdropFilter = "blur(12px)";
    toast.style.boxShadow = "0 18px 40px rgba(15,23,42,0.95)";
    toast.style.display = "none";
    document.body.appendChild(toast);
  }

  toast.textContent = message;

  const colors = {
    info: "rgba(59,130,246,0.98)",
    success: "rgba(22,163,74,0.98)",
    error: "rgba(220,38,38,0.98)",
  };

  toast.style.background = colors[type] || colors.info;
  toast.style.color = "#f9fafb";
  toast.style.border = "1px solid rgba(148,163,184,0.7)";
  toast.style.display = "block";
  toast.style.opacity = "0";

  requestAnimationFrame(() => {
    toast.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    setTimeout(() => {
      toast.style.display = "none";
    }, 180);
  }, 2600);
}

// ==============================
// ASOSIY ADMIN LOGIKA
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Loader
  const adminLoader = document.getElementById("admin-loader");

  // Sidebar / sections
  const menuItems = document.querySelectorAll(".admin-menu-item");
  const sections = document.querySelectorAll(".admin-section");
  const breadcrumb = document.getElementById("admin-breadcrumb");

  // Topbar
  const statusIndicator = document.getElementById("admin-status-indicator");
  const dateEl = document.getElementById("admin-date");
  const timeEl = document.getElementById("admin-time");
  const quickSyncBtn = document.getElementById("admin-quick-sync");
  const goPortalBtn = document.getElementById("admin-go-portal");
  const logoutBtn = document.getElementById("admin-logout");

  // Quick search
  const quickSearchInput = document.getElementById("admin-quick-search-input");
  const quickSearchResults = document.getElementById("admin-quick-search-results");

  // Notifications
  const notifyBell = document.getElementById("admin-notify-bell");
  const bellDot = document.getElementById("admin-bell-dot");
  const notifyPanel = document.getElementById("admin-notify-panel");
  const notifyList = document.getElementById("admin-notify-list");
  const notifyClearBtn = document.getElementById("admin-notify-clear");

  // ===== LOAD LOGGED-IN ADMIN INFO FROM SESSION =====
  const adminSession = JSON.parse(localStorage.getItem("admin_session") || "null");
  if (adminSession) {
    const roleLabels = {
      "super_admin": "👑 Super Admin",
      "admin": "🛡️ Admin",
      "viewer": "👁️ Viewer"
    };
    const adminName = adminSession.adminName || adminSession.username || "Admin";
    const adminRole = roleLabels[adminSession.role] || adminSession.role || "Admin";
    const avatarLetter = adminName.charAt(0).toUpperCase();

    // Update sidebar
    const sidebarName = document.getElementById("sidebar-admin-name");
    const sidebarRole = document.getElementById("sidebar-admin-role");
    const sidebarAvatar = document.getElementById("sidebar-admin-avatar");
    if (sidebarName) sidebarName.textContent = adminName;
    if (sidebarRole) sidebarRole.textContent = adminRole;
    if (sidebarAvatar) sidebarAvatar.textContent = avatarLetter;

    // Update topbar
    const topbarAvatar = document.getElementById("topbar-admin-avatar");
    if (topbarAvatar) topbarAvatar.textContent = avatarLetter;

    // ===== ROLE-BASED ACCESS CONTROL =====
    const userRole = adminSession.role || "viewer";

    // Hide menu items based on role
    document.querySelectorAll(".admin-menu-item[data-role]").forEach(item => {
      const allowedRoles = item.dataset.role;
      if (allowedRoles === "all") return; // Visible to all

      const roleList = allowedRoles.split(",");
      if (!roleList.includes(userRole)) {
        item.style.display = "none"; // Hide this menu item
      }
    });

    // Add role class to body for CSS targeting
    document.body.classList.add("role-" + userRole);

    // For viewers: block all clicks on action buttons
    if (userRole === "viewer") {
      document.addEventListener("click", (e) => {
        const target = e.target.closest("button, .admin-table-action, [onclick]");
        if (target && (
          target.textContent.includes("Tahrirlash") ||
          target.textContent.includes("O'chirish") ||
          target.textContent.includes("Saqlash") ||
          target.textContent.includes("Qo'shish") ||
          target.textContent.includes("✏️") ||
          target.textContent.includes("🗑️") ||
          target.textContent.includes("💾") ||
          target.textContent.includes("➕")
        )) {
          e.preventDefault();
          e.stopPropagation();
          adminShowToast("⚠️ Sizda tahrirlash huquqi yo'q", "error");
          return false;
        }
      }, true);
    }
  } else {
    // No session - show default profile
    const sidebarName = document.getElementById("sidebar-admin-name");
    const sidebarRole = document.getElementById("sidebar-admin-role");
    const sidebarAvatar = document.getElementById("sidebar-admin-avatar");
    if (sidebarName) sidebarName.textContent = "Admin";
    if (sidebarRole) sidebarRole.textContent = "🔑 Active";
    if (sidebarAvatar) sidebarAvatar.textContent = "A";
  }

  // Dashboard KPI / charts / applications
  const kpiValues = document.querySelectorAll(".admin-kpi-value[data-kpi-target]");
  const applicationsSkeleton = document.getElementById("applications-skeleton");
  const applicationsTableBody = document.querySelector("#applications-table tbody");
  const applicationsStatusFilter = document.getElementById("applications-status");
  const applicationsCourseFilter = document.getElementById("applications-course");
  const chartPayments = document.getElementById("chart-payments");
  const chartCourses = document.getElementById("chart-courses");
  const quickActionButtons = document.querySelectorAll("[data-section-jump]");

  // Students
  const studentsSkeleton = document.getElementById("students-skeleton");
  const studentsTableBody = document.querySelector("#students-table tbody");
  const studentsSearch = document.getElementById("students-search");
  const studentsCourseFilter = document.getElementById("students-course");
  const studentsStatusFilter = document.getElementById("students-status");
  const studentsGroupFilter = document.getElementById("students-group");
  const studentsPaymentFilter = document.getElementById("students-payment");
  const studentsPresetButtons = document.querySelectorAll("[data-students-preset]");

  // Student drawer
  const studentDrawerOverlay = document.getElementById("student-drawer-overlay");
  const studentDrawerClose = document.getElementById("student-drawer-close");
  const drawerName = document.getElementById("drawer-student-name");
  const drawerId = document.getElementById("drawer-student-id");
  const drawerPhone = document.getElementById("drawer-student-phone");
  const drawerCourse = document.getElementById("drawer-student-course");
  const drawerStatus = document.getElementById("drawer-student-status");
  const drawerPayment = document.getElementById("drawer-student-payment");
  const drawerPaymentsList = document.getElementById("drawer-student-payments");

  // Groups
  const groupsTableBody = document.querySelector("#groups-table tbody");
  const groupsSearch = document.getElementById("groups-search");
  const groupsCourseFilter = document.getElementById("groups-course");
  const addGroupBtn = document.getElementById("add-group-btn");

  // Courses
  const coursesTableBody = document.querySelector("#courses-table tbody");
  const courseEditForm = document.getElementById("course-edit-form");
  const courseNameInput = document.getElementById("course-name");
  const courseDurationInput = document.getElementById("course-duration");
  const coursePriceInput = document.getElementById("course-price");
  const courseStatusSelect = document.getElementById("course-status");
  const courseEditMessage = document.getElementById("course-edit-message");
  const addCourseBtn = document.getElementById("add-course-btn");
  let currentEditedCourseId = null;

  // Mentors
  const mentorsTableBody = document.querySelector("#mentors-table tbody");
  const mentorsSearch = document.getElementById("mentors-search");
  const addMentorBtn = document.getElementById("add-mentor-btn");

  // Payments
  const paymentAddForm = document.getElementById("payment-add-form");
  const paymentStudentInput = document.getElementById("payment-student-id");
  const paymentAmountInput = document.getElementById("payment-amount");
  const paymentMethodSelect = document.getElementById("payment-method");
  const paymentAddMessage = document.getElementById("payment-add-message");

  // Settings
  const settingsPortalForm = document.getElementById("settings-portal-form");
  const settingsPortalMsg = document.getElementById("settings-portal-message");
  const settingsSecurityForm = document.getElementById("settings-security-form");
  const settingsSecurityMsg = document.getElementById("settings-security-message");

  // ===== Loader =====
  if (adminLoader) {
    setTimeout(() => {
      adminLoader.style.display = "none";
    }, 600);
  }

  // =========================
  // DARK/LIGHT THEMES (REMOVED)
  // =========================
  // Always use dark theme for admin as requested
  body.classList.remove("light-theme");

  // =========================
  // BACKUP / RESTORE
  // =========================
  window.backupAllData = function () {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("it_") || key.startsWith("ITCenter")) {
        data[key] = localStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IT_Center_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    adminShowToast("💾 Backup yuklab olindi!", "success");
  };

  window.restoreFromBackup = function (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, data[key]);
        });
        adminShowToast("✅ Ma'lumotlar tiklandi! Sahifa yangilanmoqda...", "success");
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        adminShowToast("❌ Fayl noto'g'ri formatda", "error");
      }
    };
    reader.readAsText(file);
  };

  // =========================
  // REAL SMS API
  // =========================
  window.sendRealSMS = async function (phone, message) {
    try {
      const response = await fetch("http://localhost:3001/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message })
      });
      const data = await response.json();
      if (data.success) {
        adminShowToast(data.demo ? "📱 SMS yuborildi (Demo)" : "📱 SMS yuborildi!", "success");
        return true;
      }
    } catch (error) {
      console.error("SMS error:", error);
      adminShowToast("📱 SMS yuborildi (Offline demo)", "info");
    }
    return false;
  };

  // =========================
  // PASSWORD FUNCTIONS (SIMPLE - for LocalStorage only)
  // =========================
  window.hashPasswordServer = async function (password) {
    // Simple encoding for local development (NOT for production!)
    return btoa(password);
  };

  window.verifyPasswordServer = async function (password, storedPassword) {
    // Direct comparison for plain text passwords
    return password === storedPassword;
  };

  // ===== Online/offline status =====
  function updateOnlineStatus() {
    if (!statusIndicator) return;
    if (navigator.onLine) {
      statusIndicator.dataset.status = "online";
      statusIndicator.textContent = "Online";
    } else {
      statusIndicator.dataset.status = "offline";
      statusIndicator.textContent = "Offline";
    }
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();

  // ===== Sana / vaqt =====
  function updateDateTime() {
    if (!dateEl || !timeEl) return;
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    const timeFormatter = new Intl.DateTimeFormat("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
    dateEl.textContent = dateFormatter.format(now);
    timeEl.textContent = timeFormatter.format(now);
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // ===== Online Users Counter =====
  const onlineUsersEl = document.getElementById("admin-online-users");

  function updateOnlineUsers() {
    if (!onlineUsersEl) return;

    // Centralized tracking in ITCenterDB
    ITCenterDB.trackOnlineUser('admin');

    const onlineCount = ITCenterDB.getOnlineCount();
    onlineUsersEl.textContent = `👥 ${onlineCount}`;
    onlineUsersEl.title = `Hozir saytda: ${onlineCount} foydalanuvchi`;
  }

  updateOnlineUsers();
  setInterval(updateOnlineUsers, 15000); // Update every 15 seconds

  // ===== Section switch + breadcrumb =====
  function activateSection(sectionKey) {
    sections.forEach((sec) => {
      const idMatch = sec.id === `admin-section-${sectionKey}`;
      sec.classList.toggle("admin-section-active", idMatch);
    });

    menuItems.forEach((item) => {
      const match = item.dataset.section === sectionKey;
      item.classList.toggle("admin-menu-item-active", match);
    });

    const activeSection = document.getElementById(`admin-section-${sectionKey}`);
    if (activeSection && breadcrumb) {
      const name = activeSection.dataset.sectionName || "";
      breadcrumb.innerHTML = `Admin panel / <span>${name}</span>`;
    }

    if (sectionKey === "students") loadStudentsIfNeeded();
    if (sectionKey === "groups") loadGroupsIfNeeded();
    if (sectionKey === "courses") loadCoursesIfNeeded();
    if (sectionKey === "mentors") loadMentorsIfNeeded();
    if (sectionKey === "applications") loadApplicationsIfNeeded();
    if (sectionKey === "payments" && typeof loadPaymentsData === 'function') loadPaymentsData();
    if (sectionKey === "registrations" && typeof renderRegistrationsTable === 'function') renderRegistrationsTable();
  }

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.section;
      if (key) activateSection(key);
    });
  });

  // Default – dashboard
  activateSection("dashboard");

  // ===== Portalga qaytish / logout =====
  if (goPortalBtn) {
    goPortalBtn.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("itc_token");
      localStorage.removeItem("itc_role");
      localStorage.removeItem("itc_student_id");
      window.location.href = "../index.html";
    });
  }

  // ===== Quick sync =====
  if (quickSyncBtn) {
    quickSyncBtn.addEventListener("click", async () => {
      const original = quickSyncBtn.textContent;
      quickSyncBtn.disabled = true;
      quickSyncBtn.textContent = "Sinxronlanmoqda...";
      try {
        await adminApiRequest("/sync", { method: "POST" });
        adminShowToast("Ma’lumotlar muvaffaqiyatli sinxronlandi.", "success");
        loadDashboardAnalytics();
        reloadAllData();
      } catch (err) {
        adminShowToast(err.message || "Sinxronlashda xatolik.", "error");
      } finally {
        quickSyncBtn.disabled = false;
        quickSyncBtn.textContent = original;
      }
    });
  }

  // ===== Quick search (Ctrl+K) =====
  if (quickSearchInput && quickSearchResults) {
    let quickSearchTimeout = null;

    async function performQuickSearch(term) {
      const q = term.toLowerCase().trim();
      quickSearchResults.innerHTML = "";
      if (!q) {
        quickSearchResults.classList.remove("visible");
        return;
      }

      try {
        const results = await adminApiRequest(`/search?q=${encodeURIComponent(q)}`, {
          method: "GET",
        });

        if (!Array.isArray(results) || !results.length) {
          const emptyEl = document.createElement("div");
          emptyEl.className = "admin-quick-search-item";
          emptyEl.innerHTML = `
            <div class="admin-quick-search-item-title">Hech narsa topilmadi</div>
            <div class="admin-quick-search-item-sub">Qidiruvni aniqlashtiring.</div>
          `;
          quickSearchResults.appendChild(emptyEl);
        } else {
          results.forEach((item) => {
            const el = document.createElement("div");
            el.className = "admin-quick-search-item";
            el.innerHTML = `
              <div class="admin-quick-search-item-title">${item.title}</div>
              <div class="admin-quick-search-item-sub">${item.type} • ${item.sub || ""}</div>
            `;
            el.addEventListener("click", () => {
              quickSearchResults.classList.remove("visible");
              quickSearchInput.value = "";
              if (item.section) activateSection(item.section);
            });
            quickSearchResults.appendChild(el);
          });
        }
        quickSearchResults.classList.add("visible");
      } catch (err) {
        console.error(err);
        quickSearchResults.classList.remove("visible");
        adminShowToast("Qidiruv xizmati bilan bog‘lanib bo‘lmadi.", "error");
      }
    }

    quickSearchInput.addEventListener("input", () => {
      clearTimeout(quickSearchTimeout);
      const value = quickSearchInput.value;
      quickSearchTimeout = setTimeout(() => performQuickSearch(value), 250);
    });

    quickSearchInput.addEventListener("blur", () => {
      setTimeout(() => {
        quickSearchResults.classList.remove("visible");
      }, 120);
    });

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        quickSearchInput.focus();
        quickSearchInput.select();
      }
    });
  }

  // ===== Notifications (admin bell) =====
  let notifyOpen = false;

  async function loadNotifications() {
    if (!notifyList) return;
    notifyList.innerHTML = "";
    try {
      const items = await adminApiRequest("/notifications", { method: "GET" });
      if (!Array.isArray(items) || !items.length) {
        const li = document.createElement("li");
        li.className = "admin-notify-item";
        li.innerHTML = `
          <div class="admin-notify-title">Hozircha bildirishnoma yo‘q</div>
          <div class="admin-notify-time"></div>
        `;
        notifyList.appendChild(li);
      } else {
        items.forEach((n) => {
          const li = document.createElement("li");
          li.className =
            "admin-notify-item" + (n.unread ? " admin-notify-item-unread" : "");
          li.innerHTML = `
            <div class="admin-notify-title">${n.title || "Bildirishnoma"}</div>
            <div class="admin-notify-sub">${n.text || ""}</div>
            <div class="admin-notify-time">${n.time || ""}</div>
          `;
          notifyList.appendChild(li);
        });
      }
      if (bellDot) bellDot.classList.remove("visible");
    } catch (err) {
      adminShowToast("Bildirishnomalarni yuklashda xatolik.", "error");
    }
  }

  function toggleNotifyPanel() {
    if (!notifyPanel) return;
    notifyOpen = !notifyOpen;
    if (notifyOpen) {
      notifyPanel.classList.add("open");
      loadNotifications();
    } else {
      notifyPanel.classList.remove("open");
    }
  }

  if (notifyBell && notifyPanel) {
    notifyBell.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleNotifyPanel();
    });

    document.addEventListener("click", (e) => {
      if (!notifyPanel.contains(e.target) && e.target !== notifyBell) {
        notifyPanel.classList.remove("open");
        notifyOpen = false;
      }
    });
  }

  if (notifyClearBtn && notifyList) {
    notifyClearBtn.addEventListener("click", async () => {
      try {
        await adminApiRequest("/notifications/clear", { method: "POST" });
        notifyList.innerHTML = "";
        const li = document.createElement("li");
        li.className = "admin-notify-item";
        li.innerHTML = `<div class="admin-notify-title">Bildirishnomalar tozalandi</div>`;
        notifyList.appendChild(li);
        if (bellDot) bellDot.classList.remove("visible");
      } catch (err) {
        adminShowToast("Bildirishnomalarni tozalashda xatolik.", "error");
      }
    });
  }

  // ===== Quick section jump =====
  quickActionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.sectionJump;
      if (target) activateSection(target);
    });
  });

  // =========================
  // DASHBOARD: analytics
  // =========================
  function animateKpi(el, target, duration = 1200) {
    const start = performance.now();
    const startValue = 0;

    function frame(time) {
      const progress = Math.min((time - start) / duration, 1);
      const value = Math.floor(startValue + (target - startValue) * progress);

      el.textContent =
        target > 1000000 ? value.toLocaleString("uz-UZ") : value.toString();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent =
          target > 1000000 ? target.toLocaleString("uz-UZ") : target.toString();
      }
    }

    requestAnimationFrame(frame);
  }

  function renderMiniLineChart(svgEl, numbers) {
    if (!svgEl || !Array.isArray(numbers) || !numbers.length) return;
    svgEl.innerHTML = "";
    const max = Math.max(...numbers);
    if (max <= 0) return;

    const width = 200;
    const height = 80;
    const stepX = width / (numbers.length - 1 || 1);
    const pathPoints = numbers
      .map((value, idx) => {
        const x = stepX * idx;
        const y = height - (value / max) * (height - 10) - 5;
        return `${x},${y}`;
      })
      .join(" ");

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", pathPoints);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "rgba(96,165,250,0.95)");
    polyline.setAttribute("stroke-width", "2.5");

    svgEl.appendChild(polyline);
  }

  function renderMiniBarChart(svgEl, bars) {
    if (!svgEl || !Array.isArray(bars) || !bars.length) return;
    svgEl.innerHTML = "";
    const maxVal = Math.max(...bars.map((b) => b.value));
    if (maxVal <= 0) return;

    const barWidth = 40;
    const gap = 26;
    let x = 24;

    bars.forEach((item) => {
      const height = (item.value / maxVal) * 60;
      const y = 80 - height - 6;

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", barWidth.toString());
      rect.setAttribute("height", height.toString());
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");
      rect.setAttribute("fill", "rgba(96,165,250,0.95)");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", (x + barWidth / 2).toString());
      label.setAttribute("y", "77");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "8");
      label.setAttribute("fill", "#9ca3af");
      label.textContent = item.label || "";

      svgEl.appendChild(rect);
      svgEl.appendChild(label);

      x += barWidth + gap;
    });
  }

  async function loadDashboardAnalytics() {
    const db = window.ITCenterDB;
    if (!db) return;

    try {
      const stats = db.getStats();
      const students = db.students.getAll();
      const payments = db.payments.getAll();
      const courses = db.courses.getAll();

      // Update KPI cards with real data
      const kpiData = {
        "1200": stats.totalStudents,
        "35": stats.activeGroups,
        "18400000": stats.totalPayments,
        "14": stats.debtStudents
      };

      kpiValues.forEach((el) => {
        const targetKey = el.dataset.kpiTarget;
        const value = kpiData[targetKey];
        if (value !== undefined) {
          animateKpi(el, value);
        }
      });

      // Update KPI meta info
      const kpiCards = document.querySelectorAll(".admin-kpi-card");
      kpiCards.forEach(card => {
        const kpi = card.dataset.kpi;
        const trendEl = card.querySelector(".admin-kpi-trend");
        const noteEl = card.querySelector(".admin-kpi-note");

        if (kpi === "students" && trendEl && noteEl) {
          const activeCount = stats.activeStudents;
          trendEl.textContent = `${activeCount} faol`;
          noteEl.textContent = "Hozirda o'qiyotgan";
        }
        if (kpi === "payments" && trendEl && noteEl) {
          trendEl.textContent = formatCurrency(stats.monthlyPayments);
          noteEl.textContent = "Bu oy tushgan";
        }
        if (kpi === "overdue" && trendEl && noteEl) {
          trendEl.textContent = `${stats.newApplications} yangi`;
          noteEl.textContent = "arizalar kutmoqda";
        }
      });

      // ====== NEW MINI STATS UPDATE ======
      const mentors = db.mentors?.getAll() || [];
      const applications = db.applications?.getAll() || [];
      const activeCourses = courses.filter(c => c.status === 'active').length || courses.length;
      const newApps = applications.filter(a => a.status === 'new').length;

      const statTodayAttendance = document.getElementById("stat-today-attendance");
      const statNewApplications = document.getElementById("stat-new-applications");
      const statCourseCount = document.getElementById("stat-course-count");
      const statMentorCount = document.getElementById("stat-mentor-count");

      if (statTodayAttendance) statTodayAttendance.textContent = `${stats.todayAttendance || 0}%`;
      if (statNewApplications) statNewApplications.textContent = newApps;
      if (statCourseCount) statCourseCount.textContent = activeCourses;
      if (statMentorCount) statMentorCount.textContent = mentors.length;

      // ====== CHART.JS - Payments Chart ======
      const paymentsCanvas = document.getElementById("chart-payments-canvas");
      if (paymentsCanvas && window.Chart) {
        // Destroy existing chart if exists
        if (window.adminPaymentsChart) {
          window.adminPaymentsChart.destroy();
        }
        const monthlyData = {};
        const monthLabels = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
          const label = monthDate.toLocaleDateString('uz-UZ', { month: 'short' });
          monthlyData[key] = 0;
          monthLabels.push(label);
        }

        payments.forEach(p => {
          if (p.date) {
            const [year, month] = p.date.split("-");
            const key = `${year}-${month}`;
            if (monthlyData[key] !== undefined) {
              monthlyData[key] += p.amount || 0;
            }
          }
        });

        window.adminPaymentsChart = new Chart(paymentsCanvas, {
          type: 'line',
          data: {
            labels: monthLabels,
            datasets: [{
              label: "To'lovlar (so'm)",
              data: Object.values(monthlyData),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#3b82f6',
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: { color: '#94a3b8' }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
              }
            }
          }
        });
      }

      // ====== CHART.JS - Courses Distribution ======
      const coursesCanvas = document.getElementById("chart-courses-canvas");
      if (coursesCanvas && window.Chart) {
        // Destroy existing chart if exists
        if (window.adminCoursesChart) {
          window.adminCoursesChart.destroy();
        }

        const courseData = courses.map(c => ({
          name: c.name,
          count: students.filter(s => s.courseId === c.id).length
        }));

        window.adminCoursesChart = new Chart(coursesCanvas, {
          type: 'doughnut',
          data: {
            labels: courseData.map(c => c.name),
            datasets: [{
              data: courseData.map(c => c.count),
              backgroundColor: [
                '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#94a3b8', padding: 16 }
              }
            }
          }
        });
      }

      // Load recent applications to dashboard
      const appsList = document.getElementById("admin-applications-list");
      if (appsList) {
        const recentApps = db.applications.getAll().slice(0, 5);
        appsList.innerHTML = recentApps.map(a => `
          <li class="admin-list-item">
            <div class="admin-list-main">
              <div class="admin-pill admin-pill-course">${a.course}</div>
              <span class="admin-list-title">${a.fullName}</span>
              <span class="admin-list-sub">${a.phone} • ${a.format}</span>
            </div>
            <span class="admin-list-time">${getTimeAgo(a.createdAt)}</span>
          </li>
        `).join("");
      }

      if (applicationsSkeleton) applicationsSkeleton.style.display = "none";
    } catch (err) {
      console.error(err);
      if (applicationsSkeleton) applicationsSkeleton.style.display = "none";
    }
  }

  // Helper for time ago in dashboard
  function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Hozirgina";
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    return `${days} kun oldin`;
  }

  loadDashboardAnalytics();

  // ==============================
  // EXPORT FUNCTIONS (Excel/PDF)
  // ==============================
  function exportToExcel(data, filename) {
    if (!window.XLSX) {
      adminShowToast("Excel kutubxonasi yuklanmadi", "error");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ma'lumotlar");
    XLSX.writeFile(wb, filename);
    adminShowToast(`✅ ${filename} yuklab olindi!`, "success");
  }

  // Export Students
  const exportStudentsBtn = document.getElementById("export-students-excel");
  if (exportStudentsBtn) {
    exportStudentsBtn.addEventListener("click", () => {
      const db = window.ITCenterDB;
      if (!db) return;
      const students = db.students.getAll().map(s => ({
        "Ism": s.fullName,
        "Telefon": s.phone,
        "Email": s.email || "",
        "Guruh": s.groupId,
        "Holat": s.status,
        "To'lov": s.paymentStatus,
        "Sana": s.enrollDate
      }));
      exportToExcel(students, "Talabalar.xlsx");
    });
  }

  // Export Payments
  const exportPaymentsBtn = document.getElementById("export-payments-excel");
  if (exportPaymentsBtn) {
    exportPaymentsBtn.addEventListener("click", () => {
      const db = window.ITCenterDB;
      if (!db) return;
      const payments = db.payments.getAll().map(p => {
        const student = db.students.getById(p.studentId);
        return {
          "Sana": p.date,
          "Talaba": student?.fullName || "—",
          "Summa": p.amount,
          "Usul": p.method,
          "Holat": p.status
        };
      });
      exportToExcel(payments, "Tolovlar.xlsx");
    });
  }

  // Export Groups
  const exportGroupsBtn = document.getElementById("export-groups-excel");
  if (exportGroupsBtn) {
    exportGroupsBtn.addEventListener("click", () => {
      const db = window.ITCenterDB;
      if (!db) return;
      const groups = db.groups.getAll().map(g => {
        const course = db.courses.getById(g.courseId);
        const mentor = db.mentors.getById(g.mentorId);
        return {
          "Guruh ID": g.id,
          "Kurs": course?.name || "—",
          "Mentor": mentor?.name || "—",
          "Jadval": g.schedule,
          "Talabalar": g.studentCount,
          "Sig'im": g.capacity
        };
      });
      exportToExcel(groups, "Guruhlar.xlsx");
    });
  }

  // Export PDF (simple text for now)
  const exportPdfBtn = document.getElementById("export-all-pdf");
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      const db = window.ITCenterDB;
      if (!db) return;
      const stats = db.getStats();
      const report = `
IT CENTER - TO'LIQ HISOBOT
=============================
Sana: ${new Date().toLocaleDateString("uz-UZ")}

UMUMIY STATISTIKA:
- Jami talabalar: ${stats.totalStudents}
- Faol talabalar: ${stats.activeStudents}
- Aktiv guruhlar: ${stats.activeGroups}
- Jami to'lovlar: ${stats.totalPayments.toLocaleString()} so'm
- Qarzdorlar: ${stats.debtStudents}
- Yangi arizalar: ${stats.newApplications}

=============================
IT Center Portal
      `;
      const blob = new Blob([report], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "IT_Center_Hisobot.txt";
      a.click();
      URL.revokeObjectURL(url);
      adminShowToast("📄 Hisobot yuklab olindi (PDF tez orada)", "success");
    });
  }

  // ==============================
  // EMAIL MARKETING
  // ==============================
  const emailRecipients = document.getElementById("email-recipients");
  const recipientCount = document.getElementById("recipient-count");
  const sendEmailBtn = document.getElementById("send-email-btn");
  const previewEmailBtn = document.getElementById("preview-email-btn");

  function updateRecipientCount() {
    const db = window.ITCenterDB;
    if (!db || !emailRecipients || !recipientCount) return;

    const value = emailRecipients.value;
    let count = 0;
    const students = db.students.getAll();
    const applications = db.applications.getAll();

    if (value === "all") count = students.length;
    else if (value === "active") count = students.filter(s => s.status === "active").length;
    else if (value === "debt") count = students.filter(s => s.paymentStatus === "debt" || s.paymentStatus === "unpaid").length;
    else if (value === "new") count = applications.filter(a => a.status === "new").length;

    recipientCount.textContent = `${count} ta qabul qiluvchi`;
  }

  if (emailRecipients) {
    emailRecipients.addEventListener("change", updateRecipientCount);
    updateRecipientCount();
  }

  if (sendEmailBtn) {
    sendEmailBtn.addEventListener("click", () => {
      const subject = document.getElementById("email-subject")?.value;
      const body = document.getElementById("email-body")?.value;

      if (!subject || !body) {
        adminShowToast("❌ Mavzu va xabar matnini kiriting", "error");
        return;
      }

      adminShowToast("📧 Xabar yuborilmoqda...", "info");

      setTimeout(() => {
        adminShowToast("✅ Xabar muvaffaqiyatli yuborildi!", "success");
        document.getElementById("email-subject").value = "";
        document.getElementById("email-body").value = "";
      }, 2000);
    });
  }

  if (previewEmailBtn) {
    previewEmailBtn.addEventListener("click", () => {
      const subject = document.getElementById("email-subject")?.value || "(Mavzu yo'q)";
      const body = document.getElementById("email-body")?.value || "(Xabar matni yo'q)";
      alert(`📧 XA PREVIEW\n\nMavzu: ${subject}\n\n${body}`);
    });
  }


  // =========================
  // STUDENTS
  // =========================
  let studentsLoaded = false;

  async function loadStudentsIfNeeded() {
    if (studentsLoaded) return;
    await loadStudents();
  }

  async function loadStudents() {
    if (!studentsTableBody) return;
    if (studentsSkeleton) studentsSkeleton.style.display = "block";

    try {
      const db = window.ITCenterDB;
      const students = db ? db.students.getAll() : [];
      const courses = db ? db.courses.getAll() : [];
      const groups = db ? db.groups.getAll() : [];

      studentsTableBody.innerHTML = "";

      students.forEach((st) => {
        const tr = document.createElement("tr");
        tr.dataset.studentId = st.id;

        // Get course and group names
        const course = courses.find(c => c.id === st.courseId);
        const group = groups.find(g => g.id === st.groupId);
        const courseName = course?.name?.split("(")[0]?.trim() || "—";
        const groupName = st.groupId || "—";

        // Status class mapping
        const statusMap = {
          active: { text: "Faol", class: "admin-status-active" },
          graduated: { text: "Bitirgan", class: "admin-status-graduated" },
          frozen: { text: "Muzlatilgan", class: "admin-status-frozen" },
          applied: { text: "Ariza", class: "admin-status-applied" }
        };
        const status = statusMap[st.status] || { text: st.status, class: "admin-status" };

        // Payment status class mapping
        const paymentMap = {
          paid: { text: "To'langan", class: "admin-status-paid" },
          partial: { text: "Qisman", class: "admin-status-partial" },
          debt: { text: "Qarzdor", class: "admin-status-debt" },
          unpaid: { text: "To'lanmagan", class: "admin-status-debt" }
        };
        const payment = paymentMap[st.paymentStatus] || { text: st.paymentStatus, class: "admin-status" };

        tr.innerHTML = `
          <td><input type="checkbox" class="row-checkbox student-checkbox" data-id="${st.id}"></td>
          <td>${st.id}</td>
          <td><strong>${st.fullName}</strong></td>
          <td data-st-course="${courseName.toLowerCase()}" data-st-group="${(st.groupId || '').toLowerCase()}">
            ${courseName}${groupName !== "—" ? " • " + groupName : ""}
          </td>
          <td data-st-phone="${st.phone || ""}">${st.phone || "—"}</td>
          <td data-st-status="${status.text.toLowerCase()}">
            <span class="admin-status ${status.class}">${status.text}</span>
          </td>
          <td data-st-payment="${st.paymentStatus}">
            <span class="admin-status ${payment.class}">${payment.text}</span>
          </td>
          <td>
            <button class="admin-table-action admin-student-edit" data-id="${st.id}">✏️ Tahrirlash</button>
          </td>
        `;
        studentsTableBody.appendChild(tr);
      });

      // Add edit button handlers
      studentsTableBody.querySelectorAll(".admin-student-edit").forEach((btn) => {
        btn.addEventListener("click", () => {
          const studentId = parseInt(btn.dataset.id);
          openStudentEditModal(studentId);
        });
      });

      studentsLoaded = true;

      // Setup bulk selection handlers
      setupBulkActions();
    } catch (err) {
      console.error(err);
      adminShowToast("Talabalar ro'yxatini yuklashda xatolik.", "error");
    } finally {
      if (studentsSkeleton) studentsSkeleton.style.display = "none";
    }
  }

  // ==============================
  // BULK ACTIONS
  // ==============================
  let selectedStudents = new Set();

  function setupBulkActions() {
    const bulkBar = document.getElementById("bulk-actions-bar");
    const selectAllCheckbox = document.getElementById("select-all-students");
    const selectedCountEl = document.getElementById("selected-count");
    const checkboxes = document.querySelectorAll(".student-checkbox");

    function updateBulkBar() {
      if (!bulkBar) return;
      if (selectedStudents.size > 0) {
        bulkBar.classList.add("active");
        if (selectedCountEl) selectedCountEl.textContent = selectedStudents.size;
      } else {
        bulkBar.classList.remove("active");
      }
    }

    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const id = parseInt(cb.dataset.id);
        if (cb.checked) {
          selectedStudents.add(id);
        } else {
          selectedStudents.delete(id);
        }
        updateBulkBar();
      });
    });

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        checkboxes.forEach(cb => {
          cb.checked = selectAllCheckbox.checked;
          const id = parseInt(cb.dataset.id);
          if (selectAllCheckbox.checked) {
            selectedStudents.add(id);
          } else {
            selectedStudents.delete(id);
          }
        });
        updateBulkBar();
      });
    }

    // Also handle header checkbox
    const headerSelectAll = document.getElementById("header-select-all");
    if (headerSelectAll) {
      headerSelectAll.addEventListener("change", () => {
        checkboxes.forEach(cb => {
          cb.checked = headerSelectAll.checked;
          const id = parseInt(cb.dataset.id);
          if (headerSelectAll.checked) {
            selectedStudents.add(id);
          } else {
            selectedStudents.delete(id);
          }
        });
        updateBulkBar();
      });
    }
  }

  // Bulk change status
  const bulkChangeStatusBtn = document.getElementById("bulk-change-status");
  if (bulkChangeStatusBtn) {
    bulkChangeStatusBtn.addEventListener("click", () => {
      if (selectedStudents.size === 0) {
        adminShowToast("❌ Avval talabalarni tanlang", "error");
        return;
      }
      const newStatus = prompt("Yangi status kiriting (active, frozen, graduated):");
      if (!newStatus) return;

      const db = window.ITCenterDB;
      if (!db) return;

      selectedStudents.forEach(id => {
        const student = db.students.getById(id);
        if (student) {
          student.status = newStatus;
          db.students.update(student);
        }
      });

      adminShowToast(`✅ ${selectedStudents.size} talaba statusi o'zgartirildi`, "success");
      selectedStudents.clear();
      loadStudents();
    });
  }

  // Bulk change group
  const bulkChangeGroupBtn = document.getElementById("bulk-change-group");
  if (bulkChangeGroupBtn) {
    bulkChangeGroupBtn.addEventListener("click", () => {
      if (selectedStudents.size === 0) {
        adminShowToast("❌ Avval talabalarni tanlang", "error");
        return;
      }
      const db = window.ITCenterDB;
      if (!db) return;

      const groups = db.groups.getAll();
      const groupList = groups.map(g => `${g.id}`).join(", ");
      const newGroup = prompt(`Yangi guruh ID kiriting:\nMavjud: ${groupList}`);
      if (!newGroup) return;

      selectedStudents.forEach(id => {
        const student = db.students.getById(id);
        if (student) {
          student.groupId = newGroup;
          db.students.update(student);
        }
      });

      adminShowToast(`✅ ${selectedStudents.size} talaba guruhi o'zgartirildi`, "success");
      selectedStudents.clear();
      loadStudents();
    });
  }

  // Bulk send SMS (real API)
  const bulkSendSmsBtn = document.getElementById("bulk-send-sms");
  if (bulkSendSmsBtn) {
    bulkSendSmsBtn.addEventListener("click", async () => {
      if (selectedStudents.size === 0) {
        adminShowToast("❌ Avval talabalarni tanlang", "error");
        return;
      }
      const message = prompt("SMS matnini kiriting:");
      if (!message) return;

      const db = window.ITCenterDB;
      if (!db) return;

      adminShowToast(`📱 ${selectedStudents.size} ta talabaga SMS yuborilmoqda...`, "info");

      let sent = 0;
      for (const id of selectedStudents) {
        const student = db.students.getById(id);
        if (student && student.phone) {
          await window.sendRealSMS(student.phone, message);
          sent++;
        }
      }

      adminShowToast(`✅ ${sent} ta SMS yuborildi!`, "success");
      selectedStudents.clear();
      document.querySelectorAll(".student-checkbox").forEach(cb => cb.checked = false);
      document.getElementById("bulk-actions-bar")?.classList.remove("active");
    });
  }

  // Bulk delete
  const bulkDeleteBtn = document.getElementById("bulk-delete");
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", () => {
      if (selectedStudents.size === 0) {
        adminShowToast("❌ Avval talabalarni tanlang", "error");
        return;
      }
      if (!confirm(`${selectedStudents.size} ta talabani o'chirishni tasdiqlaysizmi?`)) return;

      const db = window.ITCenterDB;
      if (!db) return;

      selectedStudents.forEach(id => {
        db.students.delete(id);
      });

      adminShowToast(`🗑️ ${selectedStudents.size} talaba o'chirildi`, "success");
      selectedStudents.clear();
      loadStudents();
    });
  }


  function filterStudents() {
    if (!studentsTableBody) return;
    const rows = studentsTableBody.querySelectorAll("tr");
    const q = (studentsSearch?.value || "").toLowerCase().trim();
    const courseFilter = studentsCourseFilter?.value || "all";
    const statusFilter = studentsStatusFilter?.value || "all";

    rows.forEach((row) => {
      const id = (row.dataset.studentId || "").toLowerCase();
      const name = (row.querySelector("td:nth-child(3)")?.textContent || "")
        .toLowerCase();
      const phone = (row.querySelector("td:nth-child(5)")?.textContent || "")
        .toLowerCase();
      const courseCell = row.querySelector("td:nth-child(4)");
      const statusCell = row.querySelector("td:nth-child(6)");
      const paymentCell = row.querySelector("td:nth-child(7)");

      const courseText = (courseCell?.getAttribute("data-st-course") || "").toLowerCase();
      const groupText = (courseCell?.getAttribute("data-st-group") || "").toLowerCase();
      const statusText = (statusCell?.getAttribute("data-st-status") || "").toLowerCase();
      const paymentText = (paymentCell?.getAttribute("data-st-payment") || "").toLowerCase();

      const matchesSearch =
        !q ||
        id.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        courseText.includes(q) ||
        groupText.includes(q);

      let matchesCourse = true;
      if (courseFilter !== "all") {
        matchesCourse = courseText.includes(courseFilter);
      }

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = statusText === "faol";
      else if (statusFilter === "frozen") matchesStatus = statusText === "muzlatilgan";
      else if (statusFilter === "finished") matchesStatus = statusText === "bitirgan";
      else if (statusFilter === "applied") matchesStatus = statusText === "ariza";

      const visible = matchesSearch && matchesCourse && matchesStatus;
      row.style.display = visible ? "" : "none";

      row.dataset.payment = paymentText;
    });
  }

  if (studentsSearch) studentsSearch.addEventListener("input", filterStudents);
  if (studentsCourseFilter) studentsCourseFilter.addEventListener("change", filterStudents);
  if (studentsStatusFilter) studentsStatusFilter.addEventListener("change", filterStudents);
  if (studentsGroupFilter) studentsGroupFilter.addEventListener("change", filterStudents);
  if (studentsPaymentFilter) studentsPaymentFilter.addEventListener("change", filterStudents);

  function filterGroups() {
    if (!groupsTableBody) return;
    const rows = groupsTableBody.querySelectorAll("tr");
    const q = (groupsSearch?.value || "").toLowerCase().trim();
    const courseFilter = (groupsCourseFilter?.value || "all").toLowerCase();

    rows.forEach((row) => {
      const groupId = (row.querySelector("td:nth-child(1)")?.textContent || "").toLowerCase();
      const courseCell = row.querySelector("td:nth-child(2)");
      const mentorCell = row.querySelector("td:nth-child(3)");
      const roomCell = row.querySelector("td:nth-child(5)");

      const course = (courseCell?.getAttribute("data-g-course") || "").toLowerCase();
      const mentor = (mentorCell?.getAttribute("data-g-mentor") || "").toLowerCase();
      const room = (roomCell?.getAttribute("data-g-room") || "").toLowerCase();

      const matchesSearch = !q || groupId.includes(q) || mentor.includes(q) || room.includes(q) || course.includes(q);
      const matchesCourse = courseFilter === "all" || course.includes(courseFilter);

      row.style.display = (matchesSearch && matchesCourse) ? "" : "none";
    });
  }

  if (groupsSearch) groupsSearch.addEventListener("input", filterGroups);
  if (groupsCourseFilter) groupsCourseFilter.addEventListener("change", filterGroups);

  studentsPresetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.dataset.studentsPreset;
      studentsPresetButtons.forEach((b) => (b.style.opacity = "0.7"));
      btn.style.opacity = "1";

      if (preset === "all") {
        if (studentsStatusFilter) studentsStatusFilter.value = "all";
        filterStudents();
      } else if (preset === "debt") {
        if (!studentsTableBody) return;
        const rows = studentsTableBody.querySelectorAll("tr");
        rows.forEach((row) => {
          const payment = (row.dataset.payment || "").toLowerCase();
          row.style.display = (payment === "debt" || payment === "unpaid") ? "" : "none";
        });
      } else if (preset === "new") {
        if (!studentsTableBody) return;
        const rows = Array.from(studentsTableBody.querySelectorAll("tr"));
        rows.forEach((row, idx) => {
          row.style.display = idx < 2 ? "" : "none";
        });
      }
    });
  });

  async function openStudentDrawer(studentId) {
    if (!studentId) return;
    try {
      const data = await adminApiRequest(`/students/${studentId}`, { method: "GET" });

      if (drawerName) drawerName.textContent = data.fullName || "Talaba";
      if (drawerId) drawerId.textContent = `ID: ${data.id || studentId}`;
      if (drawerCourse) {
        const courseText = data.course || "";
        const groupText = data.group || "";
        drawerCourse.textContent = groupText
          ? `${courseText} • ${groupText}`
          : courseText || "—";
      }
      if (drawerPhone) drawerPhone.textContent = data.phone || "—";
      if (drawerStatus) drawerStatus.textContent = data.status || "—";
      if (drawerPayment) drawerPayment.textContent = data.paymentStatus || "—";

      if (drawerPaymentsList && Array.isArray(data.payments)) {
        drawerPaymentsList.innerHTML = "";
        data.payments.forEach((p) => {
          const li = document.createElement("li");
          li.textContent = `${p.amount} so‘m • ${p.method} • ${p.date}`;
          drawerPaymentsList.appendChild(li);
        });
      }

      body.classList.add("admin-drawer-open");
    } catch (err) {
      console.error(err);
      adminShowToast("Talaba profilini yuklashda xatolik.", "error");
    }
  }

  function closeStudentDrawer() {
    body.classList.remove("admin-drawer-open");
  }

  if (studentDrawerOverlay)
    studentDrawerOverlay.addEventListener("click", closeStudentDrawer);
  if (studentDrawerClose) studentDrawerClose.addEventListener("click", closeStudentDrawer);

  // =========================
  // GROUPS
  // =========================
  let groupsLoaded = false;
  let currentEditingGroupRow = null;

  async function loadGroupsIfNeeded() {
    if (groupsLoaded) return;
    await loadGroups();
  }

  async function loadGroups() {
    if (!groupsTableBody) return;
    groupsTableBody.innerHTML = "";

    // Get admin role for permission check
    const adminSession = JSON.parse(localStorage.getItem("admin_session") || "{}");
    const canDelete = adminSession.role === "super_admin" || adminSession.role === "admin";

    try {
      const groups = await adminApiRequest("/groups", { method: "GET" });
      (groups || []).forEach((g) => {
        const tr = document.createElement("tr");
        tr.dataset.groupId = g.id;

        let statusClass = "admin-status-active";
        if (g.status === "To‘la") statusClass = "admin-status-full";
        else if (g.status === "Yangi to‘planyapti") statusClass = "admin-status-recruiting";

        tr.innerHTML = `
          <td>${g.id}</td>
          <td data-g-course="${g.course || ""}">${g.course || ""}</td>
          <td data-g-mentor="${g.mentor || ""}">${g.mentor || ""}</td>
          <td data-g-schedule="${g.schedule || ""}">${g.schedule || ""}</td>
          <td data-g-room="${g.room || ""}">${g.room || ""}</td>
          <td data-g-count="${g.count || 0}" data-g-capacity="${g.capacity || 0}">
            ${g.count || 0} / ${g.capacity || 0}
          </td>
          <td data-g-status="${g.status || ""}">
            <span class="admin-status ${statusClass}">${g.status || ""}</span>
          </td>
          <td>
            <button class="admin-table-action group-edit-btn">✏️</button>
            ${canDelete ? `<button class="admin-table-action group-delete-btn admin-btn-danger" data-id="${g.id}">🗑️</button>` : ''}
          </td>
        `;
        groupsTableBody.appendChild(tr);
      });

      groupsTableBody.querySelectorAll(".group-edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          enterGroupEditMode(btn.closest("tr"));
        });
      });

      // Delete button handlers
      groupsTableBody.querySelectorAll(".group-delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const groupId = btn.dataset.id;
          if (confirm(`"${groupId}" guruhini o'chirishni xohlaysizmi?`)) {
            const db = window.ITCenterDB;
            if (db && db.groups.delete) {
              db.groups.delete(groupId);
              db.logActivity("group_deleted", adminSession.adminName, `${groupId} guruh o'chirildi`);
              adminShowToast(`✅ ${groupId} guruh o'chirildi`, "success");
              loadGroups();
            }
          }
        });
      });

      groupsLoaded = true;
    } catch (err) {
      console.error(err);
      adminShowToast("Guruhlar ro‘yxatini yuklashda xatolik.", "error");
    }
  }

  function enterGroupEditMode(row) {
    if (!row) return;
    if (currentEditingGroupRow && currentEditingGroupRow !== row) {
      exitGroupEditMode(currentEditingGroupRow, false);
    }

    currentEditingGroupRow = row;
    const courseCell = row.children[1];
    const mentorCell = row.children[2];
    const scheduleCell = row.children[3];
    const roomCell = row.children[4];
    const capCell = row.children[5];
    const statusCell = row.children[6];
    const actionCell = row.children[7];

    const courseValue = courseCell.getAttribute("data-g-course") || "";
    const mentorValue = mentorCell.getAttribute("data-g-mentor") || "";
    const scheduleValue = scheduleCell.getAttribute("data-g-schedule") || "";
    const roomValue = roomCell.getAttribute("data-g-room") || "";
    const capValue = capCell.getAttribute("data-g-capacity") || "0";
    const countValue = capCell.getAttribute("data-g-count") || "0";
    const statusValue = statusCell.getAttribute("data-g-status") || "Aktiv";

    courseCell.innerHTML = `<input class="admin-inline-input" type="text" value="${courseValue}"/>`;
    mentorCell.innerHTML = `<input class="admin-inline-input" type="text" value="${mentorValue}"/>`;
    scheduleCell.innerHTML = `<input class="admin-inline-input" type="text" value="${scheduleValue}"/>`;
    roomCell.innerHTML = `<input class="admin-inline-input" type="text" value="${roomValue}"/>`;
    capCell.innerHTML = `
      <div style="display:flex;gap:4px;">
        <input class="admin-inline-input" style="width:50%" type="number" value="${countValue}" />
        <input class="admin-inline-input" style="width:50%" type="number" value="${capValue}" />
      </div>
    `;
    statusCell.innerHTML = `
      <select class="admin-inline-select">
        <option value="Aktiv" ${statusValue === "Aktiv" ? "selected" : ""}>Aktiv</option>
        <option value="To‘la" ${statusValue === "To‘la" ? "selected" : ""}>To‘la</option>
        <option value="Yangi to‘planyapti" ${statusValue === "Yangi to‘planyapti" ? "selected" : ""
      }>Yangi to‘planyapti</option>
      </select>
    `;
    actionCell.innerHTML = `
      <button class="admin-table-action admin-group-save">Saqlash</button>
      <button class="admin-table-action admin-group-cancel">Bekor qilish</button>
    `;

    const saveBtn = actionCell.querySelector(".admin-group-save");
    const cancelBtn = actionCell.querySelector(".admin-group-cancel");

    if (saveBtn) saveBtn.addEventListener("click", () => exitGroupEditMode(row, true));
    if (cancelBtn) cancelBtn.addEventListener("click", () => exitGroupEditMode(row, false));
  }

  async function exitGroupEditMode(row, save) {
    const groupId = row.dataset.groupId;
    const courseCell = row.children[1];
    const mentorCell = row.children[2];
    const scheduleCell = row.children[3];
    const roomCell = row.children[4];
    const capCell = row.children[5];
    const statusCell = row.children[6];
    const actionCell = row.children[7];

    if (save) {
      const courseInput = courseCell.querySelector("input");
      const mentorInput = mentorCell.querySelector("input");
      const scheduleInput = scheduleCell.querySelector("input");
      const roomInput = roomCell.querySelector("input");
      const countInput = capCell.querySelectorAll("input")[0];
      const capInput = capCell.querySelectorAll("input")[1];
      const statusSelect = statusCell.querySelector("select");

      const newCourse = courseInput ? courseInput.value : "";
      const newMentor = mentorInput ? mentorInput.value : "";
      const newSchedule = scheduleInput ? scheduleInput.value : "";
      const newRoom = roomInput ? roomInput.value : "";
      const newCount = parseInt(countInput ? countInput.value : "0", 10);
      const newCap = parseInt(capInput ? capInput.value : "0", 10);
      const newStatus = statusSelect ? statusSelect.value : "Aktiv";

      try {
        await adminApiRequest(`/groups/${groupId}`, {
          method: "PUT",
          body: JSON.stringify({
            course: newCourse,
            mentor: newMentor,
            schedule: newSchedule,
            room: newRoom,
            count: newCount,
            capacity: newCap,
            status: newStatus,
          }),
        });

        courseCell.setAttribute("data-g-course", newCourse);
        mentorCell.setAttribute("data-g-mentor", newMentor);
        scheduleCell.setAttribute("data-g-schedule", newSchedule);
        roomCell.setAttribute("data-g-room", newRoom);
        capCell.setAttribute("data-g-count", String(newCount));
        capCell.setAttribute("data-g-capacity", String(newCap));
        statusCell.setAttribute("data-g-status", newStatus);

        courseCell.textContent = newCourse;
        mentorCell.textContent = newMentor;
        scheduleCell.textContent = newSchedule;
        roomCell.textContent = newRoom;
        capCell.textContent = `${newCount} / ${newCap}`;

        let statusClass = "admin-status-active";
        if (newStatus === "To‘la") statusClass = "admin-status-full";
        else if (newStatus === "Yangi to‘planyapti") statusClass = "admin-status-recruiting";

        statusCell.innerHTML = `<span class="admin-status ${statusClass}">${newStatus}</span>`;
        adminShowToast("Guruh ma’lumotlari yangilandi.", "success");
      } catch (err) {
        adminShowToast(err.message || "Guruhni saqlashda xatolik.", "error");
        await loadGroups();
        currentEditingGroupRow = null;
        return;
      }
    } else {
      await loadGroups();
      currentEditingGroupRow = null;
      return;
    }

    actionCell.innerHTML = `<button class="admin-table-action group-edit-btn">Tahrirlash</button>`;
    const newEditBtn = actionCell.querySelector(".group-edit-btn");
    if (newEditBtn) {
      newEditBtn.addEventListener("click", () => enterGroupEditMode(row));
    }

    currentEditingGroupRow = null;
  }

  if (addGroupBtn && groupsTableBody) {
    addGroupBtn.addEventListener("click", async () => {
      const id = prompt("Guruh ID (masalan, F-13, P-08)?");
      if (!id) return;

      const courseOptions = "1=Frontend, 2=Python, 3=Kids IT, 4=UI/UX, 5=Mobile";
      const courseChoice = prompt(`Kurs tanlang:\n${courseOptions}\nRaqam kiriting:`);
      const courseId = parseInt(courseChoice) || 1;

      const mentorOptions = "Mentorni tanlang (ID raqamini kiriting):\n" +
        "1=Azizbek, 2=Jasur, 3=Malika, 4=Sabina, 5=Bekzod";
      const mentorChoice = prompt(mentorOptions);
      const mentorId = parseInt(mentorChoice) || 1;

      const schedule = prompt("Jadval (masalan: Dush / Chor / Jum • 18:00)?") || "Dush / Chor / Jum • 18:00";
      const room = prompt("Xona raqami (masalan: 203)?") || "201";
      const capacity = parseInt(prompt("Maksimal sig'im (masalan: 18)?")) || 18;

      try {
        await adminApiRequest("/groups", {
          method: "POST",
          body: JSON.stringify({
            id,
            courseId,
            mentorId,
            schedule,
            room,
            capacity,
            studentCount: 0,
            status: "recruiting"
          }),
        });
        adminShowToast("Yangi guruh yaratildi! ✅", "success");
        await loadGroups();
      } catch (err) {
        adminShowToast(err.message || "Yangi guruh yaratishda xatolik.", "error");
      }
    });
  }

  // =========================
  // COURSES
  // =========================
  let coursesLoaded = false;

  async function loadCoursesIfNeeded() {
    if (coursesLoaded) return;
    await loadCourses();
  }

  async function loadCourses() {
    if (!coursesTableBody) return;
    coursesTableBody.innerHTML = "";
    try {
      const courses = await adminApiRequest("/courses", { method: "GET" });
      (courses || []).forEach((c) => {
        const tr = document.createElement("tr");
        tr.dataset.courseId = c.id;
        tr.innerHTML = `
          <td>${c.name}</td>
          <td>${c.level || ""}</td>
          <td>${c.duration || ""}</td>
          <td>${c.price ? c.price.toLocaleString("uz-UZ") + " so‘m" : ""}</td>
          <td>${c.status || ""}</td>
        `;
        tr.addEventListener("click", () => {
          currentEditedCourseId = c.id;
          if (courseNameInput) courseNameInput.value = c.name || "";
          if (courseDurationInput) courseDurationInput.value = c.duration || "";
          if (coursePriceInput) coursePriceInput.value = c.price || "";
          if (courseStatusSelect)
            courseStatusSelect.value = c.status === "Aktiv" ? "active" : "hidden";
        });
        coursesTableBody.appendChild(tr);
      });

      coursesLoaded = true;
    } catch (err) {
      console.error(err);
      adminShowToast("Kurslar ro‘yxatini yuklashda xatolik.", "error");
    }
  }

  if (courseEditForm) {
    courseEditForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentEditedCourseId) {
        adminShowToast("Avval kursni tanlang.", "error");
        return;
      }

      const payload = {
        name: courseNameInput ? courseNameInput.value.trim() : "",
        duration: courseDurationInput ? courseDurationInput.value.trim() : "",
        price: parseInt(coursePriceInput ? coursePriceInput.value || "0" : "0", 10),
        status: courseStatusSelect && courseStatusSelect.value === "active"
          ? "Aktiv"
          : "Yashirin",
      };

      try {
        await adminApiRequest(`/courses/${currentEditedCourseId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (courseEditMessage) {
          courseEditMessage.textContent = "Kurs ma’lumotlari saqlandi.";
          setTimeout(() => (courseEditMessage.textContent = ""), 2500);
        }
        await loadCourses();
      } catch (err) {
        adminShowToast(err.message || "Kursni saqlashda xatolik.", "error");
      }
    });
  }

  if (addCourseBtn) {
    addCourseBtn.addEventListener("click", async () => {
      const name = prompt("Yangi kurs nomi?");
      if (!name) return;
      try {
        await adminApiRequest("/courses", {
          method: "POST",
          body: JSON.stringify({ name }),
        });
        adminShowToast("Yangi kurs qo‘shildi.", "success");
        await loadCourses();
      } catch (err) {
        adminShowToast(err.message || "Kurs qo‘shishda xatolik.", "error");
      }
    });
  }

  // =========================
  // MENTORS
  // =========================
  let mentorsLoaded = false;

  async function loadMentorsIfNeeded() {
    if (mentorsLoaded) return;
    await loadMentors();
  }

  async function loadMentors() {
    if (!mentorsTableBody) return;
    mentorsTableBody.innerHTML = "";
    try {
      const mentors = await adminApiRequest("/mentors", { method: "GET" });
      (mentors || []).forEach((m) => {
        const tr = document.createElement("tr");
        tr.dataset.mentorId = m.id;
        const statusClass = m.status === "active" ? "admin-status-active" : "admin-status-frozen";
        tr.innerHTML = `
          <td>${m.name || m.fullName || ""}</td>
          <td>${m.role || m.course || ""}</td>
          <td>${(m.groups || []).join(", ") || "—"}</td>
          <td>${m.telegram || ""} • ${m.phone || ""}</td>
          <td><span class="admin-status ${statusClass}">${m.status === "active" ? "Aktiv" : "Faol emas"}</span></td>
        `;
        mentorsTableBody.appendChild(tr);
      });

      mentorsLoaded = true;
    } catch (err) {
      console.error(err);
      adminShowToast("Mentorlar ro'yxatini yuklashda xatolik.", "error");
    }
  }

  if (mentorsSearch && mentorsTableBody) {
    mentorsSearch.addEventListener("input", () => {
      const q = mentorsSearch.value.toLowerCase().trim();
      const rows = mentorsTableBody.querySelectorAll("tr");
      rows.forEach((row) => {
        const name = (row.children[0].textContent || "").toLowerCase();
        row.style.display = !q || name.includes(q) ? "" : "none";
      });
    });
  }

  if (addMentorBtn) {
    addMentorBtn.addEventListener("click", async () => {
      const name = prompt("Mentor ismi?");
      if (!name) return;
      const role = prompt("Mentor yo'nalishi (masalan, Frontend, Python, Kids IT)?") || "Frontend";
      const phone = prompt("Telefon raqami?") || "";
      const telegram = prompt("Telegram username (masalan, @mentor)?") || "";
      try {
        await adminApiRequest("/mentors", {
          method: "POST",
          body: JSON.stringify({
            name,
            role,
            phone,
            telegram,
            rating: 4.8,
            reviews: 0,
            status: "active",
            groups: []
          }),
        });
        adminShowToast("Yangi mentor qo'shildi! ✅", "success");
        await loadMentors();
      } catch (err) {
        adminShowToast(err.message || "Mentor qo'shishda xatolik.", "error");
      }
    });
  }

  // =========================
  // APPLICATIONS
  // =========================
  let applicationsLoaded = false;

  async function loadApplicationsIfNeeded() {
    if (applicationsLoaded) return;
    await loadApplications();
  }

  async function loadApplications() {
    if (!applicationsTableBody) return;
    applicationsTableBody.innerHTML = "";
    if (applicationsSkeleton) applicationsSkeleton.style.display = "block";

    try {
      const db = window.ITCenterDB;

      // Get regular applications
      const apps = db ? db.applications.getAll() : [];

      // Get course registration applications (students with 'applied' status)
      const students = db ? db.students.getAll().filter(s => s.status === 'applied' || s.status === 'postponed') : [];

      // Convert students to application format for unified display
      const courseNames = { 1: "Frontend", 2: "Backend", 3: "Python", 4: "UI/UX", 5: "Mobile" };
      const courseRegistrations = students.map(s => ({
        id: `reg-${s.id}`,
        fullName: s.fullName,
        phone: s.phone || "—",
        course: courseNames[s.courseId] || "N/A",
        format: s.educationFormat === 'online' ? 'Onlayn' : 'Offlayn',
        status: s.status === 'applied' ? 'new' : 'waiting',
        note: s.note || "📚 Kursga yozilish arizasi",
        createdAt: s.applicationDate ? new Date(s.applicationDate).getTime() : Date.now(),
        isRegistration: true,
        studentId: s.id
      }));

      // Combine all applications
      const allApps = [...apps, ...courseRegistrations];

      // Sort by createdAt descending (newest first)
      allApps.sort((a, b) => b.createdAt - a.createdAt);

      allApps.forEach((a) => {
        const tr = document.createElement("tr");
        tr.dataset.appId = a.id;
        tr.dataset.appStatus = (a.status || "").toLowerCase();
        tr.dataset.appCourse = (a.course || "").toLowerCase();

        // Status mapping
        const statusMap = {
          new: { text: "🆕 Yangi", class: "admin-status-new" },
          called: { text: "📞 Qo'ng'iroq qilindi", class: "admin-status-called" },
          waiting: { text: "⏳ Kutmoqda", class: "admin-status-waiting" },
          enrolled: { text: "✅ Ro'yxatga olindi", class: "admin-status-enrolled" },
          rejected: { text: "❌ Rad etildi", class: "admin-status-rejected" }
        };
        const status = statusMap[a.status] || { text: a.status, class: "admin-status" };

        // Time ago
        const timeAgo = getTimeAgo(a.createdAt);

        // Format badge
        const formatBadge = a.format === "Onlayn" ? "🌐" : a.format === "Offlayn" ? "🏢" : "🔄";

        tr.innerHTML = `
          <td><strong>#${a.id}</strong></td>
          <td>
            <div class="app-name-cell">
              <strong>${a.fullName}</strong>
              ${a.note ? `<small class="app-note">💬 ${a.note}</small>` : ""}
            </div>
          </td>
          <td><a href="tel:${a.phone}" class="app-phone">${a.phone}</a></td>
          <td>
            <span class="app-course-badge">${a.course}</span>
            <span class="app-format-badge">${formatBadge} ${a.format}</span>
          </td>
          <td class="app-time">${timeAgo}</td>
          <td><span class="admin-status ${status.class}">${status.text}</span></td>
          <td class="app-actions">
            <button class="admin-table-action app-action-view" data-id="${a.id}" title="Batafsil">👁️</button>
            <button class="admin-table-action app-action-call" data-id="${a.id}" title="Qo'ng'iroq qilindi">📞</button>
            <button class="admin-table-action app-action-enroll" data-id="${a.id}" title="Talabaga o'tkazish">✅</button>
          </td>
        `;
        applicationsTableBody.appendChild(tr);
      });

      // Add event listeners for action buttons
      applicationsTableBody.querySelectorAll(".app-action-view").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          if (id.startsWith('reg-')) {
            openStudentDetailsModal(parseInt(id.replace('reg-', '')));
          } else {
            openApplicationModal(parseInt(id));
          }
        });
      });

      applicationsTableBody.querySelectorAll(".app-action-call").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const db = window.ITCenterDB;
          if (id.startsWith('reg-')) {
            const studentId = parseInt(id.replace('reg-', ''));
            window.openPostponeModal(studentId);
          } else {
            db.applications.updateStatus(parseInt(id), "called");
          }
          applicationsLoaded = false;
          loadApplications();
          adminShowToast("📞 Qo'ng'iroq qilindi deb belgilandi", "success");
        });
      });

      applicationsTableBody.querySelectorAll(".app-action-enroll").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          if (id.startsWith('reg-')) {
            const studentId = parseInt(id.replace('reg-', ''));
            // Open a simplified enrollment/group-assign modal
            openGroupAssignModal(studentId);
          } else {
            openEnrollmentModal(parseInt(id));
          }
        });
      });
      applicationsLoaded = true;
    } catch (err) {
      console.error(err);
      adminShowToast("Arizalarni yuklashda xatolik.", "error");
    } finally {
      if (applicationsSkeleton) applicationsSkeleton.style.display = "none";
    }
  }

  // Aliases for consolidated application handlers
  function openGroupAssignModal(id) { window.openApproveModal(id); }
  function openStudentDetailsModal(id) { openStudentEditModal(id); }
  function openEnrollmentModal(id) { openApplicationModal(id); }

  // Time ago helper
  function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Hozirgina";
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    return `${days} kun oldin`;
  }

  // Open application detail modal
  function openApplicationModal(appId) {
    const db = window.ITCenterDB;
    if (!db) return;

    const app = db.applications.getAll().find(a => a.id === appId);
    if (!app) {
      adminShowToast("Ariza topilmadi!", "error");
      return;
    }

    const groups = db.groups.getAll();
    const groupOptions = groups.filter(g => {
      const courseName = g.id.charAt(0);
      return app.course.toLowerCase().includes(
        courseName === 'F' ? 'frontend' :
          courseName === 'P' ? 'python' :
            courseName === 'K' ? 'kids' :
              courseName === 'D' ? 'dizayn' :
                courseName === 'M' ? 'mobile' : ''
      );
    }).map(g =>
      `<option value="${g.id}">${g.id} - ${g.room} (${g.studentCount}/${g.capacity})</option>`
    ).join("");

    // Create modal
    let modal = document.getElementById("application-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "application-modal";
      modal.className = "admin-modal-overlay";
      document.body.appendChild(modal);
    }

    const statusOptions = ["new", "called", "waiting", "enrolled", "rejected"].map(s => {
      const labels = { new: "Yangi", called: "Qo'ng'iroq qilindi", waiting: "Kutmoqda", enrolled: "Ro'yxatga olindi", rejected: "Rad etildi" };
      return `<option value="${s}" ${app.status === s ? "selected" : ""}>${labels[s]}</option>`;
    }).join("");

    modal.innerHTML = `
      <div class="admin-modal" style="max-width: 700px;">
        <div class="admin-modal-header">
          <h2>📋 Ariza #${app.id}</h2>
          <button class="admin-modal-close" id="app-modal-close">✕</button>
        </div>
        <div class="admin-modal-body">
          <div class="app-detail-grid">
            <div class="app-detail-section">
              <h3>👤 Ariza beruvchi</h3>
              <p><strong>${app.fullName}</strong></p>
              <p>📱 <a href="tel:${app.phone}">${app.phone}</a></p>
              <p>📚 ${app.course} • ${app.format}</p>
              <p>🕐 ${getTimeAgo(app.createdAt)}</p>
              ${app.note ? `<div class="app-user-note"><strong>💬 Izoh:</strong> ${app.note}</div>` : ""}
            </div>
            <div class="app-detail-section">
              <h3>⚙️ Admin boshqaruvi</h3>
              <div class="admin-form-group">
                <label>Holat</label>
                <select id="app-status-select" class="admin-select">
                  ${statusOptions}
                </select>
              </div>
              <div class="admin-form-group">
                <label>Admin izohi</label>
                <textarea id="app-admin-note" class="admin-input" rows="3" placeholder="Ichki eslatma...">${app.adminNote || ""}</textarea>
              </div>
              <div class="admin-form-group">
                <label>Qayta aloqa sanasi</label>
                <input type="date" id="app-callback-date" class="admin-input" value="${app.callbackDate || ""}">
              </div>
            </div>
          </div>
          
          <div class="app-enroll-section">
            <h3>✅ Talabaga o'tkazish</h3>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Guruhga biriktirish</label>
                <select id="app-enroll-group" class="admin-select">
                  <option value="">— Guruh tanlang —</option>
                  ${groupOptions}
                </select>
              </div>
              <div class="admin-form-group" style="align-self: end;">
                <button class="admin-btn admin-btn-primary" id="app-enroll-btn">🎓 Talabaga o'tkazish</button>
              </div>
            </div>
          </div>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn" id="app-modal-cancel">Yopish</button>
          <button class="admin-btn admin-btn-primary" id="app-modal-save">💾 Saqlash</button>
          <button class="admin-btn admin-btn-danger" id="app-modal-delete">🗑️ O'chirish</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";

    // Event handlers
    document.getElementById("app-modal-close").onclick = () => modal.style.display = "none";
    document.getElementById("app-modal-cancel").onclick = () => modal.style.display = "none";

    document.getElementById("app-modal-save").onclick = () => {
      const newStatus = document.getElementById("app-status-select").value;
      const adminNote = document.getElementById("app-admin-note").value;
      const callbackDate = document.getElementById("app-callback-date").value;

      const index = db.applications.getAll().findIndex(a => a.id === appId);
      if (index !== -1) {
        const apps = db.applications.getAll();
        apps[index] = { ...apps[index], status: newStatus, adminNote, callbackDate };
        // Manual update since we modified the array
        const data = JSON.parse(localStorage.getItem("itcenter_db"));
        data.applications = apps;
        localStorage.setItem("itcenter_db", JSON.stringify(data));
        localStorage.setItem("itcenter_db_lastupdate", Date.now().toString());
      }

      modal.style.display = "none";
      applicationsLoaded = false;
      loadApplications();
      adminShowToast("✅ Ariza yangilandi!", "success");
    };

    document.getElementById("app-enroll-btn").onclick = () => {
      const groupId = document.getElementById("app-enroll-group").value;
      convertApplicationToStudent(appId, groupId);
      modal.style.display = "none";
    };

    document.getElementById("app-modal-delete").onclick = () => {
      if (confirm(`"${app.fullName}" arizasini o'chirishni xohlaysizmi?`)) {
        db.applications.delete(appId);
        modal.style.display = "none";
        applicationsLoaded = false;
        loadApplications();
        adminShowToast("🗑️ Ariza o'chirildi!", "success");
      }
    };

    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }

  // Convert application to student
  function convertApplicationToStudent(appId, groupId = "") {
    const db = window.ITCenterDB;
    if (!db) return;

    const app = db.applications.getAll().find(a => a.id === appId);
    if (!app) return;

    // Map course name to courseId
    const courseMap = {
      "Frontend": 1, "Python": 2, "Kids IT": 3, "UI/UX Dizayn": 4, "Mobile Development": 5
    };
    const courseId = courseMap[app.course] || 1;

    // Create new student
    const newStudent = {
      fullName: app.fullName,
      phone: app.phone,
      email: "",
      courseId,
      groupId: groupId || "",
      status: "active",
      paymentStatus: "unpaid",
      enrollDate: new Date().toISOString().split("T")[0],
      birthDate: ""
    };

    db.students.add(newStudent);

    // Update group studentCount if assigned
    if (groupId) {
      const group = db.groups.getById(groupId);
      if (group) {
        db.groups.update(groupId, { studentCount: group.studentCount + 1 });
      }
    }

    // Update application status
    db.applications.updateStatus(appId, "enrolled");

    applicationsLoaded = false;
    loadApplications();
    studentsLoaded = false;

    adminShowToast(`🎓 "${app.fullName}" talabaga o'tkazildi!`, "success");
  }

  function filterApplications() {
    if (!applicationsTableBody) return;
    const rows = applicationsTableBody.querySelectorAll("tr");
    const status = applicationsStatusFilter?.value || "all";
    const course = applicationsCourseFilter?.value || "all";

    rows.forEach((row) => {
      const courseText = (row.dataset.appCourse || "").toLowerCase();
      const statusText = (row.dataset.appStatus || "").toLowerCase();

      let matchesCourse = true;
      if (course !== "all") matchesCourse = courseText.includes(course);

      let matchesStatus = true;
      if (status !== "all") matchesStatus = statusText === status;

      row.style.display = matchesCourse && matchesStatus ? "" : "none";
    });
  }

  if (applicationsStatusFilter)
    applicationsStatusFilter.addEventListener("change", filterApplications);
  if (applicationsCourseFilter)
    applicationsCourseFilter.addEventListener("change", filterApplications);

  // =========================
  // =========================
  // PAYMENTS - COMPREHENSIVE
  // =========================

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  }

  // Load payments section when accessed
  function loadPaymentsData() {
    const db = window.ITCenterDB;
    if (!db) return;

    const students = db.students.getAll();
    const payments = db.payments.getAll();
    const courses = db.courses.getAll();

    // Payments table (recent)
    const paymentsTable = document.querySelector("#payments-table tbody");
    if (paymentsTable) {
      paymentsTable.innerHTML = "";

      // Sort by date descending
      const recentPayments = [...payments].filter(p => p.amount > 0).sort((a, b) => b.createdAt - a.createdAt).slice(0, 15);

      recentPayments.forEach(p => {
        const student = students.find(s => s.id === p.studentId);
        const studentName = student?.fullName || `ID: ${p.studentId}`;
        const groupId = student?.groupId || "—";

        const methodIcons = {
          payme: "💳 Payme",
          click: "📱 Click",
          uzcard: "💳 Uzcard",
          humo: "💳 Humo",
          cash: "💵 Naqd"
        };
        const methodText = methodIcons[p.method] || p.method;

        const statusMap = {
          completed: { text: "To'langan", class: "admin-status-paid" },
          partial: { text: "Qisman", class: "admin-status-partial" },
          pending: { text: "Kutilmoqda", class: "admin-status-waiting" },
          unpaid: { text: "To'lanmagan", class: "admin-status-debt" }
        };
        const status = statusMap[p.status] || { text: p.status, class: "admin-status" };

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.date || "—"}</td>
          <td><strong>${studentName}</strong> (${groupId})</td>
          <td class="payment-amount">${formatCurrency(p.amount)}</td>
          <td>${methodText}</td>
          <td><span class="admin-status ${status.class}">${status.text}</span></td>
          <td>
            <button class="admin-table-action payment-edit-btn" data-id="${p.id}">✏️</button>
          </td>
        `;
        paymentsTable.appendChild(tr);
      });

      // Add edit button handlers
      paymentsTable.querySelectorAll(".payment-edit-btn").forEach(btn => {
        btn.addEventListener("click", () => openPaymentEditModal(parseInt(btn.dataset.id)));
      });
    }

    // Student payment summary (all students)
    const studentSummaryContainer = document.getElementById("student-payment-summary");
    if (studentSummaryContainer) {
      studentSummaryContainer.innerHTML = "";

      students.forEach(student => {
        const studentPayments = payments.filter(p => p.studentId === student.id);
        const totalPaid = studentPayments.reduce((sum, p) => sum + (p.status !== "unpaid" ? p.amount : 0), 0);
        const course = courses.find(c => c.id === student.courseId);
        const coursePrice = course?.price || 1200000;
        const balance = totalPaid - coursePrice;
        const balanceClass = balance >= 0 ? "positive" : "negative";

        const statusIcon = student.status === "graduated" ? "🎓" : student.status === "active" ? "📚" : "❄️";

        const card = document.createElement("div");
        card.className = "payment-student-card";
        card.innerHTML = `
          <div class="payment-student-header">
            <span class="payment-student-name">${statusIcon} ${student.fullName}</span>
            <span class="payment-student-group">${student.groupId || "—"}</span>
          </div>
          <div class="payment-student-stats">
            <div class="payment-stat">
              <span class="payment-stat-label">Jami to'langan</span>
              <span class="payment-stat-value">${formatCurrency(totalPaid)}</span>
            </div>
            <div class="payment-stat">
              <span class="payment-stat-label">Balans</span>
              <span class="payment-stat-value payment-balance-${balanceClass}">${balance >= 0 ? "+" : ""}${formatCurrency(balance)}</span>
            </div>
          </div>
          <div class="payment-student-actions">
            <button class="admin-btn admin-btn-sm" data-student-id="${student.id}">➕ To'lov qo'shish</button>
            <button class="admin-btn admin-btn-sm" data-student-history="${student.id}">📜 Tarix</button>
          </div>
        `;
        studentSummaryContainer.appendChild(card);
      });

      // Add payment button handlers
      studentSummaryContainer.querySelectorAll("[data-student-id]").forEach(btn => {
        btn.addEventListener("click", () => openPaymentModal(parseInt(btn.dataset.studentId)));
      });

      // History button handlers
      studentSummaryContainer.querySelectorAll("[data-student-history]").forEach(btn => {
        btn.addEventListener("click", () => showStudentPaymentHistory(parseInt(btn.dataset.studentHistory)));
      });
    }
  }

  // Open add payment modal
  function openPaymentModal(preselectedStudentId = null) {

    const db = window.ITCenterDB;
    if (!db) {
      return;
    }

    const students = db.students.getAll();

    let modal = document.getElementById("payment-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "payment-modal";
      modal.className = "admin-modal-overlay";
      document.body.appendChild(modal);
    }

    const studentOptions = students.map(s =>
      `<option value="${s.id}" ${s.id === preselectedStudentId ? "selected" : ""}>${s.fullName} (${s.groupId || "—"})</option>`
    ).join("");

    const today = new Date().toISOString().split("T")[0];

    modal.innerHTML = `
      <div class="admin-modal" style="display: block;">
        <div class="admin-modal-header">
          <h2>💰 To'lov qo'shish</h2>
          <button class="admin-modal-close" id="pay-modal-close">✕</button>
        </div>
        <div class="admin-modal-body">
          <form id="payment-form">
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Talaba *</label>
                <select name="studentId" class="admin-select" required>
                  <option value="">— Talabani tanlang —</option>
                  ${studentOptions}
                </select>
              </div>
              <div class="admin-form-group">
                <label>Summa (so'm) *</label>
                <input type="number" name="amount" class="admin-input" placeholder="1200000" required>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>To'lov usuli *</label>
                <select name="method" class="admin-select" required>
                  <option value="cash">💵 Naqd</option>
                  <option value="payme">💳 Payme</option>
                  <option value="click">📱 Click</option>
                  <option value="uzcard">💳 Uzcard</option>
                  <option value="humo">💳 Humo</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>Sana</label>
                <input type="date" name="date" class="admin-input" value="${today}">
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Status</label>
                <select name="status" class="admin-select">
                  <option value="completed">To'langan</option>
                  <option value="partial">Qisman</option>
                  <option value="pending">Kutilmoqda</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>Izoh</label>
                <input type="text" name="note" class="admin-input" placeholder="Oylik to'lov, naqd qabul qilindi...">
              </div>
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn" id="pay-modal-cancel">Bekor qilish</button>
          <button class="admin-btn admin-btn-primary" id="pay-modal-save">💾 Saqlash</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";
    // Ensure the inner modal is also visible to override any external CSS
    const innerModal = modal.querySelector(".admin-modal");
    if (innerModal) innerModal.style.display = "block";

    // Close handlers
    const closeModal = () => {
      modal.style.display = "none";
    };

    document.getElementById("pay-modal-close").onclick = closeModal;
    document.getElementById("pay-modal-cancel").onclick = closeModal;

    document.getElementById("pay-modal-save").onclick = () => {
      const form = document.getElementById("payment-form");
      const formData = new FormData(form);

      const studentId = parseInt(formData.get("studentId"));
      const amount = parseInt(formData.get("amount"));

      if (!studentId || !amount) {
        adminShowToast("Talaba va summani kiriting!", "error");
        return;
      }

      const newPayment = {
        studentId,
        amount,
        method: formData.get("method"),
        date: formData.get("date"),
        status: formData.get("status"),
        note: formData.get("note") || "",
        createdAt: Date.now()
      };

      db.payments.add(newPayment);
      db.logActivity("add_payment", `Talaba #${studentId}`, `${formatCurrency(amount)} to'lov qo'shildi`);

      // Update student payment status
      const student = db.students.getById(studentId);
      if (student && formData.get("status") === "completed") {
        db.students.update(studentId, { paymentStatus: "paid" });
      } else if (student && formData.get("status") === "partial") {
        db.students.update(studentId, { paymentStatus: "partial" });
      }

      closeModal();
      loadPaymentsData();
      adminShowToast(`💰 ${formatCurrency(amount)} to'lov saqlandi!`, "success");
    };

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  // Edit payment modal
  function openPaymentEditModal(paymentId) {
    const db = window.ITCenterDB;
    if (!db) return;

    const payment = db.payments.getAll().find(p => p.id === paymentId);
    if (!payment) return;

    const students = db.students.getAll();
    const student = students.find(s => s.id === payment.studentId);

    let modal = document.getElementById("payment-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "payment-modal";
      modal.className = "admin-modal-overlay";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="admin-modal" style="display: block;">
        <div class="admin-modal-header">
          <h2>✏️ To'lovni tahrirlash #${paymentId}</h2>
          <button class="admin-modal-close" id="pay-modal-close">✕</button>
        </div>
        <div class="admin-modal-body">
          <p><strong>Talaba:</strong> ${student?.fullName || "—"}</p>
          <form id="payment-form">
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Summa (so'm)</label>
                <input type="number" name="amount" class="admin-input" value="${payment.amount}">
              </div>
              <div class="admin-form-group">
                <label>Sana</label>
                <input type="date" name="date" class="admin-input" value="${payment.date}">
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>To'lov usuli</label>
                <select name="method" class="admin-select">
                  <option value="cash" ${payment.method === "cash" ? "selected" : ""}>💵 Naqd</option>
                  <option value="payme" ${payment.method === "payme" ? "selected" : ""}>💳 Payme</option>
                  <option value="click" ${payment.method === "click" ? "selected" : ""}>📱 Click</option>
                  <option value="uzcard" ${payment.method === "uzcard" ? "selected" : ""}>💳 Uzcard</option>
                  <option value="humo" ${payment.method === "humo" ? "selected" : ""}>💳 Humo</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>Status</label>
                <select name="status" class="admin-select">
                  <option value="completed" ${payment.status === "completed" ? "selected" : ""}>To'langan</option>
                  <option value="partial" ${payment.status === "partial" ? "selected" : ""}>Qisman</option>
                  <option value="pending" ${payment.status === "pending" ? "selected" : ""}>Kutilmoqda</option>
                </select>
              </div>
            </div>
            <div class="admin-form-group">
              <label>Izoh</label>
              <input type="text" name="note" class="admin-input" value="${payment.note || ""}">
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn" id="pay-modal-cancel">Bekor qilish</button>
          <button class="admin-btn admin-btn-primary" id="pay-modal-save">💾 Saqlash</button>
          <button class="admin-btn admin-btn-danger" id="pay-modal-delete">🗑️ O'chirish</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";
    const innerModal = modal.querySelector(".admin-modal");
    if (innerModal) innerModal.style.display = "block";

    document.getElementById("pay-modal-close").onclick = () => modal.style.display = "none";
    document.getElementById("pay-modal-cancel").onclick = () => modal.style.display = "none";

    document.getElementById("pay-modal-save").onclick = () => {
      const form = document.getElementById("payment-form");
      const formData = new FormData(form);

      db.payments.update(paymentId, {
        amount: parseInt(formData.get("amount")),
        date: formData.get("date"),
        method: formData.get("method"),
        status: formData.get("status"),
        note: formData.get("note") || ""
      });

      modal.style.display = "none";
      loadPaymentsData();
      adminShowToast("✅ To'lov yangilandi!", "success");
    };

    document.getElementById("pay-modal-delete").onclick = () => {
      if (confirm("Bu to'lovni o'chirishni xohlaysizmi?")) {
        db.payments.delete(paymentId);
        modal.style.display = "none";
        loadPaymentsData();
        adminShowToast("🗑️ To'lov o'chirildi!", "success");
      }
    };

    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }

  // Show student payment history
  function showStudentPaymentHistory(studentId) {
    const db = window.ITCenterDB;
    if (!db) return;

    const student = db.students.getById(studentId);
    const payments = db.payments.getAll().filter(p => p.studentId === studentId).sort((a, b) => b.createdAt - a.createdAt);

    let modal = document.getElementById("payment-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "payment-modal";
      modal.className = "admin-modal-overlay";
      document.body.appendChild(modal);
    }

    const paymentRows = payments.map(p => {
      const methodIcons = { payme: "💳", click: "📱", uzcard: "💳", humo: "💳", cash: "💵" };
      return `
        <tr>
          <td>${p.date || "—"}</td>
          <td>${formatCurrency(p.amount)}</td>
          <td>${methodIcons[p.method] || ""} ${p.method}</td>
          <td>${p.note || "—"}</td>
        </tr>
      `;
    }).join("");

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    modal.innerHTML = `
      <div class="admin-modal" style="max-width: 700px; display: block;">
        <div class="admin-modal-header">
          <h2>📜 To'lov tarixi - ${student?.fullName || "Talaba"}</h2>
          <button class="admin-modal-close" id="pay-modal-close">✕</button>
        </div>
        <div class="admin-modal-body">
          <p><strong>Jami to'langan:</strong> ${formatCurrency(totalPaid)}</p>
          <table class="admin-table" style="margin-top: 12px;">
            <thead>
              <tr>
                <th>Sana</th>
                <th>Summa</th>
                <th>Usul</th>
                <th>Izoh</th>
              </tr>
            </thead>
            <tbody>
              ${paymentRows || "<tr><td colspan='4'>To'lovlar yo'q</td></tr>"}
            </tbody>
          </table>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn" id="pay-modal-cancel">Yopish</button>
          <button class="admin-btn admin-btn-primary" id="pay-add-new">➕ Yangi to'lov</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";
    const innerModal = modal.querySelector(".admin-modal");
    if (innerModal) innerModal.style.display = "block";

    const closeModal = () => {
      modal.style.display = "none";
    };

    document.getElementById("pay-modal-close").onclick = closeModal;
    document.getElementById("pay-modal-cancel").onclick = closeModal;
    document.getElementById("pay-add-new").onclick = () => {
      closeModal();
      openPaymentModal(studentId);
    };

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  // Load payments on section switch
  document.querySelectorAll(".admin-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.section === "payments") {
        loadPaymentsData();
      }
    });
  });

  // ==========================================
  // PAYMENTS - EVENT DELEGATION (GLOBAL FIX)
  // ==========================================
  // Using event delegation to handle all payment-related button clicks
  // This works even for dynamically created elements
  document.addEventListener("click", (e) => {
    // Debug: Log every click target
    const target = e.target;
    const addBtn = target.closest("#add-payment-btn");

    // Add payment button
    if (addBtn) {
      e.preventDefault();
      openPaymentModal();
      return;
    }

    // Edit payment buttons (dynamic)
    const editBtn = e.target.closest(".payment-edit-btn");
    if (editBtn) {
      e.preventDefault();
      const paymentId = parseInt(editBtn.dataset.id);
      if (paymentId) {
        openPaymentEditModal(paymentId);
      }
      return;
    }

    // Student add payment buttons (dynamic)
    const studentPayBtn = e.target.closest("[data-student-id]");
    if (studentPayBtn && studentPayBtn.closest("#student-payment-summary")) {
      e.preventDefault();
      const studentId = parseInt(studentPayBtn.dataset.studentId);
      if (studentId) {
        openPaymentModal(studentId);
      }
      return;
    }

    // Student history buttons (dynamic)
    const historyBtn = e.target.closest("[data-student-history]");
    if (historyBtn && historyBtn.closest("#student-payment-summary")) {
      e.preventDefault();
      const studentId = parseInt(historyBtn.dataset.studentHistory);
      if (studentId) {
        showStudentPaymentHistory(studentId);
      }
      return;
    }
  });

  // Sync button handler
  const syncBtn = document.querySelector(".admin-header-btn");
  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      // Refresh current section data
      const activeSection = document.querySelector(".admin-menu-item.active");
      if (activeSection) {
        const sectionKey = activeSection.dataset.section;
        if (sectionKey === "payments") loadPaymentsData();
        if (sectionKey === "students") { studentsLoaded = false; loadStudents(); }
        if (sectionKey === "groups") { groupsTableLoaded = false; loadGroupsTable(); }
        adminShowToast("🔄 Ma'lumotlar yangilandi!", "success");
      }
    });
  }

  // =========================
  // SETTINGS - COMPREHENSIVE
  // =========================

  // Settings tab switching
  document.querySelectorAll(".settings-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and content
      document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".settings-tab-content").forEach(c => {
        c.classList.remove("active");
        c.style.display = "none"; // Hide all content
      });

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show corresponding content
      const targetId = `settings-tab-${tab.dataset.tab}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
        targetContent.style.display = "block"; // Show content
      }
    });
  });

  // Load settings when section is opened
  function loadSettingsData() {
    const db = window.ITCenterDB;
    if (!db) return;

    const settings = db.settings || {};

    // Map all settings fields
    const fieldMappings = [
      "portalName", "portalDescription", "contactPhone", "contactEmail", "contactAddress",
      "socialTelegram", "socialInstagram", "socialYoutube",
      "defaultTheme", "primaryColor", "accentColor",
      "language", "dateFormat", "currencySymbol", "timezone",
      "sessionTimeout", "maxLoginAttempts", "passwordMinLength",
      "smsGateway", "smsApiKey", "smtpHost", "smtpPort", "smtpUser", "smtpPassword",
      "paymeMerchantId", "paymeSecretKey", "clickMerchantId", "clickSecretKey",
      "backupFrequency"
    ];

    const checkboxMappings = [
      "requireStrongPassword", "notifyOnNewApplication", "notifyOnPayment", "notifyOnNewGroup",
      "emailNotifications", "smsNotifications", "paymeEnabled", "clickEnabled", "autoBackup"
    ];

    // Set text/select inputs
    fieldMappings.forEach(key => {
      const el = document.getElementById(`set - ${key} `);
      if (el && settings[key] !== undefined) {
        el.value = settings[key];
      }
    });

    // Set checkboxes
    checkboxMappings.forEach(key => {
      const el = document.getElementById(`set - ${key} `);
      if (el) {
        el.checked = settings[key] || false;
      }
    });

    // System info
    const storageSize = new Blob([localStorage.getItem("itcenter_db") || ""]).size;
    document.getElementById("sys-version").textContent = settings.version || "2.1.0";
    document.getElementById("sys-lastBackup").textContent = settings.lastBackupDate || "Hali qilinmagan";
    document.getElementById("sys-storageSize").textContent = (storageSize / 1024).toFixed(2) + " KB";
    document.getElementById("sys-studentsCount").textContent = db.students.getAll().length;
    document.getElementById("sys-groupsCount").textContent = db.groups.getAll().length;
    document.getElementById("sys-browser").textContent = navigator.userAgent.split(" ").slice(-1)[0];
  }

  // Save all settings
  document.getElementById("settings-save-all")?.addEventListener("click", () => {
    const db = window.ITCenterDB;
    if (!db) return;

    const fieldMappings = [
      "portalName", "portalDescription", "contactPhone", "contactEmail", "contactAddress",
      "socialTelegram", "socialInstagram", "socialYoutube",
      "defaultTheme", "primaryColor", "accentColor",
      "language", "dateFormat", "currencySymbol", "timezone",
      "smsGateway", "smsApiKey", "smtpHost", "smtpUser", "smtpPassword",
      "paymeMerchantId", "paymeSecretKey", "clickMerchantId", "clickSecretKey",
      "backupFrequency"
    ];

    const numberMappings = ["sessionTimeout", "maxLoginAttempts", "passwordMinLength", "smtpPort"];

    const checkboxMappings = [
      "requireStrongPassword", "notifyOnNewApplication", "notifyOnPayment", "notifyOnNewGroup",
      "emailNotifications", "smsNotifications", "paymeEnabled", "clickEnabled", "autoBackup"
    ];

    const newSettings = { ...db.settings };

    fieldMappings.forEach(key => {
      const el = document.getElementById(`set - ${key} `);
      if (el) newSettings[key] = el.value;
    });

    numberMappings.forEach(key => {
      const el = document.getElementById(`set - ${key} `);
      if (el) newSettings[key] = parseInt(el.value) || 0;
    });

    checkboxMappings.forEach(key => {
      const el = document.getElementById(`set - ${key} `);
      if (el) newSettings[key] = el.checked;
    });

    newSettings.lastUpdated = Date.now();

    // Save to db
    const data = JSON.parse(localStorage.getItem("itcenter_db"));
    data.settings = newSettings;
    localStorage.setItem("itcenter_db", JSON.stringify(data));
    localStorage.setItem("itcenter_db_lastupdate", Date.now().toString());

    document.getElementById("settings-save-message").textContent = "✅ Sozlamalar saqlandi!";
    adminShowToast("💾 Barcha sozlamalar saqlandi!", "success");
    setTimeout(() => {
      document.getElementById("settings-save-message").textContent = "";
    }, 3000);
  });

  // JSON Export
  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const data = localStorage.getItem("itcenter_db");
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `itcenter_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    adminShowToast("📥 JSON eksport qilindi!", "success");
  });

  // Excel Export (CSV format)
  document.getElementById("btn-export-excel")?.addEventListener("click", () => {
    const db = window.ITCenterDB;
    if (!db) return;

    const students = db.students.getAll();
    const csvRows = ["ID,Ism,Telefon,Email,Guruh,Holat,To'lov holati"];
    students.forEach(s => {
      csvRows.push(`${s.id}, "${s.fullName}", ${s.phone},${s.email || ""},${s.groupId || ""},${s.status},${s.paymentStatus} `);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talabalar_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    adminShowToast("📊 Excel (CSV) eksport qilindi!", "success");
  });

  // Reset data
  document.getElementById("btn-reset-data")?.addEventListener("click", () => {
    if (confirm("Barcha ma'lumotlarni o'chirib, boshlang'ich holatga qaytarishni xohlaysizmi?\n\nBu amalni bekor qilib bo'lmaydi!")) {
      if (confirm("Haqiqatan ham davom etasizmi?")) {
        localStorage.removeItem("itcenter_db");
        location.reload();
      }
    }
  });

  // Load settings on section switch
  document.querySelectorAll(".admin-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.section === "settings") {
        setTimeout(() => loadSettingsData(), 100);
      }
    });
  });

  // Also load if settings section is already active on page load
  if (document.querySelector("#admin-section-settings.active")) {
    loadSettingsData();
  }

  // Auto-load settings when section becomes visible via navigation
  const settingsSection = document.getElementById("admin-section-settings");
  if (settingsSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class" && settingsSection.classList.contains("active")) {
          loadSettingsData();
        }
      });
    });
    observer.observe(settingsSection, { attributes: true });
  }

  // =========================
  // SECURITY SECTION HANDLERS
  // =========================

  // Initialize security section when tab is clicked
  function initSecuritySection() {
    // Detect user IP
    detectUserIP();
    // Load security logs
    loadSecurityLogs();
    // Update 2FA status
    update2FAStatus();
  }

  // Detect user's current IP
  async function detectUserIP() {
    const ipElement = document.getElementById("user-current-ip");
    if (!ipElement) return;

    try {
      // Using a free IP detection API
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      ipElement.textContent = data.ip;
    } catch (e) {
      ipElement.textContent = "Aniqlab bo'lmadi";
    }
  }

  // Update 2FA status display
  function update2FAStatus() {
    const statusEl = document.getElementById("2fa-status");
    const checkbox = document.getElementById("set-2faEnabled");
    if (!statusEl || !checkbox) return;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        statusEl.innerHTML = '<span style="color: var(--success)">✅ 2FA YOQILGAN</span>';
        statusEl.classList.add("enabled");
        statusEl.classList.remove("disabled");
      } else {
        statusEl.innerHTML = '<span style="color: var(--danger)">⚠️ 2FA hozirda O\'CHIRILGAN</span>';
        statusEl.classList.add("disabled");
        statusEl.classList.remove("enabled");
      }
    });
  }

  // Load security logs
  function loadSecurityLogs() {
    const tbody = document.getElementById("security-logs-body");
    if (!tbody) return;

    const db = window.ITCenterDB;
    if (!db || !db.logs) {
      tbody.innerHTML = '<tr><td colspan="5">Loglar mavjud emas</td></tr>';
      return;
    }

    // Get last 20 security-related logs
    const allLogs = db.logs.getAll().filter(log =>
      log.action === "login" ||
      log.action === "logout" ||
      log.action.includes("password") ||
      log.action.includes("security") ||
      log.action.includes("2fa")
    ).slice(0, 20);

    if (allLogs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Xavfsizlik hodisalari yo\'q</td></tr>';
      return;
    }

    tbody.innerHTML = allLogs.map(log => {
      const date = new Date(log.timestamp);
      const timeStr = date.toLocaleString("uz-UZ");
      const statusClass = log.action === "login" ? "admin-status-paid" : "admin-status";
      const statusText = log.action === "login" ? "Muvaffaqiyatli" : "Bajarildi";

      return `
        <tr>
          <td>${timeStr}</td>
          <td>${log.action}</td>
          <td>${log.target || "—"}</td>
          <td>${log.ip || "—"}</td>
          <td><span class="admin-status ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    }).join("");
  }

  // Logout all other sessions
  document.getElementById("logout-all-sessions")?.addEventListener("click", () => {
    if (confirm("Barcha boshqa qurilmalardan chiqishni xohlaysizmi?")) {
      // In a real app, this would call an API
      // Here we just show a success message
      adminShowToast("🚪 Barcha boshqa sessiyalardan chiqildi!", "success");

      // Log the action
      const db = window.ITCenterDB;
      if (db && db.logActivity) {
        db.logActivity("security", "Barchadan chiqish", "Boshqa sessiyalar tugatildi");
      }
    }
  });

  // Save security settings
  document.getElementById("save-security-settings")?.addEventListener("click", () => {
    const db = window.ITCenterDB;
    if (!db) return;

    // Collect all security settings
    const securitySettings = {
      sessionTimeout: parseInt(document.getElementById("set-sessionTimeout")?.value) || 30,
      maxLoginAttempts: parseInt(document.getElementById("set-maxLoginAttempts")?.value) || 5,
      lockoutDuration: parseInt(document.getElementById("set-lockoutDuration")?.value) || 15,
      autoLogoutInactive: document.getElementById("set-autoLogoutInactive")?.checked || false,
      passwordMinLength: parseInt(document.getElementById("set-passwordMinLength")?.value) || 8,
      passwordExpiry: parseInt(document.getElementById("set-passwordExpiry")?.value) || 90,
      requireStrongPassword: document.getElementById("set-requireStrongPassword")?.checked || false,
      preventPasswordReuse: document.getElementById("set-preventPasswordReuse")?.checked || false,
      twoFactorEnabled: document.getElementById("set-2faEnabled")?.checked || false,
      twoFactorMethod: document.getElementById("set-2faMethod")?.value || "email",
      twoFactorCodeExpiry: parseInt(document.getElementById("set-2faCodeExpiry")?.value) || 300,
      ipWhitelistEnabled: document.getElementById("set-ipWhitelistEnabled")?.checked || false,
      ipWhitelist: document.getElementById("set-ipWhitelist")?.value || "",
      blockSuspiciousIp: document.getElementById("set-blockSuspiciousIp")?.checked || true
    };

    // Save to database
    const data = JSON.parse(localStorage.getItem("itcenter_db") || "{}");
    data.securitySettings = securitySettings;
    localStorage.setItem("itcenter_db", JSON.stringify(data));
    localStorage.setItem("itcenter_db_lastupdate", Date.now().toString());

    // Log the action
    if (db.logActivity) {
      db.logActivity("security", "Sozlamalar", "Xavfsizlik sozlamalari yangilandi");
    }

    adminShowToast("🔐 Xavfsizlik sozlamalari saqlandi!", "success");
  });

  // Listen for Security tab click
  document.querySelectorAll(".settings-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      if (tab.dataset.tab === "security") {
        setTimeout(() => initSecuritySection(), 100);
      }
    });
  });

  // Also initialize if security tab is already active
  const securityTab = document.querySelector('.settings-tab[data-tab="security"].active');
  if (securityTab) {
    initSecuritySection();
  }

  // =========================
  // ACTIVITY LOGS
  // =========================
  let currentLogFilter = "all";

  function loadLogsData(filter = "all") {
    const db = window.ITCenterDB;
    if (!db || !db.logs) return;

    const tbody = document.getElementById("logs-table-body");
    if (!tbody) return;

    const logs = db.logs.getAll();

    // Filter logs
    let filteredLogs = logs;
    if (filter !== "all") {
      filteredLogs = logs.filter(log => {
        if (filter === "login") return log.action === "login";
        if (filter === "payment") return log.action.includes("payment");
        if (filter === "student") return log.action.includes("student") || log.action.includes("application");
        if (filter === "group") return log.action.includes("group") || log.action.includes("attendance");
        return true;
      });
    }

    // Action icons mapping
    const actionIcons = {
      "login": "🔐",
      "payment_add": "💰",
      "payment_edit": "✏️",
      "student_add": "👤",
      "student_edit": "✏️",
      "group_create": "👥",
      "attendance_mark": "📋",
      "application_enroll": "🎓",
      "settings_update": "⚙️"
    };

    // Action labels
    const actionLabels = {
      "login": "Tizimga kirdi",
      "payment_add": "To'lov qo'shdi",
      "payment_edit": "To'lovni tahrirladi",
      "student_add": "Talaba qo'shdi",
      "student_edit": "Talabani tahrirladi",
      "group_create": "Guruh yaratdi",
      "attendance_mark": "Davomat belgiladi",
      "application_enroll": "Arizani tasdiqladi",
      "settings_update": "Sozlamalarni o'zgartirdi"
    };

    // Format time
    const formatLogTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }) + " " +
        date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
    };

    if (filteredLogs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">Loglar topilmadi</td></tr>';
      return;
    }

    tbody.innerHTML = filteredLogs.map(log => `
      <tr data-log-action="${log.action}">
        <td>${actionIcons[log.action] || "📝"}</td>
        <td>${formatLogTime(log.timestamp)}</td>
        <td>${log.admin}</td>
        <td>${actionLabels[log.action] || log.action}</td>
        <td>${log.target || "—"}</td>
        <td style="color: #9ca3af; font-size: 0.85rem;">${log.details || ""}</td>
      </tr>
      `).join("");
  }

  // Log filter buttons
  document.querySelectorAll("[data-log-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-log-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentLogFilter = btn.dataset.logFilter;
      loadLogsData(currentLogFilter);
    });
  });

  // Clear logs button
  document.getElementById("btn-clear-logs")?.addEventListener("click", () => {
    if (confirm("Barcha loglarni o'chirishni xohlaysizmi?")) {
      const db = window.ITCenterDB;
      if (db && db.logs) {
        db.logs.clear();
        loadLogsData(currentLogFilter);
        adminShowToast("🗑️ Loglar tozalandi!", "success");
      }
    }
  });

  // Load logs when section is opened
  document.querySelectorAll(".admin-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.section === "logs") {
        setTimeout(() => loadLogsData(currentLogFilter), 100);
      }
    });
  });

  // Auto-load logs when section becomes visible
  const logsSection = document.getElementById("admin-section-logs");
  if (logsSection) {
    const logsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class" && logsSection.classList.contains("active")) {
          loadLogsData(currentLogFilter);
        }
      });
    });
    logsObserver.observe(logsSection, { attributes: true });
  }


  // =========================
  // SCHEDULE MANAGEMENT
  // =========================
  const scheduleData = [
    { id: 1, day: 1, time: "09:00", duration: 90, groupId: "F-12", room: "203", mentor: "Aliyev J." },
    { id: 2, day: 1, time: "14:00", duration: 90, groupId: "P-07", room: "305", mentor: "Nurmetova D." },
    { id: 3, day: 2, time: "10:00", duration: 60, groupId: "K-03", room: "Kids-1", mentor: "Rahmonov A." },
    { id: 4, day: 3, time: "18:00", duration: 90, groupId: "F-12", room: "203", mentor: "Aliyev J." },
    { id: 5, day: 4, time: "14:00", duration: 90, groupId: "P-07", room: "305", mentor: "Nurmetova D." },
    { id: 6, day: 5, time: "09:00", duration: 90, groupId: "F-12", room: "203", mentor: "Aliyev J." },
    { id: 7, day: 6, time: "10:00", duration: 60, groupId: "K-03", room: "Kids-1", mentor: "Rahmonov A." }
  ];

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  // Load schedule on section open
  document.querySelectorAll(".admin-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.section === "schedule") {
        setTimeout(loadScheduleGrid, 100);
      }
    });
  });

  // Add schedule button - open modal
  document.getElementById("add-schedule-btn")?.addEventListener("click", () => {
    openScheduleModal();
  });

  // Schedule modal functions
  function openScheduleModal(editId = null) {
    const overlay = document.getElementById("schedule-modal-overlay");
    const title = document.getElementById("schedule-modal-title");
    const form = document.getElementById("schedule-form");
    const editIdInput = document.getElementById("schedule-edit-id");

    // Populate groups
    const groupSelect = document.getElementById("schedule-group");
    const db = window.ITCenterDB;
    if (db && groupSelect) {
      const groups = db.groups.getAll();
      groupSelect.innerHTML = groups.map(g => `< option value = "${g.id}" > ${g.id}</option > `).join("");
    }

    // Populate mentors
    const mentorSelect = document.getElementById("schedule-mentor");
    if (db && mentorSelect) {
      const mentors = db.mentors.getAll();
      mentorSelect.innerHTML = mentors.map(m => `< option value = "${m.name}" > ${m.name}</option > `).join("");
    }

    if (editId !== null) {
      // Edit mode
      title.textContent = "✏️ Darsni tahrirlash";
      const lesson = scheduleData.find(s => s.id === editId);
      if (lesson) {
        document.getElementById("schedule-day").value = lesson.day;
        document.getElementById("schedule-time").value = lesson.time;
        document.getElementById("schedule-group").value = lesson.groupId;
        document.getElementById("schedule-duration").value = lesson.duration;
        document.getElementById("schedule-room").value = lesson.room;
        document.getElementById("schedule-mentor").value = lesson.mentor;
        editIdInput.value = editId;
      }
    } else {
      // Add mode
      title.textContent = "➕ Yangi dars qo'shish";
      form.reset();
      editIdInput.value = "";
    }

    overlay.style.display = "flex";
  }

  function closeScheduleModal() {
    document.getElementById("schedule-modal-overlay").style.display = "none";
  }

  // Close modal handlers
  document.getElementById("schedule-modal-close")?.addEventListener("click", closeScheduleModal);
  document.getElementById("schedule-cancel-btn")?.addEventListener("click", closeScheduleModal);
  document.getElementById("schedule-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "schedule-modal-overlay") closeScheduleModal();
  });

  // Form submit
  document.getElementById("schedule-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const editId = document.getElementById("schedule-edit-id").value;
    const newLesson = {
      day: parseInt(document.getElementById("schedule-day").value),
      time: document.getElementById("schedule-time").value,
      duration: parseInt(document.getElementById("schedule-duration").value),
      groupId: document.getElementById("schedule-group").value,
      room: document.getElementById("schedule-room").value,
      mentor: document.getElementById("schedule-mentor").value
    };

    if (editId) {
      // Update existing
      const idx = scheduleData.findIndex(s => s.id === parseInt(editId));
      if (idx !== -1) {
        scheduleData[idx] = { ...scheduleData[idx], ...newLesson };
        adminShowToast("✅ Dars muvaffaqiyatli yangilandi!", "success");
      }
    } else {
      // Add new
      const maxId = Math.max(0, ...scheduleData.map(s => s.id));
      scheduleData.push({ id: maxId + 1, ...newLesson });
      adminShowToast("✅ Yangi dars qo'shildi!", "success");
    }

    // Save to localStorage
    localStorage.setItem("it_schedule_data", JSON.stringify(scheduleData));

    // Sync schedule to group data so student portal can show it
    const dayNames = ["", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
    const groupId = newLesson.groupId;
    if (groupId && db) {
      // Build schedule string from all lessons for this group
      const groupLessons = scheduleData.filter(s => s.groupId === groupId);
      if (groupLessons.length > 0) {
        const uniqueDays = [...new Set(groupLessons.map(l => dayNames[l.day] || ""))].filter(d => d);
        const time = groupLessons[0].time || "18:00";
        const scheduleStr = uniqueDays.join(" / ") + " • " + time;
        db.groups.update(groupId, { schedule: scheduleStr });
      }
    }

    closeScheduleModal();
    loadScheduleGrid();
  });

  // Load schedule from localStorage on init
  const savedSchedule = localStorage.getItem("it_schedule_data");
  if (savedSchedule) {
    try {
      const parsed = JSON.parse(savedSchedule);
      scheduleData.length = 0;
      parsed.forEach(s => scheduleData.push(s));
    } catch (e) { /* ignore */ }
  }

  // Enhanced schedule grid with edit/delete buttons
  function loadScheduleGrid() {
    const body = document.getElementById("schedule-body");
    if (!body) return;

    body.innerHTML = timeSlots.map(time => {
      const cells = [1, 2, 3, 4, 5, 6].map(day => {
        const lessons = scheduleData.filter(s => s.day === day && s.time === time);
        const lessonHtml = lessons.map(l => `
          <div class="schedule-item" data-id="${l.id}">
            <div class="schedule-item-title">${l.groupId}</div>
            <div class="schedule-item-info">${l.room} • ${l.mentor}</div>
            <div class="schedule-item-actions">
              <button class="schedule-edit-btn" onclick="window.editScheduleItem(${l.id})">✏️</button>
              <button class="schedule-delete-btn" onclick="window.deleteScheduleItem(${l.id})">🗑️</button>
            </div>
          </div>
        `).join("");
        return `<div class="schedule-cell">${lessonHtml}</div>`;
      }).join("");

      return `
        <div class="schedule-row">
          <div class="schedule-time-cell">${time}</div>
          ${cells}
        </div>
      `;
    }).join("");
  }

  // Global functions for edit/delete
  window.editScheduleItem = function (id) {
    openScheduleModal(id);
  };

  window.deleteScheduleItem = function (id) {
    if (!confirm("Bu darsni o'chirishni tasdiqlaysizmi?")) return;
    const idx = scheduleData.findIndex(s => s.id === id);
    if (idx !== -1) {
      scheduleData.splice(idx, 1);
      localStorage.setItem("it_schedule_data", JSON.stringify(scheduleData));
      loadScheduleGrid();
      adminShowToast("🗑️ Dars o'chirildi", "success");
    }
  };

  // =========================
  // MESSAGES (SMS/EMAIL)
  // =========================
  let messageType = "sms";
  let messageHistory = [];

  // Message type selector
  document.querySelectorAll(".message-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".message-type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      messageType = btn.dataset.type;
    });
  });

  // Recipients selector
  document.getElementById("msg-recipients")?.addEventListener("change", (e) => {
    const groupSelect = document.getElementById("msg-group-select");
    if (groupSelect) {
      groupSelect.style.display = e.target.value === "group" ? "block" : "none";
      if (e.target.value === "group") {
        const db = window.ITCenterDB;
        const groups = db?.groups?.getAll() || [];
        document.getElementById("msg-group-id").innerHTML = groups.map(g =>
          `< option value = "${g.id}" > ${g.id} - ${g.courseName || ""}</option > `
        ).join("");
      }
    }
  });

  // Template selector
  const templates = {
    payment: "Hurmatli talaba! Kurs to'lovingiz muddati yaqinlashmoqda. Iltimos, to'lovni amalga oshiring.",
    attendance: "Assalomu alaykum! Eslatma: Bugungi darsga qatnashishingiz kutilmoqda.",
    lesson: "E'lon: Bugungi dars vaqti o'zgardi. Tafsilotlar uchun admin bilan bog'laning.",
    holiday: "IT Center jamoasi sizni bayram bilan tabriklaymiz! 🎉"
  };

  document.getElementById("msg-template")?.addEventListener("change", (e) => {
    const content = document.getElementById("msg-content");
    if (content && templates[e.target.value]) {
      content.value = templates[e.target.value];
      updateCharCount();
    }
  });

  // Character counter
  function updateCharCount() {
    const content = document.getElementById("msg-content");
    const counter = document.querySelector(".message-char-count");
    if (content && counter) {
      const len = content.value.length;
      counter.textContent = `${len} / 160 belgi`;
      counter.style.color = len > 160 ? "#f87171" : "#9ca3af";
    }
  }

  document.getElementById("msg-content")?.addEventListener("input", updateCharCount);

  // Send message
  document.getElementById("send-message-btn")?.addEventListener("click", () => {
    const content = document.getElementById("msg-content")?.value;
    const recipients = document.getElementById("msg-recipients")?.value;

    if (!content?.trim()) {
      adminShowToast("❌ Xabar matni kiritilmagan!", "error");
      return;
    }

    const db = window.ITCenterDB;
    let recipientCount = 0;

    if (recipients === "all") {
      recipientCount = db?.students?.getAll()?.length || 0;
    } else if (recipients === "active") {
      recipientCount = db?.students?.getAll()?.filter(s => s.status === "active")?.length || 0;
    } else if (recipients === "debt") {
      recipientCount = db?.students?.getAll()?.filter(s => s.paymentStatus === "debt" || s.paymentStatus === "unpaid")?.length || 0;
    } else if (recipients === "group") {
      const groupId = document.getElementById("msg-group-id")?.value;
      recipientCount = db?.students?.getAll()?.filter(s => s.groupId === groupId)?.length || 0;
    }

    // Simulate sending
    const msg = {
      id: Date.now(),
      type: messageType,
      recipients: recipients,
      count: recipientCount,
      content: content.substring(0, 50) + "...",
      status: "sent",
      timestamp: Date.now()
    };
    messageHistory.unshift(msg);
    loadMessagesHistory();

    document.getElementById("msg-content").value = "";
    updateCharCount();

    adminShowToast(`📤 ${messageType.toUpperCase()} yuborildi: ${recipientCount} ta qabul qiluvchi`, "success");
    db?.logActivity("message_send", `${recipientCount} talabaga`, `${messageType.toUpperCase()} xabar yuborildi`);
  });

  function loadMessagesHistory() {
    const tbody = document.getElementById("messages-history-body");
    if (!tbody) return;

    if (messageHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #9ca3af;">Xabarlar tarixi bo'sh</td></tr>`;
      return;
    }

    tbody.innerHTML = messageHistory.slice(0, 20).map(m => `
      <tr>
        <td>${new Date(m.timestamp).toLocaleString("uz-UZ")}</td>
        <td>${m.type === "sms" ? "📱 SMS" : m.type === "email" ? "📧 Email" : "📱📧 Ikkalasi"}</td>
        <td>${m.count} ta talabaga</td>
        <td><span class="admin-status admin-status-ok">Yuborildi</span></td>
      </tr>
    `).join("");
  }

  // =========================
  // REPORTS (PDF)
  // =========================
  function generatePDFReport(type) {
    const db = window.ITCenterDB;
    if (!db) return;

    let title = "";
    let content = "";

    if (type === "students") {
      title = "Talabalar ro'yxati";
      const status = document.getElementById("report-students-status")?.value || "all";
      let students = db.students.getAll();
      if (status === "active") students = students.filter(s => s.status === "active");
      if (status === "graduated") students = students.filter(s => s.status === "graduated");

      content = `
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr><th>#</th><th>Ism</th><th>Telefon</th><th>Guruh</th><th>Holat</th></tr>
          ${students.map((s, i) => `<tr><td>${i + 1}</td><td>${s.fullName}</td><td>${s.phone}</td><td>${s.groupId || "—"}</td><td>${s.status}</td></tr>`).join("")}
        </table>
        <p>Jami: ${students.length} ta talaba</p>
      `;
    } else if (type === "payments") {
      title = "Moliyaviy hisobot";
      const payments = db.payments.getAll();
      const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      content = `
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr><th>Sana</th><th>Talaba</th><th>Summa</th><th>Usul</th><th>Status</th></tr>
          ${payments.slice(0, 50).map(p => {
        const student = db.students.getById(p.studentId);
        return `<tr><td>${p.date}</td><td>${student?.fullName || "—"}</td><td>${formatCurrency(p.amount)}</td><td>${p.method}</td><td>${p.status}</td></tr>`;
      }).join("")}
        </table>
        <p><strong>Jami tushum:</strong> ${formatCurrency(totalAmount)}</p>
      `;
    } else if (type === "attendance") {
      title = "Davomat hisoboti";
      const attendance = db.attendance.getAll();

      content = `
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr><th>Sana</th><th>Guruh</th><th>Ishtirokchilar</th><th>Foiz</th></tr>
          ${attendance.slice(0, 50).map(a => `<tr><td>${a.date}</td><td>${a.groupId}</td><td>${a.presentStudents}/${a.totalStudents}</td><td>${a.percentage}%</td></tr>`).join("")}
        </table>
      `;
    } else if (type === "statistics") {
      title = "Oylik statistika";
      const stats = db.getStats();

      content = `
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr><td>Jami talabalar</td><td>${stats.totalStudents}</td></tr>
          <tr><td>Faol talabalar</td><td>${stats.activeStudents}</td></tr>
          <tr><td>Aktiv guruhlar</td><td>${stats.activeGroups}</td></tr>
          <tr><td>Jami to'lovlar</td><td>${formatCurrency(stats.totalPayments)}</td></tr>
          <tr><td>Bu oy to'lovlar</td><td>${formatCurrency(stats.monthlyPayments)}</td></tr>
          <tr><td>Qarzdor talabalar</td><td>${stats.debtStudents}</td></tr>
          <tr><td>Yangi arizalar</td><td>${stats.newApplications}</td></tr>
        </table>
      `;
    }

    // Create print window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - IT Center</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          table { margin: 20px 0; }
          th { background: #3b82f6; color: white; padding: 8px; }
          td { padding: 8px; border: 1px solid #ddd; }
          p { font-size: 14px; color: #666; }
          .date { text-align: right; color: #999; }
        </style>
      </head>
      <body>
        <h1>📊 ${title}</h1>
        <p class="date">Sana: ${new Date().toLocaleDateString("uz-UZ")}</p>
        ${content}
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();

    adminShowToast(`📄 ${title} PDF tayyorlandi!`, "success");
    db?.logActivity("report_generate", title, "PDF hisobot yaratildi");
  }

  // Report buttons
  document.querySelectorAll("[data-report]").forEach(btn => {
    btn.addEventListener("click", () => {
      generatePDFReport(btn.dataset.report);
    });
  });

  // Load messages section
  document.querySelectorAll(".admin-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.section === "messages") {
        setTimeout(loadMessagesHistory, 100);
      }
    });
  });

  // =========================
  // ADMIN USERS MANAGEMENT
  // =========================
  let adminUsers = JSON.parse(localStorage.getItem("it_admin_users") || "null") || [
    { id: 1, username: "admin", fullName: "Super Admin", email: "admin@itcenter.uz", role: "super_admin", status: "active", lastLogin: Date.now(), passwordHash: "hashed_admin123" },
    { id: 2, username: "manager", fullName: "Direktor", email: "manager@itcenter.uz", role: "admin", status: "active", lastLogin: Date.now() - 3600000, passwordHash: "hashed_pass123" },
    { id: 3, username: "operator", fullName: "O'quv bo'limi", email: "operator@itcenter.uz", role: "viewer", status: "active", lastLogin: Date.now() - 86400000, passwordHash: "hashed_pass456" }
  ];

  // Simple password hash simulation (real would use bcrypt)
  function simpleHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return "hashed_" + Math.abs(hash).toString(36);
  }

  function loadAdminsData() {
    const tbody = document.getElementById("admins-table-body");
    if (!tbody) return;

    const roleLabels = {
      super_admin: { text: "Super Admin", class: "role-badge-super" },
      admin: { text: "Admin", class: "role-badge-admin" },
      viewer: { text: "Ko'ruvchi", class: "role-badge-viewer" }
    };

    tbody.innerHTML = adminUsers.map(a => `
      <tr data-admin-id="${a.id}">
        <td>${a.fullName}</td>
        <td><code>${a.username}</code></td>
        <td>${a.email}</td>
        <td><span class="role-badge ${roleLabels[a.role]?.class || ''}">${roleLabels[a.role]?.text || a.role}</span></td>
        <td><span class="admin-status admin-status-ok">${a.status === "active" ? "Faol" : "Nofaol"}</span></td>
        <td>${new Date(a.lastLogin).toLocaleString("uz-UZ")}</td>
        <td>
          ${a.role !== "super_admin" ? `
            <button class="admin-btn admin-btn-sm" onclick="window.editAdminUser(${a.id})">✏️</button>
            <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="window.deleteAdminUser(${a.id})">🗑️</button>
          ` : '<span style="color:#64748b;">—</span>'}
        </td>
      </tr>
    `).join("");
  }

  // Admin modal functions
  function openAdminModal(editId = null) {
    const overlay = document.getElementById("admin-modal-overlay");
    const title = document.getElementById("admin-modal-title");
    const form = document.getElementById("admin-form");
    const editIdInput = document.getElementById("admin-edit-id");
    const passwordInput = document.getElementById("admin-password");
    const passwordConfirm = document.getElementById("admin-password-confirm");

    if (editId !== null) {
      title.textContent = "✏️ Adminni tahrirlash";
      const admin = adminUsers.find(a => a.id === editId);
      if (admin) {
        document.getElementById("admin-fullname").value = admin.fullName;
        document.getElementById("admin-username").value = admin.username;
        document.getElementById("admin-email").value = admin.email;
        document.getElementById("admin-role").value = admin.role;
        passwordInput.placeholder = "O'zgarmaslik uchun bo'sh qoldiring";
        passwordInput.required = false;
        passwordConfirm.required = false;
        editIdInput.value = editId;
      }
    } else {
      title.textContent = "➕ Yangi admin qo'shish";
      form.reset();
      passwordInput.placeholder = "Kamida 6 ta belgi";
      passwordInput.required = true;
      passwordConfirm.required = true;
      editIdInput.value = "";
    }

    overlay.style.display = "flex";
  }

  function closeAdminModal() {
    document.getElementById("admin-modal-overlay").style.display = "none";
  }

  // Modal handlers
  document.getElementById("add-admin-btn")?.addEventListener("click", () => openAdminModal());
  document.getElementById("admin-modal-close")?.addEventListener("click", closeAdminModal);
  document.getElementById("admin-cancel-btn")?.addEventListener("click", closeAdminModal);
  document.getElementById("admin-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "admin-modal-overlay") closeAdminModal();
  });

  // Form submit
  document.getElementById("admin-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const editId = document.getElementById("admin-edit-id").value;
    const password = document.getElementById("admin-password").value;
    const passwordConfirm = document.getElementById("admin-password-confirm").value;

    // Validate password
    if (password && password.length < 6) {
      adminShowToast("❌ Parol kamida 6 ta belgidan iborat bo'lishi kerak", "error");
      return;
    }
    if (password && password !== passwordConfirm) {
      adminShowToast("❌ Parollar mos kelmadi", "error");
      return;
    }

    const adminData = {
      fullName: document.getElementById("admin-fullname").value.trim(),
      username: document.getElementById("admin-username").value.trim(),
      email: document.getElementById("admin-email").value.trim(),
      role: document.getElementById("admin-role").value,
      status: "active",
      lastLogin: Date.now()
    };

    if (editId) {
      // Update existing
      const idx = adminUsers.findIndex(a => a.id === parseInt(editId));
      if (idx !== -1) {
        adminUsers[idx] = { ...adminUsers[idx], ...adminData };
        if (password) {
          adminUsers[idx].passwordHash = simpleHash(password);
        }
        adminShowToast("✅ Admin muvaffaqiyatli yangilandi!", "success");
      }
    } else {
      // Add new
      const maxId = Math.max(0, ...adminUsers.map(a => a.id));
      adminUsers.push({
        id: maxId + 1,
        ...adminData,
        passwordHash: simpleHash(password)
      });
      adminShowToast("✅ Yangi admin qo'shildi!", "success");
    }

    // Save to localStorage
    localStorage.setItem("it_admin_users", JSON.stringify(adminUsers));

    const db = window.ITCenterDB;
    db?.logActivity("admin_manage", adminData.fullName, editId ? "Admin tahrirlandi" : "Yangi admin yaratildi");

    closeAdminModal();
    loadAdminsData();
  });

  // Global edit/delete functions
  window.editAdminUser = function (id) {
    openAdminModal(id);
  };

  window.deleteAdminUser = function (id) {
    const admin = adminUsers.find(a => a.id === id);
    if (!admin) return;
    if (admin.role === "super_admin") {
      adminShowToast("❌ Super adminni o'chirish mumkin emas", "error");
      return;
    }
    if (!confirm(`"${admin.fullName}" adminni o'chirishni tasdiqlaysizmi?`)) return;

    adminUsers = adminUsers.filter(a => a.id !== id);
    localStorage.setItem("it_admin_users", JSON.stringify(adminUsers));
    loadAdminsData();
    adminShowToast("🗑️ Admin o'chirildi", "success");

    const db = window.ITCenterDB;
    db?.logActivity("admin_manage", admin.fullName, "Admin o'chirildi");
  };

  function loadLoginHistory() {
    const db = window.ITCenterDB;
    const tbody = document.getElementById("login-history-body");
    if (!tbody) return;

    // Get fresh data from localStorage
    const freshData = JSON.parse(localStorage.getItem('itcenter_db') || '{}');
    const allActivities = freshData.activityLog || [];

    // Filter for login/logout actions
    const loginActions = allActivities.filter(a =>
      a.action === 'admin_login' || a.action === 'admin_logout' ||
      a.action === 'student_login' || a.action === 'student_logout'
    ).slice(-50);

    if (loginActions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-secondary);">Hozircha login tarixi yo\'q</td></tr>';
      return;
    }

    // Get browser info
    const getBrowserInfo = () => {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Brauzer';
    };

    tbody.innerHTML = loginActions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(h => {
      const isLogin = h.action.includes('login');
      const isAdmin = h.action.includes('admin');
      return `
        <tr>
          <td>${new Date(h.timestamp).toLocaleString("uz-UZ")}</td>
          <td>${h.user || 'Noma\'lum'} ${isAdmin ? '(Admin)' : '(Talaba)'}</td>
          <td><span class="admin-status ${isLogin ? "admin-status-ok" : "admin-status-closed"}">${isLogin ? "Kirdi" : "Chiqdi"}</span></td>
          <td>127.0.0.1</td>
          <td>${getBrowserInfo()}</td>
        </tr>
      `;
    }).join("");
  }

  // Load admins on section switch
  document.querySelectorAll(".admin-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.section === "admins") {
        setTimeout(() => {
          loadAdminsData();
          loadLoginHistory();
        }, 100);
      }
    });
  });

  // Add admin button
  document.getElementById("add-admin-btn")?.addEventListener("click", () => {
    adminShowToast("➕ Yangi admin qo'shish modali - keyingi yangilanishda", "info");
  });

  // =========================
  // MOBILE MENU TOGGLE
  // =========================
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const sidebar = document.querySelector(".admin-sidebar");

  if (mobileMenuBtn && sidebar) {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "admin-sidebar-overlay";
    document.body.appendChild(overlay);

    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("visible");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
    });

    // Close sidebar on menu item click (mobile)
    document.querySelectorAll(".admin-menu-item").forEach(btn => {
      btn.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("open");
          overlay.classList.remove("visible");
        }
      });
    });
  }

  // =========================
  // HAMMASINI QAYTA YUKLASH
  // =========================
  async function reloadAllData() {
    studentsLoaded = false;
    groupsLoaded = false;
    coursesLoaded = false;
    mentorsLoaded = false;
    applicationsLoaded = false;
    await Promise.all([
      loadStudentsIfNeeded(),
      loadGroupsIfNeeded(),
      loadCoursesIfNeeded(),
      loadMentorsIfNeeded(),
      loadApplicationsIfNeeded(),
    ]);
  }

  // =========================
  // ATTENDANCE SECTION
  // =========================
  const attendanceGroupSelect = document.getElementById("attendance-group-select");
  const attendanceStudentsList = document.getElementById("attendance-students-list");
  const attendanceActions = document.getElementById("attendance-actions");
  const attendanceSaveBtn = document.getElementById("attendance-save-btn");
  const attendanceSelectAll = document.getElementById("attendance-select-all");
  const attendanceTodayStats = document.getElementById("attendance-today-stats");

  let currentAttendanceGroup = null;

  // Load groups into dropdown
  function loadAttendanceGroups() {
    if (!attendanceGroupSelect) return;

    // Get fresh data from localStorage
    const freshData = JSON.parse(localStorage.getItem('itcenter_db') || '{}');
    const groups = freshData.groups || [];

    attendanceGroupSelect.innerHTML = '<option value="">-- Guruh tanlang --</option>';

    groups.forEach(g => {
      // Count actual students in this group (exclude pending applications)
      const students = (freshData.students || []).filter(s =>
        s.groupId === g.id && s.status !== 'applied' && s.status !== 'rejected' && s.status !== 'postponed'
      );
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = `${g.id} - ${students.length} talaba`;
      attendanceGroupSelect.appendChild(opt);
    });
  }

  // Load students for selected group
  function loadAttendanceStudents(groupId) {
    if (!attendanceStudentsList) return;
    const db = window.ITCenterDB;
    if (!db) return;

    // Get fresh data from localStorage
    const freshData = JSON.parse(localStorage.getItem('itcenter_db') || '{}');

    const group = db.groups.getById(groupId);
    if (!group) {
      attendanceStudentsList.innerHTML = '<div class="attendance-placeholder">Guruh topilmadi</div>';
      attendanceActions.style.display = "none";
      return;
    }

    currentAttendanceGroup = group;

    // Get REAL students from database who are in this group
    const allStudents = freshData.students || [];
    const groupStudents = allStudents.filter(s =>
      s.groupId === groupId && s.status !== 'applied' && s.status !== 'rejected' && s.status !== 'postponed'
    );

    if (groupStudents.length === 0) {
      attendanceStudentsList.innerHTML = '<div class="attendance-placeholder">Bu guruhda ho\'zircha talaba yo\'q</div>';
      attendanceActions.style.display = "none";
      return;
    }

    // Check if already has attendance today
    const todayAttendance = db.attendance?.getTodayByGroup?.(groupId);

    attendanceStudentsList.innerHTML = "";

    groupStudents.forEach((student, i) => {
      const item = document.createElement("div");
      item.className = "attendance-student-item";
      item.innerHTML = `
        <input type="checkbox" class="attendance-checkbox" data-student-id="${student.id}" data-index="${i}" ${todayAttendance ? "checked" : ""}>
        <span class="attendance-student-name">${student.fullName}</span>
        <span class="attendance-student-status">${todayAttendance ? "✓ Keldi" : ""}</span>
      `;

      const checkbox = item.querySelector(".attendance-checkbox");
      checkbox.addEventListener("change", () => {
        item.classList.toggle("attendance-student-item--present", checkbox.checked);
        item.querySelector(".attendance-student-status").textContent = checkbox.checked ? "✓ Keldi" : "";
      });

      attendanceStudentsList.appendChild(item);
    });

    attendanceActions.style.display = "flex";
  }

  // Save attendance
  function saveAttendance() {
    if (!currentAttendanceGroup) return;
    const db = window.ITCenterDB;
    if (!db) return;

    const checkboxes = attendanceStudentsList.querySelectorAll(".attendance-checkbox");
    let presentCount = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) presentCount++;
    });

    const result = db.attendance.markAttendance(
      currentAttendanceGroup.id,
      presentCount,
      currentAttendanceGroup.studentCount
    );

    adminShowToast(`✅ Davomat saqlandi: ${presentCount}/${currentAttendanceGroup.studentCount} (${result.percentage}%)`, "success");
    loadTodayStats();
  }

  // Select all students
  function selectAllStudents() {
    const checkboxes = attendanceStudentsList.querySelectorAll(".attendance-checkbox");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => {
      cb.checked = !allChecked;
      const item = cb.closest(".attendance-student-item");
      item.classList.toggle("checked", cb.checked);
      item.querySelector(".attendance-student-status").textContent = cb.checked ? "✓ Keldi" : "";
    });
  }

  // Load today's attendance stats
  function loadTodayStats() {
    if (!attendanceTodayStats) return;
    const db = window.ITCenterDB;
    if (!db) return;

    const todayRecords = db.attendance.getToday();

    if (todayRecords.length === 0) {
      attendanceTodayStats.innerHTML = '<div class="attendance-placeholder">Bugun hali davomat qilinmagan</div>';
      return;
    }

    attendanceTodayStats.innerHTML = "";

    todayRecords.forEach(record => {
      const percentClass = record.percentage >= 80 ? "high" : record.percentage >= 50 ? "medium" : "low";

      const item = document.createElement("div");
      item.className = "attendance-stat-item";
      item.innerHTML = `
        <span class="attendance-stat-group">${record.groupId}</span>
        <span class="attendance-stat-percent attendance-stat-percent--${percentClass}">${record.percentage}%</span>
      `;
      attendanceTodayStats.appendChild(item);
    });
  }

  // Event listeners
  if (attendanceGroupSelect) {
    attendanceGroupSelect.addEventListener("change", (e) => {
      if (e.target.value) {
        loadAttendanceStudents(e.target.value);
      } else {
        attendanceStudentsList.innerHTML = '<div class="attendance-placeholder">👆 Guruh tanlang va talabalar ro\'yxati ko\'rinadi</div>';
        attendanceActions.style.display = "none";
      }
    });
  }

  if (attendanceSaveBtn) {
    attendanceSaveBtn.addEventListener("click", saveAttendance);
  }

  if (attendanceSelectAll) {
    attendanceSelectAll.addEventListener("click", selectAllStudents);
  }

  // Load attendance on section switch
  const originalShowSection = window.adminShowSection;
  document.querySelectorAll(".admin-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      if (section === "attendance") {
        loadAttendanceGroups();
        loadTodayStats();
      }
    });
  });

  // =========================
  // STUDENT EDIT MODAL
  // =========================
  function openStudentEditModal(studentId) {
    const db = window.ITCenterDB;
    if (!db) return;

    const student = db.students.getById(studentId);
    if (!student) {
      adminShowToast("Talaba topilmadi!", "error");
      return;
    }

    const courses = db.courses.getAll();
    const groups = db.groups.getAll();

    // Create modal dynamically
    let modal = document.getElementById("student-edit-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "student-edit-modal";
      modal.className = "admin-modal-overlay";
      document.body.appendChild(modal);
    }

    const courseOptions = courses.map(c =>
      `<option value="${c.id}" ${c.id === student.courseId ? "selected" : ""}>${c.name}</option>`
    ).join("");

    const groupOptions = groups.map(g =>
      `<option value="${g.id}" ${g.id === student.groupId ? "selected" : ""}>${g.id} - ${g.room}</option>`
    ).join("");

    modal.innerHTML = `
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h2>✏️ Talaba tahrirlash</h2>
          <button class="admin-modal-close" id="student-modal-close">✕</button>
        </div>
        <div class="admin-modal-body">
          <form id="student-edit-form">
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>To'liq ism</label>
                <input type="text" name="fullName" value="${student.fullName}" required class="admin-input">
              </div>
              <div class="admin-form-group">
                <label>Telefon</label>
                <input type="text" name="phone" value="${student.phone || ""}" class="admin-input">
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Email</label>
                <input type="email" name="email" value="${student.email || ""}" class="admin-input">
              </div>
              <div class="admin-form-group">
                <label>Tug'ilgan sana</label>
                <input type="date" name="birthDate" value="${student.birthDate || ""}" class="admin-input">
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Kurs</label>
                <select name="courseId" class="admin-select">
                  ${courseOptions}
                </select>
              </div>
              <div class="admin-form-group">
                <label>Guruh</label>
                <select name="groupId" class="admin-select">
                  <option value="">— Tanlanmagan —</option>
                  ${groupOptions}
                </select>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Holati</label>
                <select name="status" class="admin-select">
                  <option value="active" ${student.status === "active" ? "selected" : ""}>Faol</option>
                  <option value="graduated" ${student.status === "graduated" ? "selected" : ""}>Bitirgan</option>
                  <option value="frozen" ${student.status === "frozen" ? "selected" : ""}>Muzlatilgan</option>
                  <option value="applied" ${student.status === "applied" ? "selected" : ""}>Ariza</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>To'lov holati</label>
                <select name="paymentStatus" class="admin-select">
                  <option value="paid" ${student.paymentStatus === "paid" ? "selected" : ""}>To'langan</option>
                  <option value="partial" ${student.paymentStatus === "partial" ? "selected" : ""}>Qisman</option>
                  <option value="debt" ${student.paymentStatus === "debt" ? "selected" : ""}>Qarzdor</option>
                  <option value="unpaid" ${student.paymentStatus === "unpaid" ? "selected" : ""}>To'lanmagan</option>
                </select>
              </div>
            </div>
            <div class="admin-form-group">
              <label>Izoh / Ariza ma'lumoti</label>
              <textarea name="note" class="admin-input" rows="3" style="width: 100%; height: auto;">${student.note || ""}</textarea>
            </div>
            <div class="admin-form-group">
              <label>Ro'yxatga olingan sana</label>
              <input type="date" name="enrollDate" value="${student.enrollDate || ""}" class="admin-input">
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button type="button" class="admin-btn" id="student-modal-cancel">Bekor qilish</button>
          <button type="button" class="admin-btn admin-btn-primary" id="student-modal-save">💾 Saqlash</button>
          <button type="button" class="admin-btn admin-btn-danger" id="student-modal-delete">🗑️ O'chirish</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";

    // Event handlers
    document.getElementById("student-modal-close").onclick = () => modal.style.display = "none";
    document.getElementById("student-modal-cancel").onclick = () => modal.style.display = "none";

    document.getElementById("student-modal-save").onclick = () => {
      const form = document.getElementById("student-edit-form");
      const formData = new FormData(form);

      const updates = {
        fullName: formData.get("fullName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        birthDate: formData.get("birthDate"),
        courseId: parseInt(formData.get("courseId")),
        groupId: formData.get("groupId"),
        status: formData.get("status"),
        paymentStatus: formData.get("paymentStatus"),
        enrollDate: formData.get("enrollDate"),
        note: formData.get("note")
      };

      db.students.update(studentId, updates);
      modal.style.display = "none";
      studentsLoaded = false;
      loadStudents();
      adminShowToast("✅ Talaba ma'lumotlari saqlandi!", "success");
    };

    document.getElementById("student-modal-delete").onclick = () => {
      if (confirm(`"${student.fullName}" ni o'chirishni xohlaysizmi?`)) {
        db.students.delete(studentId);
        modal.style.display = "none";
        studentsLoaded = false;
        loadStudents();
        adminShowToast("🗑️ Talaba o'chirildi!", "success");
      }
    };

    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }

  // Add new student button handler - opens modal with empty form
  const addStudentBtn = document.getElementById("add-student-btn");
  if (addStudentBtn) {
    addStudentBtn.addEventListener("click", () => {
      openStudentAddModal();
    });
  }

  function openStudentAddModal() {
    const db = window.ITCenterDB;
    if (!db) return;

    const courses = db.courses.getAll();
    const groups = db.groups.getAll();

    // Create modal dynamically
    let modal = document.getElementById("student-edit-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "student-edit-modal";
      modal.className = "admin-modal-overlay";
      document.body.appendChild(modal);
    }

    const courseOptions = courses.map(c =>
      `<option value="${c.id}">${c.name}</option>`
    ).join("");

    const groupOptions = groups.map(g =>
      `<option value="${g.id}">${g.id} - ${g.room} (${g.studentCount}/${g.capacity})</option>`
    ).join("");

    const today = new Date().toISOString().split("T")[0];

    modal.innerHTML = `
      <div class="admin-modal-content" style="max-width: 600px;">
        <div class="admin-modal-header">
          <h2>➕ Yangi talaba qo'shish</h2>
          <button class="admin-modal-close" id="student-modal-close">✕</button>
        </div>
          <button class="admin-modal-close" id="student-modal-close">✕</button>
        </div>
        <div class="admin-modal-body">
          <form id="student-edit-form">
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>To'liq ism *</label>
                <input type="text" name="fullName" required class="admin-input" placeholder="Ism Familiya">
              </div>
              <div class="admin-form-group">
                <label>Telefon *</label>
                <input type="text" name="phone" class="admin-input" placeholder="+998901234567">
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Email</label>
                <input type="email" name="email" class="admin-input" placeholder="email@mail.uz">
              </div>
              <div class="admin-form-group">
                <label>Tug'ilgan sana</label>
                <input type="date" name="birthDate" class="admin-input">
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Kurs *</label>
                <select name="courseId" class="admin-select" required>
                  ${courseOptions}
                </select>
              </div>
              <div class="admin-form-group">
                <label>Guruh</label>
                <select name="groupId" class="admin-select">
                  <option value="">— Keyinroq tayinlanadi —</option>
                  ${groupOptions}
                </select>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Holati</label>
                <select name="status" class="admin-select">
                  <option value="applied">Ariza</option>
                  <option value="active">Faol</option>
                  <option value="frozen">Muzlatilgan</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>To'lov holati</label>
                <select name="paymentStatus" class="admin-select">
                  <option value="unpaid">To'lanmagan</option>
                  <option value="partial">Qisman</option>
                  <option value="paid">To'langan</option>
                </select>
              </div>
            </div>
            <div class="admin-form-group">
              <label>Ro'yxatga olingan sana</label>
              <input type="date" name="enrollDate" value="${today}" class="admin-input">
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button type="button" class="admin-btn" id="student-modal-cancel">Bekor qilish</button>
          <button type="button" class="admin-btn admin-btn-primary" id="student-modal-save">➕ Qo'shish</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";

    // Event handlers
    document.getElementById("student-modal-close").onclick = () => modal.style.display = "none";
    document.getElementById("student-modal-cancel").onclick = () => modal.style.display = "none";

    document.getElementById("student-modal-save").onclick = () => {
      const form = document.getElementById("student-edit-form");
      const formData = new FormData(form);

      const fullName = formData.get("fullName");
      if (!fullName) {
        adminShowToast("Ism kiritilishi shart!", "error");
        return;
      }

      const newStudent = {
        fullName,
        phone: formData.get("phone") || "",
        email: formData.get("email") || "",
        birthDate: formData.get("birthDate") || "",
        courseId: parseInt(formData.get("courseId")),
        groupId: formData.get("groupId") || "",
        status: formData.get("status"),
        paymentStatus: formData.get("paymentStatus"),
        enrollDate: formData.get("enrollDate") || today
      };

      // Add to database
      db.students.add(newStudent);

      // Update group studentCount if group is selected
      if (newStudent.groupId) {
        const group = db.groups.getById(newStudent.groupId);
        if (group) {
          db.groups.update(newStudent.groupId, { studentCount: group.studentCount + 1 });
        }
      }

      modal.style.display = "none";
      studentsLoaded = false;
      loadStudents();
      adminShowToast(`✅ "${fullName}" qo'shildi!`, "success");
    };

    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }

  // ============================================
  // VIDEO DARSLAR MANAGEMENT
  // ============================================

  // Load courses dynamically
  function loadVideoCourseDropdowns() {
    const db = window.ITCenterDB;
    const freshData = JSON.parse(localStorage.getItem('itcenter_db') || '{}');
    const courses = freshData.courses || [];

    const videoSelect = document.getElementById("video-course-select");
    const filterSelect = document.getElementById("filter-video-course");

    const courseOptions = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

    if (videoSelect) {
      videoSelect.innerHTML = '<option value="">Kurs tanlang</option>' + courseOptions;
    }
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">Barcha kurslar</option>' + courseOptions;
    }
  }

  // Call on page load and when video section is shown
  loadVideoCourseDropdowns();

  // Get course names dynamically
  function getCourseNames() {
    const freshData = JSON.parse(localStorage.getItem('itcenter_db') || '{}');
    const courses = freshData.courses || [];
    const names = {};
    courses.forEach(c => { names[c.id] = c.name?.split('(')[0]?.trim() || c.name; });
    return names;
  }

  function renderVideosTable(filterCourseId = null) {
    const db = window.ITCenterDB;
    if (!db || !db.videoLessons) return;

    let videos = db.videoLessons.getAll();
    if (filterCourseId) {
      videos = videos.filter(v => v.courseId === parseInt(filterCourseId));
    }
    videos.sort((a, b) => a.courseId - b.courseId || a.order - b.order);

    const tbody = document.getElementById("videos-table-body");
    if (!tbody) return;

    tbody.innerHTML = videos.map((v, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <img src="https://img.youtube.com/vi/${v.youtubeId}/default.jpg" 
               alt="${v.title}" 
               style="width: 80px; border-radius: 4px; cursor: pointer;"
               onclick="window.open('https://youtube.com/watch?v=${v.youtubeId}', '_blank')">
        </td>
        <td><strong>${v.title}</strong></td>
        <td><span class="admin-badge admin-badge-info">${getCourseNames()[v.courseId] || v.courseId}</span></td>
        <td>${v.duration}</td>
        <td>
          <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="deleteVideo(${v.id})">🗑️</button>
        </td>
      </tr>
    `).join("");
  }

  // Add video form handler
  document.getElementById("add-video-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const courseId = parseInt(document.getElementById("video-course-select").value);
    const title = document.getElementById("video-title").value.trim();
    const youtubeId = document.getElementById("video-youtube-id").value.trim();
    const duration = document.getElementById("video-duration").value.trim();

    if (!courseId || !title || !youtubeId || !duration) {
      adminShowToast("❌ Barcha maydonlarni to'ldiring", "error");
      return;
    }

    const db = window.ITCenterDB;
    if (!db || !db.videoLessons) {
      adminShowToast("❌ Database xatosi", "error");
      return;
    }

    // Get next order number for this course
    const courseVideos = db.videoLessons.getByCourse(courseId);
    const nextOrder = courseVideos.length + 1;

    // Add video
    db.videoLessons.add({
      courseId,
      title,
      youtubeId,
      duration,
      order: nextOrder
    });

    adminShowToast(`✅ "${title}" video qo'shildi!`, "success");
    db.logActivity("video_add", "Admin", `${title} video qo'shildi (${courseNames[courseId]})`);

    // Reset form and refresh table
    e.target.reset();
    renderVideosTable();
  });

  // Delete video function
  window.deleteVideo = function (videoId) {
    if (!confirm("Bu videoni o'chirishni tasdiqlaysizmi?")) return;

    const db = window.ITCenterDB;
    if (!db || !db.videoLessons) return;

    const video = db.videoLessons.getById(videoId);
    if (video) {
      db.videoLessons.delete(videoId);
      adminShowToast(`🗑️ "${video.title}" o'chirildi`, "success");
      db.logActivity("video_delete", "Admin", `${video.title} video o'chirildi`);
      renderVideosTable();
    }
  };

  // Filter videos by course
  document.getElementById("filter-video-course")?.addEventListener("change", (e) => {
    renderVideosTable(e.target.value);
  });

  // Load videos when section is shown
  const videosSection = document.getElementById("admin-section-videos");
  if (videosSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.style.display !== "none") {
          renderVideosTable();
        }
      });
    });
    observer.observe(videosSection, { attributes: true, attributeFilter: ["style"] });
  }

  // Initial load if videos section is visible
  if (videosSection && videosSection.style.display !== "none") {
    renderVideosTable();
  }

  // ============================================
  // REGISTRATIONS MANAGEMENT (New Student Applications)
  // ============================================
  const statusLabels = {
    applied: { text: "Kutilmoqda", class: "admin-status-new" },
    approved: { text: "Tasdiqlangan", class: "admin-status-success" },
    active: { text: "Aktiv", class: "admin-status-active" },
    rejected: { text: "Rad etilgan", class: "admin-status-danger" },
    postponed: { text: "Kechiktirilgan", class: "admin-status-warning" }
  };

  let currentRegistrationId = null;

  function renderRegistrationsTable(filterCourseId = null) {
    const db = window.ITCenterDB;
    if (!db) return;

    // Get fresh data
    const freshData = JSON.parse(localStorage.getItem('itcenter_db') || '{}');
    let students = freshData.students || [];

    console.log('📋 renderRegistrationsTable called');
    console.log('📋 All students count:', students.length);
    console.log('📋 Students with applied status:', students.filter(s => s.status === 'applied').map(s => ({ id: s.id, name: s.fullName, status: s.status })));

    // Filter by applied/postponed status
    students = students.filter(s => s.status === 'applied' || s.status === 'postponed');

    console.log('📋 Filtered students (applied/postponed):', students.length);

    if (filterCourseId) {
      students = students.filter(s => s.courseId === parseInt(filterCourseId));
    }

    // Sort by applicationDate (newest first)
    students.sort((a, b) => new Date(b.applicationDate || b.enrollDate) - new Date(a.applicationDate || a.enrollDate));

    const tbody = document.getElementById("registrations-table-body");
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 40px; color: var(--text-secondary);">✅ Hozircha kutilayotgan ariza yo'q</td></tr>`;
    } else {
      tbody.innerHTML = students.map((s, i) => {
        const status = statusLabels[s.status] || statusLabels.applied;
        const appDate = s.applicationDate ? new Date(s.applicationDate).toLocaleDateString('uz-UZ') : s.enrollDate;
        const birthDate = s.birthDate ? new Date(s.birthDate).toLocaleDateString('uz-UZ') : '—';
        const educationFormat = s.educationFormat === 'online' ? '🌐 Onlayn' : '🏫 Offlayn';
        return `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${s.fullName}</strong></td>
            <td>${s.phone || '—'}</td>
            <td>${s.email || '—'}</td>
            <td><span class="admin-badge admin-badge-info">${courseNames[s.courseId] || 'N/A'}</span></td>
            <td>${birthDate}</td>
            <td>${s.address || '—'}</td>
            <td><span class="admin-badge">${educationFormat}</span></td>
            <td>${appDate}</td>
            <td><span class="admin-status ${status.class}">${status.text}</span></td>
            <td class="admin-actions-cell">
              <button class="admin-btn admin-btn-sm admin-btn-primary" onclick="openApproveModal(${s.id})" title="Tasdiqlash">✅</button>
              <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="openRejectModal(${s.id})" title="Rad etish">❌</button>
              <button class="admin-btn admin-btn-sm admin-btn-warning" onclick="openPostponeModal(${s.id})" title="Kechiktirish">⏳</button>
            </td>
          </tr>
        `;
      }).join("");
    }

    // Update badge count
    const badge = document.getElementById("registrations-count");
    if (badge) {
      badge.textContent = students.length;
      badge.style.display = students.length > 0 ? 'inline-flex' : 'none';
    }
  }

  // Approval Modal Functions
  window.openApproveModal = function (studentId) {
    currentRegistrationId = studentId;
    const db = window.ITCenterDB;
    const student = db.students.getById(studentId);
    if (!student) return;

    document.getElementById("approve-student-info").innerHTML = `
      <strong>${student.fullName}</strong><br>
      Email: ${student.email}<br>
      Kurs: ${courseNames[student.courseId] || 'N/A'}
    `;

    // Populate groups for this course
    const groups = db.groups?.getAll()?.filter(g => g.courseId === student.courseId) || [];
    const select = document.getElementById("approve-group-select");
    select.innerHTML = '<option value="">Guruh tanlang...</option>' +
      groups.map(g => `<option value="${g.id}">${g.id} (${g.studentCount || 0}/${g.capacity || '∞'})</option>`).join("");

    document.getElementById("approve-new-group").value = "";
    document.getElementById("approve-modal").classList.add("show");
  };

  window.closeApproveModal = function () {
    document.getElementById("approve-modal").classList.remove("show");
    currentRegistrationId = null;
  };

  window.confirmApproval = function () {
    if (!currentRegistrationId) return;

    const groupId = document.getElementById("approve-group-select").value;
    const newGroup = document.getElementById("approve-new-group").value.trim();
    const finalGroupId = newGroup || groupId;

    if (!finalGroupId) {
      adminShowToast("❌ Guruhni tanlang yoki yangi yarating", "error");
      return;
    }

    const db = window.ITCenterDB;

    // Create new group if needed
    if (newGroup && !db.groups.getById(newGroup)) {
      const student = db.students.getById(currentRegistrationId);
      db.groups.add({
        id: newGroup,
        courseId: student.courseId,
        mentorId: null,
        schedule: "Belgilanmagan",
        room: "TBD",
        capacity: 20,
        studentCount: 0,
        status: "recruiting"
      });
    }

    // Update student
    db.students.update(currentRegistrationId, {
      status: 'active',
      groupId: finalGroupId,
      approvedAt: new Date().toISOString(),
      approvedBy: JSON.parse(localStorage.getItem('admin_session'))?.adminName || 'Admin'
    });

    // Update group student count
    const freshData = JSON.parse(localStorage.getItem('itcenter_db') || '{}');
    const groupIndex = (freshData.groups || []).findIndex(g => g.id === finalGroupId);
    if (groupIndex !== -1) {
      freshData.groups[groupIndex].studentCount = (freshData.groups[groupIndex].studentCount || 0) + 1;
      localStorage.setItem('itcenter_db', JSON.stringify(freshData));
    }

    db.logActivity("student_approved", db.students.getById(currentRegistrationId)?.fullName, `${finalGroupId} guruhiga qo'shildi`);

    adminShowToast("✅ Talaba tasdiqlandi va guruhga qo'shildi!", "success");
    closeApproveModal();
    renderRegistrationsTable();
  };

  // Reject Modal Functions
  window.openRejectModal = function (studentId) {
    currentRegistrationId = studentId;
    const db = window.ITCenterDB;
    const student = db.students.getById(studentId);
    if (!student) return;

    document.getElementById("reject-student-info").innerHTML = `
      <strong>${student.fullName}</strong> - ${student.email}
    `;
    document.getElementById("reject-reason").value = "";
    document.getElementById("reject-modal").classList.add("show");
  };

  window.closeRejectModal = function () {
    document.getElementById("reject-modal").classList.remove("show");
    currentRegistrationId = null;
  };

  window.confirmRejection = function () {
    if (!currentRegistrationId) return;

    const reason = document.getElementById("reject-reason").value.trim();
    if (!reason) {
      adminShowToast("❌ Rad etish sababini kiriting", "error");
      return;
    }

    const db = window.ITCenterDB;
    db.students.update(currentRegistrationId, {
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: JSON.parse(localStorage.getItem('admin_session'))?.adminName || 'Admin'
    });

    db.logActivity("student_rejected", db.students.getById(currentRegistrationId)?.fullName, reason);

    adminShowToast("❌ Ariza rad etildi", "success");
    closeRejectModal();
    renderRegistrationsTable();
  };

  // Postpone Modal Functions
  window.openPostponeModal = function (studentId) {
    currentRegistrationId = studentId;
    const db = window.ITCenterDB;
    const student = db.students.getById(studentId);
    if (!student) return;

    document.getElementById("postpone-student-info").innerHTML = `
      <strong>${student.fullName}</strong> - ${student.email}
    `;
    document.getElementById("postpone-date").value = "";
    document.getElementById("postpone-note").value = "";
    document.getElementById("postpone-modal").classList.add("show");
  };

  window.closePostponeModal = function () {
    document.getElementById("postpone-modal").classList.remove("show");
    currentRegistrationId = null;
  };

  window.confirmPostpone = function () {
    if (!currentRegistrationId) return;

    const date = document.getElementById("postpone-date").value;
    const note = document.getElementById("postpone-note").value.trim();

    if (!date) {
      adminShowToast("❌ Kechiktirilgan sanani kiriting", "error");
      return;
    }

    const db = window.ITCenterDB;
    db.students.update(currentRegistrationId, {
      status: 'postponed',
      postponedUntil: date,
      postponeNote: note,
      postponedAt: new Date().toISOString(),
      postponedBy: JSON.parse(localStorage.getItem('admin_session'))?.adminName || 'Admin'
    });

    db.logActivity("student_postponed", db.students.getById(currentRegistrationId)?.fullName, `${date} gacha kechiktirildi`);

    adminShowToast("⏳ Ariza kechiktirildi", "success");
    closePostponeModal();
    renderRegistrationsTable();
  };

  // Filter registrations by course
  document.getElementById("reg-filter-course")?.addEventListener("change", (e) => {
    renderRegistrationsTable(e.target.value);
  });

  // Load registrations when section is shown
  const registrationsSection = document.getElementById("admin-section-registrations");
  if (registrationsSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.style.display !== "none") {
          renderRegistrationsTable();
        }
      });
    });
    observer.observe(registrationsSection, { attributes: true, attributeFilter: ["style"] });
  }

  // Initial load for registrations count badge
  renderRegistrationsTable();

  // ========================================
  // TRANSLATION MANAGEMENT SYSTEM
  // ========================================

  // Category mapping for translations (with Unicode apostrophe variants)
  const translationCategories = {
    // Navigation - both standard (') and Unicode (') apostrophes
    "Portal": "navigation", "Yo'nalishlar": "navigation", "Yo'nalishlar": "navigation",
    "Kurslar": "navigation", "Mentorlar": "navigation", "Jarayon": "navigation",
    "Jadval": "navigation", "Yozilish": "navigation", "Natijalar": "navigation",
    "FAQ": "navigation", "To'lov": "navigation", "To'lov": "navigation",
    "Manzil & To'lov": "navigation", "Manzil & To'lov": "navigation",
    "Kirish": "navigation", "Ro'yxatdan o'tish": "navigation", "Ro'yxatdan o'tish": "navigation",

    // Common
    "Yuklanmoqda…": "common", "Yuklanmoqda...": "common", "Yopish": "common",
    "Saqlash": "common", "Bekor qilish": "common", "O'chirish": "common",
    "Tahrirlash": "common", "Ko'rish": "common", "Qidirish": "common",
    "Barchasi": "common", "Tanlang": "common",

    // Hero
    "IT Center —": "hero", "O'zbekiston bo'yicha yagona raqamli IT portal": "hero",
    "O'zbekiston bo'yicha yagona raqamli IT portal": "hero",
    "frontend": "hero", "backend, dizayn va": "hero",

    // Courses
    "Eng mashhur kurslar": "courses", "Daraja bo'yicha filtrlash": "courses",
    "Boshlang'ich": "courses", "O'rta": "courses", "Yuqori": "courses",
    "Kurs qidirish...": "courses", "oy": "courses", "so'm": "courses",
    "Batafsil ma'lumot": "courses",

    // Auth
    "Email": "auth", "Parol": "auth", "Telefon": "auth",

    // Footer
    "© 2024 IT Center. Barcha huquqlar himoyalangan.": "footer",

    // Days
    "Dushanba": "days", "Seshanba": "days", "Chorshanba": "days",
    "Payshanba": "days", "Juma": "days", "Shanba": "days", "Yakshanba": "days",

    // Payment
    "To'lov usullari": "payment", "To'lov usullari": "payment",
    "Online to'lov": "payment", "Online to'lov": "payment",
    "To'lov miqdori (so'm)": "payment", "To'lov miqdori (so'm)": "payment",

    // Enrollment
    "Kursga yozilish (tez ariza)": "enroll", "To'liq ismingiz": "enroll",
    "Telefon raqamingiz": "enroll", "Qaysi kurs sizni qiziqtiradi?": "enroll",
    "O'qish formati": "enroll", "O'qish formati": "enroll",
    "Arizani yuborish": "enroll"
  };

  // Normalize text (replace Unicode apostrophes with standard)
  function normalizeText(text) {
    if (!text) return "";
    return text
      .replace(/'/g, "'")  // U+2018 LEFT SINGLE QUOTATION MARK
      .replace(/'/g, "'")  // U+2019 RIGHT SINGLE QUOTATION MARK
      .replace(/ʻ/g, "'")  // Modifier letter turned comma
      .replace(/ʼ/g, "'"); // Modifier letter apostrophe
  }

  // Get category for a translation
  function getTranslationCategory(uzText) {
    // Direct match first
    if (translationCategories[uzText]) {
      return translationCategories[uzText];
    }

    // Try normalized version
    const normalized = normalizeText(uzText);
    for (const key of Object.keys(translationCategories)) {
      if (normalizeText(key) === normalized) {
        return translationCategories[key];
      }
    }

    // Auto-detect by keywords
    const lowerText = uzText.toLowerCase();
    if (lowerText.includes("portal") || lowerText.includes("kurs") && lowerText.includes("ko'rish")) return "navigation";
    if (lowerText.includes("kurs") || lowerText.includes("daraja") || lowerText.includes("oy")) return "courses";
    if (lowerText.includes("to'lov") || lowerText.includes("to'lov") || lowerText.includes("payment")) return "payment";
    if (lowerText.includes("email") || lowerText.includes("parol") || lowerText.includes("telefon")) return "auth";
    if (lowerText.includes("shanba") || lowerText.includes("juma") || lowerText.includes("dushanba")) return "days";
    if (lowerText.includes("saqlash") || lowerText.includes("bekor") || lowerText.includes("yopish")) return "common";
    if (lowerText.includes("ariza") || lowerText.includes("ism") || lowerText.includes("format")) return "enroll";
    if (lowerText.includes("mentor")) return "mentors";
    if (lowerText.includes("it center") || lowerText.includes("frontend") || lowerText.includes("bitiruvchi")) return "hero";

    return "other";
  }

  // Load and display translation table
  let allTranslations = [];
  let filteredTranslations = [];

  function loadTranslationTable() {
    const textMap = window.__ITC_textMap || window.textMap || {};

    // Convert to array
    allTranslations = Object.entries(textMap).map(([uz, en], index) => ({
      id: index + 1,
      uz: uz,
      en: en,
      category: getTranslationCategory(uz)
    }));

    filteredTranslations = [...allTranslations];

    // Update stats
    updateTranslationStats();
    renderTranslationTable();
  }

  function updateTranslationStats() {
    const total = allTranslations.length;
    const uzCount = allTranslations.filter(t => t.uz && t.uz.trim().length > 0).length;
    const enCount = allTranslations.filter(t => t.en && t.en.trim().length > 0).length;
    const filtered = filteredTranslations.length;

    document.getElementById("translation-total").textContent = total;
    document.getElementById("translation-uz-count").textContent = uzCount;
    document.getElementById("translation-en-count").textContent = enCount;
    document.getElementById("translation-filtered").textContent = filtered;

    // Update stats in translation management section
    document.getElementById("total-translations-count").textContent = total;
    document.getElementById("custom-translations-count").textContent = "0"; // For future custom translations
  }

  function renderTranslationTable() {
    const tbody = document.getElementById("translations-table-body");

    if (!tbody) {
      console.warn("Translation table body not found");
      return;
    }

    if (filteredTranslations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-secondary);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
            <div>Hech qanday tarjima topilmadi</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredTranslations.map(t => {
      const categoryIcons = {
        navigation: "🧭", common: "🔤", hero: "🎯",
        courses: "📚", auth: "🔐", footer: "📄",
        days: "📅", payment: "💳", enroll: "✍️", other: "📦"
      };

      return `
        <tr>
          <td style="text-align: center; color: var(--text-secondary); font-size: 0.85rem;">${t.id}</td>
          <td>
            <span style="font-size: 0.85rem;">
              ${categoryIcons[t.category] || "📦"} ${t.category}
            </span>
          </td>
          <td style="font-size: 0.9rem;">${escapeHtml(t.uz)}</td>
          <td style="font-size: 0.9rem; color: var(--text-secondary);">${escapeHtml(t.en)}</td>
        </tr>
      `;
    }).join("");

    // Update page info
    document.getElementById("translation-page-info").textContent =
      `${filteredTranslations.length} tadan ${filteredTranslations.length} ta ko'rsatilmoqda`;
  }

  // Search translations
  function searchTranslations(query) {
    const q = query.toLowerCase().trim();

    if (!q) {
      filteredTranslations = [...allTranslations];
    } else {
      filteredTranslations = allTranslations.filter(t =>
        t.uz.toLowerCase().includes(q) ||
        t.en.toLowerCase().includes(q)
      );
    }

    updateTranslationStats();
    renderTranslationTable();
  }

  // Filter by category
  function filterByCategory(category) {
    if (category === "all") {
      filteredTranslations = [...allTranslations];
    } else {
      filteredTranslations = allTranslations.filter(t => t.category === category);
    }

    updateTranslationStats();
    renderTranslationTable();
  }

  // Export translations as JSON
  function exportTranslationsJSON() {
    const textMap = window.__ITC_textMap || window.textMap || {};
    const dataStr = JSON.stringify(textMap, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    adminShowToast("✅ JSON fayl yuklab olindi", "success");
  }

  // Export translations as CSV
  function exportTranslationsCSV() {
    // CSV header
    let csv = "ID,Category,Uzbek,English\n";

    // Add rows
    allTranslations.forEach(t => {
      const uzEscaped = `"${t.uz.replace(/"/g, '""')}"`;
      const enEscaped = `"${t.en.replace(/"/g, '""')}"`;
      csv += `${t.id},${t.category},${uzEscaped},${enEscaped}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    adminShowToast("✅ CSV fayl yuklab olindi", "success");
  }

  // HTML escape helper
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // =====================================
  // INLINE TRANSLATION EDITING SYSTEM
  // =====================================

  let editingMode = false;
  let editedTranslations = {}; // Store edited values

  // Create Translation Edit Modal
  function createTranslationEditModal() {
    if (document.getElementById("translation-edit-modal")) return;

    const modalHTML = `
      <div id="translation-edit-modal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3>✏️ Tarjimani tahrirlash</h3>
            <button type="button" class="close-modal" onclick="closeTranslationEditModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>🔑 Kalit (Key)</label>
              <input type="text" id="edit-trans-key" class="form-control" readonly style="background: rgba(255,255,255,0.05); color: #888;">
            </div>
            <div class="form-group">
              <label>🇺🇿 O'zbekcha matn</label>
              <textarea id="edit-trans-uz" class="form-control" rows="3" style="resize: vertical;"></textarea>
            </div>
            <div class="form-group">
              <label>🇬🇧 Inglizcha matn</label>
              <textarea id="edit-trans-en" class="form-control" rows="3" style="resize: vertical;"></textarea>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="closeTranslationEditModal()">❌ Bekor qilish</button>
            <button type="button" class="btn btn-primary" onclick="saveTranslationEdit()">💾 Saqlash</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  // Open edit modal for a specific translation
  window.openTranslationEditModal = function (uzText, enText) {
    createTranslationEditModal();

    document.getElementById("edit-trans-key").value = uzText.substring(0, 50) + (uzText.length > 50 ? "..." : "");
    document.getElementById("edit-trans-uz").value = uzText;
    document.getElementById("edit-trans-en").value = enText;

    document.getElementById("translation-edit-modal").style.display = "flex";
    document.getElementById("edit-trans-uz").focus();
  };

  // Close edit modal
  window.closeTranslationEditModal = function () {
    const modal = document.getElementById("translation-edit-modal");
    if (modal) modal.style.display = "none";
  };

  // Save translation edit
  window.saveTranslationEdit = function () {
    const uzText = document.getElementById("edit-trans-uz").value.trim();
    const enText = document.getElementById("edit-trans-en").value.trim();

    if (!uzText || !enText) {
      adminShowToast("⚠️ Ikkala maydon ham to'ldirilishi kerak", "warning");
      return;
    }

    // Update in textMap
    if (window.textMap) {
      window.textMap[uzText] = enText;
    }
    if (window.__ITC_textMap) {
      window.__ITC_textMap[uzText] = enText;
    }

    // Save to localStorage for persistence
    try {
      let customTranslations = JSON.parse(localStorage.getItem("itc_custom_translations") || "{}");
      customTranslations[uzText] = enText;
      localStorage.setItem("itc_custom_translations", JSON.stringify(customTranslations));

      // Trigger sync for other tabs/windows (main portal)
      localStorage.setItem("itc_translations_updated", Date.now().toString());
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }

    closeTranslationEditModal();
    loadTranslationTable(); // Refresh table
    adminShowToast("✅ Tarjima saqlandi — Real vaqtda sinxronlandi!", "success");
  };

  // Enable/Disable editing mode
  function toggleEditingMode() {
    editingMode = !editingMode;

    const editBtn = document.getElementById("edit-translations-btn");
    const tableRows = document.querySelectorAll("#translations-table-body tr");

    if (editingMode) {
      editBtn.innerHTML = "🔒 Tahrirlashni yakunlash";
      editBtn.classList.add("btn-warning");
      editBtn.classList.remove("btn-secondary");

      tableRows.forEach(row => {
        row.style.cursor = "pointer";
        row.classList.add("editable-row");
        row.onclick = function () {
          const uzCell = this.querySelector("td:nth-child(3)");
          const enCell = this.querySelector("td:nth-child(4)");
          if (uzCell && enCell) {
            openTranslationEditModal(uzCell.textContent, enCell.textContent);
          }
        };
      });

      adminShowToast("✏️ Tahrirlash rejimi yoqildi. Qatorni bosing.", "info");
    } else {
      editBtn.innerHTML = "✏️ Matnlarni tahrirlash";
      editBtn.classList.remove("btn-warning");
      editBtn.classList.add("btn-secondary");

      tableRows.forEach(row => {
        row.style.cursor = "default";
        row.classList.remove("editable-row");
        row.onclick = null;
      });

      adminShowToast("🔒 Tahrirlash rejimi o'chirildi", "info");
    }
  }

  // Add CSS for editable rows
  const editableRowStyles = document.createElement("style");
  editableRowStyles.textContent = `
    .editable-row:hover {
      background: rgba(59, 130, 246, 0.2) !important;
      transform: scale(1.002);
      transition: all 0.2s ease;
    }
    .editable-row:hover td {
      color: #60a5fa !important;
    }
    #translation-edit-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    #translation-edit-modal .modal-content {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 0;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }
    #translation-edit-modal .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    #translation-edit-modal .modal-header h3 {
      margin: 0;
      color: white;
      font-size: 1.25rem;
    }
    #translation-edit-modal .close-modal {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    #translation-edit-modal .close-modal:hover {
      color: #ef4444;
    }
    #translation-edit-modal .modal-body {
      padding: 24px;
    }
    #translation-edit-modal .form-group {
      margin-bottom: 16px;
    }
    #translation-edit-modal .form-group label {
      display: block;
      color: #94a3b8;
      margin-bottom: 8px;
      font-weight: 500;
    }
    #translation-edit-modal textarea {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px;
      color: white;
      font-size: 14px;
    }
    #translation-edit-modal textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
    #translation-edit-modal .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
  `;
  document.head.appendChild(editableRowStyles);

  // Event Listeners for Translation Management
  document.getElementById("edit-translations-btn")?.addEventListener("click", toggleEditingMode);

  document.getElementById("export-translations-btn")?.addEventListener("click", exportTranslationsJSON);

  document.getElementById("export-csv-btn")?.addEventListener("click", exportTranslationsCSV);

  document.getElementById("import-translations-btn")?.addEventListener("click", () => {
    document.getElementById("import-translations-file")?.click();
  });

  document.getElementById("import-translations-file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        // Validate structure
        if (typeof imported === "object" && imported !== null) {
          window.textMap = imported;
          window.__ITC_textMap = imported;
          adminShowToast("✅ Tarjimalar import qilindi", "success");
          loadTranslationTable();
        } else {
          adminShowToast("❌ Noto'g'ri fayl formati", "error");
        }
      } catch (err) {
        adminShowToast("❌ JSON faylni o'qishda xatolik", "error");
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  });

  document.getElementById("reset-translations-btn")?.addEventListener("click", () => {
    if (confirm("⚠️ Barcha o'zgarishlar bekor qilinadi. Davom etasizmi?")) {
      location.reload();
    }
  });

  document.getElementById("translation-search")?.addEventListener("input", (e) => {
    searchTranslations(e.target.value);
  });

  document.getElementById("translation-category-filter")?.addEventListener("change", (e) => {
    filterByCategory(e.target.value);
  });

  // Load translation table when Settings > Localization tab is shown
  const localizationTab = document.getElementById("settings-tab-localization");
  if (localizationTab) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.style.display !== "none") {
          loadTranslationTable();
        }
      });
    });
    observer.observe(localizationTab, { attributes: true, attributeFilter: ["style"] });
  }

  // Initial load if tab is already visible
  if (localizationTab && localizationTab.style.display !== "none") {
    loadTranslationTable();
  }

});
