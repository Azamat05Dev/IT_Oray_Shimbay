/**
 * IT CENTER - ADMIN PAYMENTS MODULE
 * To'lovlar boshqaruvi funksiyalari
 */

// ==============================
// PAYMENTS MANAGEMENT
// ==============================

// Load payments data
window.loadPaymentsData = function () {
    const db = window.ITCenterDB;
    if (!db) return;

    const payments = db.payments.getAll();
    const students = db.students.getAll();

    // Stats
    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const monthlyPayments = payments.filter(p => {
        const d = new Date(p.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + (p.amount || 0), 0);

    // Update stats display
    const totalEl = document.getElementById("payments-total");
    const monthlyEl = document.getElementById("payments-monthly");
    if (totalEl && window.formatCurrency) totalEl.textContent = formatCurrency(totalPayments);
    if (monthlyEl && window.formatCurrency) monthlyEl.textContent = formatCurrency(monthlyPayments);

    // Render payments table
    const tbody = document.querySelector("#payments-table tbody");
    if (!tbody) return;

    // Sort by date descending
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedPayments.slice(0, 50).map(p => {
        const student = students.find(s => s.id === p.studentId);
        const statusClass = p.status === "confirmed" ? "admin-status-paid" :
            p.status === "pending" ? "admin-status-partial" : "admin-status-debt";
        const statusText = p.status === "confirmed" ? "Tasdiqlangan" :
            p.status === "pending" ? "Kutilmoqda" : "Bekor";

        return `
      <tr data-payment-id="${p.id}">
        <td>${p.date}</td>
        <td>${student?.fullName || "—"}</td>
        <td><strong>${window.formatCurrency ? formatCurrency(p.amount) : p.amount}</strong></td>
        <td>${p.method || "Naqd"}</td>
        <td><span class="admin-status ${statusClass}">${statusText}</span></td>
        <td>
          <button class="admin-table-action payment-edit-btn" data-id="${p.id}">✏️</button>
          <button class="admin-table-action payment-history-btn" data-student="${p.studentId}">📜</button>
        </td>
      </tr>
    `;
    }).join("");

    // Event handlers
    tbody.querySelectorAll(".payment-edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (window.openPaymentEditModal) openPaymentEditModal(parseInt(btn.dataset.id));
        });
    });

    tbody.querySelectorAll(".payment-history-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (window.showStudentPaymentHistory) showStudentPaymentHistory(parseInt(btn.dataset.student));
        });
    });
};

// Open add payment modal
window.openPaymentModal = function (preselectedStudentId = null) {
    const db = window.ITCenterDB;
    if (!db) return;

    const students = db.students.getAll();

    // Create modal
    const modal = document.createElement("div");
    modal.className = "admin-modal";
    modal.id = "add-payment-modal";
    modal.innerHTML = `
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>💰 Yangi To'lov Qo'shish</h2>
        <button class="admin-modal-close" id="close-payment-modal">×</button>
      </div>
      <div class="admin-modal-body">
        <div class="admin-form-group">
          <label>Talaba</label>
          <select id="payment-student" class="admin-select">
            ${students.map(s => `<option value="${s.id}" ${s.id === preselectedStudentId ? 'selected' : ''}>${s.fullName}</option>`).join("")}
          </select>
        </div>
        <div class="admin-form-group">
          <label>Summa (so'm)</label>
          <input type="number" id="payment-amount" class="admin-input" placeholder="500000">
        </div>
        <div class="admin-form-group">
          <label>To'lov usuli</label>
          <select id="payment-method" class="admin-select">
            <option value="cash">💵 Naqd</option>
            <option value="card">💳 Karta</option>
            <option value="transfer">🏦 Bank o'tkazma</option>
          </select>
        </div>
        <div class="admin-form-group">
          <label>Sana</label>
          <input type="date" id="payment-date" class="admin-input" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="admin-btn" id="cancel-payment">Bekor qilish</button>
        <button class="admin-btn admin-btn-primary" id="save-payment">💾 Saqlash</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modal.classList.add("open");

    // Close handlers
    const closeModal = () => {
        modal.classList.remove("open");
        setTimeout(() => modal.remove(), 200);
    };

    document.getElementById("close-payment-modal").onclick = closeModal;
    document.getElementById("cancel-payment").onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Save handler
    document.getElementById("save-payment").onclick = () => {
        const studentId = parseInt(document.getElementById("payment-student").value);
        const amount = parseInt(document.getElementById("payment-amount").value);
        const method = document.getElementById("payment-method").value;
        const date = document.getElementById("payment-date").value;

        if (!amount || amount <= 0) {
            if (window.adminShowToast) adminShowToast("❌ Summani kiriting", "error");
            return;
        }

        const payment = {
            studentId,
            amount,
            method,
            date,
            status: "confirmed"
        };

        db.payments.add(payment);
        const student = db.students.getById(studentId);
        if (student) db.logActivity("payment_add", student.fullName, `${amount.toLocaleString()} so'm to'lov qo'shildi`);

        if (window.adminShowToast) adminShowToast("✅ To'lov qo'shildi!", "success");
        closeModal();
        loadPaymentsData();
    };
};

console.log("✅ admin-payments.js loaded");
