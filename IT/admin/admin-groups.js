/**
 * IT CENTER - ADMIN GROUPS MODULE
 * Guruhlar boshqaruvi funksiyalari
 */

// ==============================
// GROUPS MANAGEMENT
// ==============================
let groupsLoaded = false;
let currentEditingGroupRow = null;

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

        groupsTableBody.innerHTML = "";

        groups.forEach((g) => {
            const tr = document.createElement("tr");
            tr.dataset.groupId = g.id;

            const course = courses.find(c => c.id === g.courseId);
            const mentor = mentors.find(m => m.id === g.mentorId);

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
        <td>${g.studentCount || 0} / ${g.capacity || 15}</td>
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

console.log("✅ admin-groups.js loaded");
