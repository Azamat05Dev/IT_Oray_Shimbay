/**
 * IT CENTER - ADMIN DASHBOARD
 * Dashboard KPI, Chart.js, va statistika funksiyalari
 */

// ==============================
// KPI ANIMATION
// ==============================
function animateKpi(el, target, duration = 1200) {
    const start = performance.now();
    const startValue = 0;

    function frame(time) {
        const progress = Math.min((time - start) / duration, 1);
        const value = Math.floor(startValue + (target - startValue) * progress);
        el.textContent = target > 1000000 ? value.toLocaleString("uz-UZ") : value.toString();

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            el.textContent = target > 1000000 ? target.toLocaleString("uz-UZ") : target.toString();
        }
    }
    requestAnimationFrame(frame);
}

// ==============================
// MINI CHARTS (SVG)
// ==============================
function renderMiniLineChart(svgEl, numbers) {
    if (!svgEl || !Array.isArray(numbers) || !numbers.length) return;
    svgEl.innerHTML = "";
    const max = Math.max(...numbers) || 1;
    const min = Math.min(...numbers);
    const width = 200;
    const height = 60;
    const padding = 8;

    const points = numbers.map((val, i) => {
        const x = padding + (i / (numbers.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((val - min) / (max - min)) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(" ");

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#60a5fa");
    polyline.setAttribute("stroke-width", "2.5");
    polyline.setAttribute("points", points);
    svgEl.appendChild(polyline);
}

function renderMiniBarChart(svgEl, bars) {
    if (!svgEl || !Array.isArray(bars) || !bars.length) return;
    svgEl.innerHTML = "";
    const maxVal = Math.max(...bars.map(b => b.value));
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

// ==============================
// MAIN DASHBOARD LOADER
// ==============================
async function loadDashboardAnalytics() {
    const db = window.ITCenterDB;
    if (!db) return;

    try {
        const stats = db.getStats();
        const students = db.students.getAll();
        const payments = db.payments.getAll();
        const courses = db.courses.getAll();

        // Update KPI cards
        const kpiData = {
            "1200": stats.totalStudents,
            "35": stats.activeGroups,
            "18400000": stats.totalPayments,
            "14": stats.debtStudents
        };

        const kpiValues = document.querySelectorAll(".admin-kpi-value[data-kpi-target]");
        kpiValues.forEach((el) => {
            const targetKey = el.dataset.kpiTarget;
            const value = kpiData[targetKey];
            if (value !== undefined) animateKpi(el, value);
        });

        // Update KPI meta
        const kpiCards = document.querySelectorAll(".admin-kpi-card");
        kpiCards.forEach(card => {
            const kpi = card.dataset.kpi;
            const trendEl = card.querySelector(".admin-kpi-trend");
            const noteEl = card.querySelector(".admin-kpi-note");

            if (kpi === "students" && trendEl && noteEl) {
                trendEl.textContent = `${stats.activeStudents} faol`;
                noteEl.textContent = "Hozirda o'qiyotgan";
            }
            if (kpi === "payments" && trendEl && noteEl && window.formatCurrency) {
                trendEl.textContent = formatCurrency(stats.monthlyPayments);
                noteEl.textContent = "Bu oy tushgan";
            }
            if (kpi === "overdue" && trendEl && noteEl) {
                trendEl.textContent = `${stats.newApplications} yangi`;
                noteEl.textContent = "arizalar kutmoqda";
            }
        });

        // Mini stats update
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

        // Chart.js - Payments
        const paymentsCanvas = document.getElementById("chart-payments-canvas");
        if (paymentsCanvas && window.Chart) {
            if (window.adminPaymentsChart) window.adminPaymentsChart.destroy();

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
                    if (monthlyData[key] !== undefined) monthlyData[key] += p.amount || 0;
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
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // Chart.js - Courses
        const coursesCanvas = document.getElementById("chart-courses-canvas");
        if (coursesCanvas && window.Chart) {
            if (window.adminCoursesChart) window.adminCoursesChart.destroy();

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
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: '#94a3b8', padding: 16 } }
                    }
                }
            });
        }

        // Recent applications
        const appsList = document.getElementById("admin-applications-list");
        if (appsList) {
            const recentApps = db.applications.getAll().slice(0, 5);
            if (recentApps.length) {
                appsList.innerHTML = recentApps.map(a => `
          <li class="admin-list-item">
            <div class="admin-list-main">
              <div class="admin-pill admin-pill-course">${a.course}</div>
              <span class="admin-list-title">${a.fullName}</span>
              <span class="admin-list-sub">${a.phone} • ${a.format}</span>
            </div>
            <span class="admin-list-time">${window.getTimeAgo ? getTimeAgo(a.createdAt) : "Yangi"}</span>
          </li>
        `).join("");
            }
        }

    } catch (err) {
        console.error("Dashboard analytics error:", err);
    }
}

// Export for global use
window.loadDashboardAnalytics = loadDashboardAnalytics;
window.animateKpi = animateKpi;

console.log("✅ admin-dashboard.js loaded");
