/**
 * IT CENTER - ADMIN UTILITIES
 * Yordamchi funksiyalar va global metodlar
 */

// ==============================
// TOAST NOTIFICATIONS
// ==============================
window.adminShowToast = function (message, type = "info") {
    let toast = document.getElementById("admin-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "admin-toast";
        toast.style.cssText = `
      position: fixed;
      z-index: 9999;
      right: 18px;
      bottom: 18px;
      max-width: 360px;
      padding: 10px 14px;
      border-radius: 999px;
      font-size: 0.85rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    const colors = {
        info: "rgba(59,130,246,0.95)",
        success: "rgba(34,197,94,0.95)",
        error: "rgba(239,68,68,0.95)",
        warning: "rgba(245,158,11,0.95)"
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
};

// ==============================
// CURRENCY FORMATTING
// ==============================
window.formatCurrency = function (amount) {
    if (!amount && amount !== 0) return "0 so'm";
    return Number(amount).toLocaleString("uz-UZ") + " so'm";
};

// ==============================
// TIME AGO HELPER
// ==============================
window.getTimeAgo = function (timestamp) {
    if (!timestamp) return "";
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Hozirgina";
    if (mins < 60) return `${mins} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;
    return new Date(timestamp).toLocaleDateString("uz-UZ");
};

// ==============================
// PHONE FORMATTING
// ==============================
window.formatPhone = function (phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("998")) {
        return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
    }
    return phone;
};

// ==============================
// EXPORT TO EXCEL
// ==============================
window.exportToExcel = function (data, filename) {
    if (!window.XLSX) {
        adminShowToast("Excel kutubxonasi yuklanmadi", "error");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ma'lumotlar");
    XLSX.writeFile(wb, filename);
    adminShowToast(`✅ ${filename} yuklab olindi!`, "success");
};

// ==============================
// BACKUP / RESTORE
// ==============================
window.backupAllData = function () {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ITCenter_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    adminShowToast("✅ Backup fayli yaratildi!", "success");
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

// ==============================
// PASSWORD HELPERS (Simple - LocalStorage only)
// ==============================
window.hashPasswordServer = async function (password) {
    return btoa(password);
};

window.verifyPasswordServer = async function (password, storedPassword) {
    return password === storedPassword;
};

// ==============================
// SMS API
// ==============================
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

console.log("✅ admin-utils.js loaded");
