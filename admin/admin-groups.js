/**
 * IT CENTER - ADMIN GROUPS MODULE
 * Guruhlar boshqaruvi funksiyalari
 */

// ==============================
// GROUPS MANAGEMENT
// ==============================
let groupsLoaded = false;
let currentEditingGroupRow = null;

// Initialize add group button
document.addEventListener("DOMContentLoaded", () => {
    const addGroupBtn = document.getElementById("add-group-btn");
    if (addGroupBtn) {
        addGroupBtn.addEventListener("click", () => {
            openAddGroupModal();
        });
    }
});

// Open add group modal
window.openAddGroupModal = function () {
    const modal = document.getElementById("add-group-modal");
    if (modal) {
        // Populate dropdowns
        populateGroupModalDropdowns();
        modal.classList.add("open");
    } else {
        // If no modal exists, create it dynamically
        createAddGroupModal();
    }
};

// Close add group modal
window.closeAddGroupModal = function () {
    const modal = document.getElementById("add-group-modal");
    if (modal) modal.classList.remove("open");
};

// Populate dropdowns for group modal
function populateGroupModalDropdowns() {
    const db = window.ITCenterDB;
    if (!db) return;

    const courseSelect = document.getElementById("new-group-course");
    const mentorSelect = document.getElementById("new-group-mentor");

    if (courseSelect) {
        const courses = db.courses.getAll();
        courseSelect.innerHTML = courses.map(c =>
            `<option value="${c.id}">${c.name}</option>`
        ).join("");
    }

    if (mentorSelect) {
        const mentors = db.mentors.getAll();
        mentorSelect.innerHTML = mentors.map(m =>
            `<option value="${m.id}">${m.name}</option>`
        ).join("");
    }
}

// Create modal dynamically if it doesn't exist
function createAddGroupModal() {
    const db = window.ITCenterDB;
    const courses = db ? db.courses.getAll() : [];
    const mentors = db ? db.mentors.getAll() : [];

    const modalHtml = `
    <div class="admin-modal open" id="add-group-modal">
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2>➕ Yangi Guruh Ochish</h2>
                <button class="admin-modal-close" onclick="closeAddGroupModal()">✕</button>
            </div>
            <div class="admin-modal-body">
                <div class="admin-form-group">
                    <label>Guruh ID</label>
                    <input type="text" id="new-group-id" class="admin-input" placeholder="Masalan: G24-FE-01" required>
                </div>
                <div class="admin-form-group">
                    <label>Kurs</label>
                    <select id="new-group-course" class="admin-select">
                        ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
                    </select>
                </div>
                <div class="admin-form-group">
                    <label>Mentor</label>
                    <select id="new-group-mentor" class="admin-select">
                        ${mentors.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}
                    </select>
                </div>
                <div class="admin-form-group">
                    <label>Jadval</label>
                    <input type="text" id="new-group-schedule" class="admin-input" placeholder="Masalan: Du-Cho 14:00-16:00">
                </div>
                <div class="admin-form-group">
                    <label>Sig'imi</label>
                    <input type="number" id="new-group-capacity" class="admin-input" value="15" min="1" max="30">
                </div>
            </div>
            <div class="admin-modal-footer">
                <button class="admin-btn" onclick="closeAddGroupModal()">Bekor qilish</button>
                <button class="admin-btn admin-btn-primary" onclick="saveNewGroup()">💾 Saqlash</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// Save new group
window.saveNewGroup = function () {
    const db = window.ITCenterDB;
    if (!db) return;

    const groupId = document.getElementById("new-group-id")?.value?.trim();
    const courseId = parseInt(document.getElementById("new-group-course")?.value);
    const mentorId = parseInt(document.getElementById("new-group-mentor")?.value);
    const schedule = document.getElementById("new-group-schedule")?.value?.trim();
    const capacity = parseInt(document.getElementById("new-group-capacity")?.value) || 15;

    if (!groupId) {
        if (window.adminShowToast) adminShowToast("❌ Guruh ID kiriting", "error");
        return;
    }

    // Check if group already exists
    const existingGroup = db.groups.getById(groupId);
    if (existingGroup) {
        if (window.adminShowToast) adminShowToast("❌ Bu ID mavjud", "error");
        return;
    }

    // Add new group
    db.groups.add({
        id: groupId,
        courseId,
        mentorId,
        schedule,
        capacity,
        studentCount: 0,
        status: "recruiting"
    });

    if (window.adminShowToast) adminShowToast("✅ Yangi guruh yaratildi", "success");
    closeAddGroupModal();

    // Reload groups table
    if (window.loadGroups) loadGroups();
};


// Load groups table
window.loadGroups = async function () {
    const groupsTableBody = document.querySelector("#groups-table tbody");
    const groupsSkeleton = document.getElementById("groups-skeleton");

    if (!groupsTableBody) return;
    if (groupsSkeleton) groupsSkeleton.style.display = "block";

    try {
        const db = window.ITCenterDB;
        const groups = db ? db.groups.getAll() : [];
        const courses = db ? db.courses.getAll() : [];
        const mentors = db ? db.mentors.getAll() : [];
        const allStudents = db ? db.students.getAll() : [];

        groupsTableBody.innerHTML = "";

        groups.forEach((g) => {
            const tr = document.createElement("tr");
            tr.dataset.groupId = g.id;

            const course = courses.find(c => c.id === g.courseId);
            const mentor = mentors.find(m => m.id === g.mentorId);

            // Calculate REAL student count from students collection
            const realStudentCount = allStudents.filter(s =>
                s.groupId === g.id && s.status !== 'applied' && s.status !== 'rejected' && s.status !== 'postponed'
            ).length;

            const statusMap = {
                active: { text: "Faol", class: "admin-status-active" },
                recruiting: { text: "Yig'ilmoqda", class: "admin-status-partial" },
                completed: { text: "Tugallangan", class: "admin-status-graduated" },
                paused: { text: "To'xtatilgan", class: "admin-status-frozen" }
            };
            const status = statusMap[g.status] || { text: g.status, class: "admin-status" };

            tr.innerHTML = `
        <td><strong>${g.id}</strong></td>
        <td data-course="${course?.name || ''}">${course?.name || "—"}</td>
        <td>${mentor?.name || "—"}</td>
        <td>${g.schedule || "—"}</td>
        <td>${realStudentCount} / ${g.capacity || 15}</td>
        <td><span class="admin-status ${status.class}">${status.text}</span></td>
        <td>
          <button class="admin-table-action group-edit-btn" data-id="${g.id}">✏️</button>
          <button class="admin-table-action group-delete-btn" data-id="${g.id}">🗑️</button>
        </td>
      `;
            groupsTableBody.appendChild(tr);
        });

        // Edit handlers
        groupsTableBody.querySelectorAll(".group-edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const row = btn.closest("tr");
                enterGroupEditMode(row);
            });
        });

        // Delete handlers
        groupsTableBody.querySelectorAll(".group-delete-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                if (confirm(`Guruh "${id}" ni o'chirmoqchimisiz?`)) {
                    db.groups.delete(id);
                    if (window.adminShowToast) adminShowToast("🗑️ Guruh o'chirildi", "success");
                    loadGroups();
                }
            });
        });

        groupsLoaded = true;
    } catch (err) {
        console.error(err);
        if (window.adminShowToast) adminShowToast("Guruhlarni yuklashda xatolik.", "error");
    } finally {
        if (groupsSkeleton) groupsSkeleton.style.display = "none";
    }
};

// Enter edit mode for group row
function enterGroupEditMode(row) {
    if (currentEditingGroupRow) exitGroupEditMode(currentEditingGroupRow, false);
    currentEditingGroupRow = row;

    const db = window.ITCenterDB;
    const groupId = row.dataset.groupId;
    const group = db?.groups?.getById(groupId);
    if (!group) return;

    const courses = db.courses.getAll();
    const mentors = db.mentors.getAll();

    const cells = row.querySelectorAll("td");

    // Replace cells with inputs
    cells[1].innerHTML = `<select class="admin-select edit-course">
    ${courses.map(c => `<option value="${c.id}" ${c.id === group.courseId ? 'selected' : ''}>${c.name}</option>`).join("")}
  </select>`;

    cells[2].innerHTML = `<select class="admin-select edit-mentor">
    ${mentors.map(m => `<option value="${m.id}" ${m.id === group.mentorId ? 'selected' : ''}>${m.name}</option>`).join("")}
  </select>`;

    cells[3].innerHTML = `<input type="text" class="admin-input edit-schedule" value="${group.schedule || ''}" style="width:120px">`;

    cells[4].innerHTML = `
    <input type="number" class="admin-input edit-capacity" value="${group.capacity || 15}" style="width:60px"> talaba
  `;

    cells[6].innerHTML = `
    <button class="admin-table-action group-save-btn">💾</button>
    <button class="admin-table-action group-cancel-btn">❌</button>
  `;

    row.querySelector(".group-save-btn").onclick = () => exitGroupEditMode(row, true);
    row.querySelector(".group-cancel-btn").onclick = () => exitGroupEditMode(row, false);
}

// Exit edit mode
function exitGroupEditMode(row, save) {
    if (save) {
        const db = window.ITCenterDB;
        const groupId = row.dataset.groupId;

        const courseId = parseInt(row.querySelector(".edit-course")?.value);
        const mentorId = parseInt(row.querySelector(".edit-mentor")?.value);
        const schedule = row.querySelector(".edit-schedule")?.value;
        const capacity = parseInt(row.querySelector(".edit-capacity")?.value) || 15;

        db.groups.update(groupId, { courseId, mentorId, schedule, capacity });
        if (window.adminShowToast) adminShowToast("✅ Guruh yangilandi", "success");
    }

    currentEditingGroupRow = null;
    loadGroups();
}

// Filter groups
window.filterGroups = function () {
    const search = document.getElementById("groups-search")?.value?.toLowerCase() || "";
    const courseFilter = document.getElementById("groups-course")?.value || "all";

    const rows = document.querySelectorAll("#groups-table tbody tr");

    rows.forEach(row => {
        const id = row.querySelector("td:first-child")?.textContent?.toLowerCase() || "";
        const course = row.querySelector("[data-course]")?.dataset?.course?.toLowerCase() || "";

        const matchSearch = !search || id.includes(search) || course.includes(search);
        const matchCourse = courseFilter === "all" || course.includes(courseFilter.toLowerCase());

        row.style.display = matchSearch && matchCourse ? "" : "none";
    });
};


