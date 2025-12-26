/**
 * IT CENTER - ADMIN STUDENTS MODULE
 * Talabalar boshqaruvi funksiyalari
 */

// ==============================
// STUDENTS MANAGEMENT
// ==============================
let studentsLoaded = false;
let selectedStudents = new Set();

// Load students table
window.loadStudents = async function () {
    const studentsTableBody = document.querySelector("#students-table tbody");
    const studentsSkeleton = document.getElementById("students-skeleton");

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

            const course = courses.find(c => c.id === st.courseId);
            const courseName = course?.name?.split("(")[0]?.trim() || "—";
            const groupName = st.groupId || "—";

            const statusMap = {
                active: { text: "Faol", class: "admin-status-active" },
                graduated: { text: "Bitirgan", class: "admin-status-graduated" },
                frozen: { text: "Muzlatilgan", class: "admin-status-frozen" },
                applied: { text: "Ariza", class: "admin-status-applied" }
            };
            const status = statusMap[st.status] || { text: st.status, class: "admin-status" };

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

        // Edit button handlers
        studentsTableBody.querySelectorAll(".admin-student-edit").forEach((btn) => {
            btn.addEventListener("click", () => {
                const studentId = parseInt(btn.dataset.id);
                if (window.openStudentEditModal) openStudentEditModal(studentId);
            });
        });

        studentsLoaded = true;
        setupBulkActions();
    } catch (err) {
        console.error(err);
        if (window.adminShowToast) adminShowToast("Talabalar ro'yxatini yuklashda xatolik.", "error");
    } finally {
        if (studentsSkeleton) studentsSkeleton.style.display = "none";
    }
};

// Setup bulk actions
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
            if (cb.checked) selectedStudents.add(id);
            else selectedStudents.delete(id);
            updateBulkBar();
        });
    });

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", () => {
            checkboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
                const id = parseInt(cb.dataset.id);
                if (selectAllCheckbox.checked) selectedStudents.add(id);
                else selectedStudents.delete(id);
            });
            updateBulkBar();
        });
    }
}

// Filter students
window.filterStudents = function () {
    const search = document.getElementById("students-search")?.value?.toLowerCase() || "";
    const courseFilter = document.getElementById("students-course")?.value || "all";
    const statusFilter = document.getElementById("students-status")?.value || "all";
    const paymentFilter = document.getElementById("students-payment")?.value || "all";

    const rows = document.querySelectorAll("#students-table tbody tr");

    rows.forEach(row => {
        const name = row.querySelector("td:nth-child(3)")?.textContent?.toLowerCase() || "";
        const phone = row.querySelector("[data-st-phone]")?.dataset?.stPhone?.toLowerCase() || "";
        const course = row.querySelector("[data-st-course]")?.dataset?.stCourse || "";
        const status = row.querySelector("[data-st-status]")?.dataset?.stStatus || "";
        const payment = row.querySelector("[data-st-payment]")?.dataset?.stPayment || "";

        const matchSearch = !search || name.includes(search) || phone.includes(search);
        const matchCourse = courseFilter === "all" || course.includes(courseFilter.toLowerCase());
        const matchStatus = statusFilter === "all" || status.includes(statusFilter.toLowerCase());
        const matchPayment = paymentFilter === "all" || payment === paymentFilter;

        row.style.display = matchSearch && matchCourse && matchStatus && matchPayment ? "" : "none";
    });
};

// Get selected students
window.getSelectedStudents = function () {
    return selectedStudents;
};

console.log("✅ admin-students.js loaded");
