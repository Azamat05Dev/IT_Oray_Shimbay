/* =========================================================
   IT Center Portal — main.js (patched for index.full.globe.patched.html)
   - No external libraries
   - Globe (network sphere) drag + inertia + zoom
   - Nav active highlight on scroll (sticky menu)
   - Modals (data-open / data-close), Auth tabs, Branch tabs
   - Buttons: Reco modal, Mentor profiles, Pay modal, Call modal
   - Forms: enroll-form, portal-login-form, portal-register-form, reco-form, pay-ui-form
   ========================================================= */

(() => {
  "use strict";
  if (window.__ITC_MAIN_PATCHED__) return;
  window.__ITC_MAIN_PATCHED__ = true;

  /* ----------------- Helpers ----------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const prefersReduced = (() => {
    try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  })();

  const raf = (fn) => requestAnimationFrame(fn);

  /* ----------------- Custom Translations Loader ----------------- */
  function loadCustomTranslations() {
    try {
      const customTranslations = JSON.parse(localStorage.getItem('custom_translations') || '{}');
      if (window.__ITC_textMap && Object.keys(customTranslations).length > 0) {
        Object.keys(customTranslations).forEach(key => {
          window.__ITC_textMap[key] = customTranslations[key];
        });
        console.log(`📝 Loaded ${Object.keys(customTranslations).length} custom translations`);
      }
    } catch (e) { }
  }

  // Listen for real-time translation updates from admin panel
  function setupTranslationSync() {
    // BroadcastChannel
    try {
      const bc = new BroadcastChannel('itcenter_translations');
      bc.onmessage = (event) => {
        if (event.data.type === 'translations_updated') {
          console.log('📝 Real-time translation update received');
          loadCustomTranslations();
          // Re-apply current language
          if (window.__ITC_applyTranslations && window.__ITC_currentLang) {
            const cur = window.__ITC_currentLang();
            if (cur === 'EN') {
              window.__ITC_applyTranslations('UZ');
              setTimeout(() => window.__ITC_applyTranslations('EN'), 50);
            }
          }
        }
      };
    } catch (e) { }

    // Storage event (cross-tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'translations_updated') {
        loadCustomTranslations();
      }
    });
  }

  // Initialize translation sync after DOM ready
  setTimeout(() => {
    loadCustomTranslations();
    setupTranslationSync();
  }, 100);

  /* ----------------- Online User Tracking ----------------- */
  function trackOnlineUser() {
    if (window.ITCenterDB && window.ITCenterDB.trackOnlineUser) {
      window.ITCenterDB.trackOnlineUser('portal');
    }
  }

  trackOnlineUser();
  setInterval(trackOnlineUser, 15000);

  /* ----------------- Loader ----------------- */
  function hideLoader() {
    const loader = $(".page-loader");
    if (!loader) return;
    loader.classList.add("page-loader--hidden");
    loader.setAttribute("aria-hidden", "true");
  }

  /* ----------------- Sticky nav active highlight ----------------- */
  function initNavActive() {
    const header = $(".header") || $(".site-header") || $("header");
    const links = $$(".nav-link[href^='#']");
    const sections = $$("section[id]");
    if (!links.length || !sections.length) return;

    const headerH = () => {
      if (!header) return 72;
      const h = header.getBoundingClientRect().height || 72;
      return Math.max(64, Math.round(h));
    };

    const setActive = (id) => {
      if (!id) return;
      links.forEach(a => a.classList.toggle("nav-active", a.getAttribute("href") === `#${id}`));
    };

    // Smooth scroll
    links.forEach(a => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        const id = href.startsWith("#") ? href.slice(1) : "";
        const el = id ? document.getElementById(id) : null;
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - headerH() - 12;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });

    // Observer
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((entries) => {
        const v = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio - a.intersectionRatio))[0];
        if (v?.target?.id) setActive(v.target.id);
      }, {
        root: null,
        rootMargin: `-${headerH()}px 0px -55% 0px`,
        threshold: [0.12, 0.2, 0.35, 0.5, 0.65]
      });
      sections.forEach(s => obs.observe(s));
    } else {
      const onScroll = () => {
        const cursor = window.scrollY + headerH() + 130;
        let best = sections[0].id;
        for (const s of sections) if (cursor >= s.offsetTop) best = s.id;
        setActive(best);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ----------------- Theme toggle ----------------- */
  function initTheme() {
    const btn = $("#theme-toggle");
    if (!btn) return;
    const key = "itc_theme";
    const apply = (mode) => {
      document.body.classList.toggle("light-theme", mode === "light");
      document.body.classList.toggle("theme-light", mode === "light"); // support
      document.body.classList.toggle("theme-dark", mode !== "light");
      btn.setAttribute("aria-pressed", String(mode === "light"));
    };

    let mode = "dark";
    try {
      const saved = localStorage.getItem(key);
      if (saved === "light" || saved === "dark") mode = saved;
    } catch { }
    apply(mode);

    btn.addEventListener("click", () => {
      mode = document.body.classList.contains("light-theme") || document.body.classList.contains("theme-light") ? "dark" : "light";
      apply(mode);
      try { localStorage.setItem(key, mode); } catch { }
    });
  }

  /* ----------------- Language toggle (UZ/EN) ----------------- */
  function initLang() {
    const btn = $("#lang-toggle") || $("[data-lang-toggle]");
    if (!btn) return;
    const key = "itc_lang";
    const langs = ["UZ", "EN"];

    const set = (code) => {
      const label = btn.querySelector("[data-lang-label]") || btn.querySelector("span:last-child");
      if (label) label.textContent = code;
      else btn.textContent = code;
      try { localStorage.setItem(key, code); } catch { }

      // Apply translations if available
      if (window.__ITC_applyTranslations) {
        window.__ITC_applyTranslations(code);
      }
    };

    let cur = "UZ";
    try {
      const saved = localStorage.getItem(key);
      if (saved && langs.includes(saved)) cur = saved;
    } catch { }
    set(cur);

    btn.addEventListener("click", () => {
      cur = langs[(langs.indexOf(cur) + 1) % langs.length];
      set(cur);
    });
  }

  /* ----------------- Notifications ----------------- */
  function initNotify() {
    const btn = $("#notify-toggle") || $("[data-notify-toggle]");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      if (!("Notification" in window)) return alert("Brauzer bildirishnomalarni qo‘llab-quvvatlamaydi.");
      try {
        const res = await Notification.requestPermission();
        if (res === "granted") new Notification("IT Center", { body: "Bildirishnomalar yoqildi ✅" });
        else if (res === "denied") alert("Ruxsat berilmadi. Sozlamalardan yoqishingiz mumkin.");
      } catch {
        alert("Bildirishnoma ruxsatida xatolik.");
      }
    });
  }

  /* ----------------- Modals (data-open / data-close) ----------------- */
  function initModals() {
    const modals = $$(".modal");
    if (!modals.length) return;

    const openers = $$("[data-open]");
    const closers = $$("[data-close]");

    let scrollY = 0;
    const lock = () => {
      scrollY = window.scrollY || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    };
    const unlock = () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo({ top: scrollY, behavior: "auto" });
    };

    const openModal = (sel) => {
      const id = (sel || "").replace("#", "");
      const m = id ? document.getElementById(id) : null;
      if (!m) return;
      m.classList.add("modal-open");
      m.setAttribute("aria-hidden", "false");
      lock();
    };

    const closeModal = (m) => {
      if (!m) return;
      m.classList.remove("modal-open");
      m.setAttribute("aria-hidden", "true");
      if (!$(".modal.modal-open")) unlock();
    };

    openers.forEach(b => b.addEventListener("click", () => {
      const target = b.getAttribute("data-open");
      if (target === "#auth-modal") {
        window.location.href = "auth.html";
        return;
      }
      openModal(target);
    }));
    closers.forEach(b => b.addEventListener("click", () => closeModal(b.closest(".modal"))));

    modals.forEach(m => {
      m.addEventListener("click", (e) => { if (e.target === m) closeModal(m); });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const m = $(".modal.modal-open");
      if (m) closeModal(m);
    });

    // Expose for internal usage (forms)
    window.__ITC_openModal = openModal;
    window.__ITC_closeModal = (idOrEl) => {
      const m = typeof idOrEl === "string" ? document.getElementById(idOrEl.replace("#", "")) : idOrEl;
      if (m) closeModal(m);
    };
  }

  /* ----------------- Auth tabs -> redirect to auth.html ----------------- */
  function initAuthTabs() {
    const tabs = $$("[data-auth-tab]");
    if (!tabs.length) return;

    tabs.forEach(t => t.addEventListener("click", () => {
      const key = t.getAttribute("data-auth-tab") || "login";
      window.location.href = "auth.html?tab=" + key;
    }));
  }

  /* ----------------- Schedule tabs ----------------- */
  function initScheduleTabs() {
    const tabs = $$("[data-schedule]");
    const panels = $$("[data-schedule-panel]");
    if (!tabs.length || !panels.length) return;

    const set = (key) => {
      tabs.forEach(t => t.classList.toggle("schedule-tab-active", t.getAttribute("data-schedule") === key));
      panels.forEach(p => p.classList.toggle("schedule-panel-active", p.getAttribute("data-schedule-panel") === key));
    };

    tabs.forEach(t => t.addEventListener("click", () => set(t.getAttribute("data-schedule"))));
    set(tabs[0].getAttribute("data-schedule"));
  }
  /* ----------------- Courses filter/search ----------------- */
  function initCourseFilters() {
    const level = $("#course-filter-level");
    const search = $("#course-search");
    const cards = $$(".course-card[data-level]");
    if (!cards.length || (!level && !search)) return;

    const apply = () => {
      const lvl = (level ? level.value : "all").toLowerCase();
      const q = (search ? search.value : "").toLowerCase().trim();

      cards.forEach(card => {
        const cl = (card.getAttribute("data-level") || "").toLowerCase();
        const nm = (card.getAttribute("data-course-name") || card.textContent || "").toLowerCase();
        const okL = (lvl === "all" || cl === lvl);
        const okQ = (!q || nm.includes(q));
        card.style.display = (okL && okQ) ? "" : "none";
      });
    };

    level && level.addEventListener("change", apply);
    search && search.addEventListener("input", apply);
    apply();
  }

  /* ----------------- Reco modal (course helper) ----------------- */
  function initReco() {
    const form = $("#reco-form");
    const out = $("#reco-result");
    if (!form || !out) return;

    const pick = (answers) => {
      // simple rule-based recommendation
      const { goal, level, time } = answers;
      if (goal === "frontend") return "Siz uchun: Zero → Hero Frontend (HTML/CSS/JS/React).";
      if (goal === "backend") return "Siz uchun: Python & Backend (FastAPI/SQL/Auth).";
      if (goal === "kids") return "Siz uchun: Kids IT (Scratch/robototexnika/logic).";
      if (goal === "design") return "Siz uchun: UI/UX Dizayn (Figma, prototip, portfolio).";
      // fallback by level
      if (level === "beginner") return "Siz uchun: Boshlang‘ich Frontend yoki Python asoslari.";
      if (time === "fast") return "Siz uchun: Intensiv (tezkor) guruhlar — jadval bo‘yicha menejer sizga mos vaqt beradi.";
      return "Siz uchun: Yo‘nalishlar bo‘limidan mos trekni tanlang — menejer yordam beradi.";
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const ans = {
        goal: (fd.get("goal") || "").toString(),
        level: (fd.get("level") || "").toString(),
        time: (fd.get("time") || "").toString(),
      };
      out.textContent = pick(ans) + " ✅";
    });
  }

  /* ----------------- Forms: enroll / auth / pay-ui ----------------- */
  function initForms() {
    // enroll (tez ariza)
    const enroll = $("#enroll-form");
    const enrollMsg = $("#enroll-message");
    if (enroll) {
      enroll.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(enroll);
        const app = {
          fullName: fd.get("fullName"),
          phone: fd.get("phone"),
          course: fd.get("course"),
          format: fd.get("format"),
          note: fd.get("note"),
          status: "new",
          createdAt: Date.now()
        };

        if (window.ITCenterDB) {
          window.ITCenterDB.applications.add(app);
          window.ITCenterDB.logActivity("application_new", app.fullName, "Tez ariza yubordi");
        }

        if (enrollMsg) {
          enrollMsg.textContent = "Ariza yuborildi ✅ Menejer SMS/qo‘ng‘iroq orqali bog‘lanadi.";
          enrollMsg.classList.add("form-msg--ok");
        }
        enroll.reset();
      });
    }

    // auth (demo)
    const login = $("#portal-login-form");
    const reg = $("#portal-register-form");
    const closeAuth = () => window.__ITC_closeModal?.("auth-modal");

    login && login.addEventListener("submit", (e) => {
      e.preventDefault();

      const identifier = document.getElementById("login-identifier")?.value?.trim() || "";
      const password = document.getElementById("login-password")?.value || "";
      const msgEl = document.getElementById("portal-login-message");

      if (!identifier || !password) {
        if (msgEl) {
          msgEl.textContent = "❌ Login va parolni kiriting";
          msgEl.classList.add("form-msg--error");
        }
        return;
      }

      const db = window.ITCenterDB;
      if (!db) {
        if (msgEl) {
          msgEl.textContent = "❌ Tizim xatosi. Sahifani yangilang.";
          msgEl.classList.add("form-msg--error");
        }
        return;
      }

      // Normalize identifier
      const normalizedId = identifier.toLowerCase().replace(/\s/g, "");
      const phoneClean = identifier.replace(/\D/g, "");

      // ===== CHECK ADMIN USERS FIRST =====
      const admins = db.adminUsers?.getAll ? db.adminUsers.getAll() : [];
      const admin = admins.find(a =>
        a.username?.toLowerCase() === normalizedId ||
        a.email?.toLowerCase() === normalizedId
      );

      if (admin && admin.password === password) {
        const adminSession = {
          adminId: admin.id,
          adminName: admin.fullName,
          username: admin.username,
          role: admin.role,
          loginTime: Date.now()
        };
        localStorage.setItem("admin_session", JSON.stringify(adminSession));
        db.logActivity("admin_login", admin.fullName, "Admin panelga kirdi");

        if (msgEl) {
          msgEl.textContent = "✅ Admin! Yo'naltirilmoqda...";
          msgEl.classList.remove("form-msg--error");
          msgEl.classList.add("form-msg--ok");
        }
        setTimeout(() => { window.location.href = "admin/admin.html"; }, 800);
        return;
      }

      // ===== CHECK STUDENTS =====
      const students = db.students.getAll();
      const student = students.find(s =>
        s.email?.toLowerCase() === normalizedId ||
        // Only check phone if user entered at least 9 digits
        (phoneClean.length >= 9 && s.phone && s.phone.replace(/\D/g, "").includes(phoneClean.slice(-9))) ||
        s.fullName?.toLowerCase() === normalizedId
      );

      if (student && student.password === password) {
        const session = {
          studentId: student.id,
          studentName: student.fullName,
          email: student.email,
          phone: student.phone,
          courseId: student.courseId,
          loginTime: Date.now()
        };
        // Clear any existing session first
        localStorage.removeItem("student_session");
        sessionStorage.removeItem("student_session");
        localStorage.setItem("student_session", JSON.stringify(session));
        db.logActivity("student_login", student.fullName, "Kabinetga kirdi");

        if (msgEl) {
          msgEl.textContent = "✅ Muvaffaqiyatli! Kabinetga yo'naltirilmoqda...";
          msgEl.classList.remove("form-msg--error");
          msgEl.classList.add("form-msg--ok");
        }
        setTimeout(() => { window.location.href = "student/index.html"; }, 800);
        return;
      }

      // Invalid credentials
      if (msgEl) {
        msgEl.textContent = "❌ Login yoki parol noto'g'ri";
        msgEl.classList.remove("form-msg--ok");
        msgEl.classList.add("form-msg--error");
      }
    });

    reg && reg.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(reg);
      const fullName = fd.get("fullName") || reg.querySelector('input[placeholder="Ism Familiya"]')?.value;
      const phone = fd.get("phone") || reg.querySelector('input[placeholder="+998 __ ___ __ __"]')?.value;
      const password = fd.get("password") || document.getElementById("reg-password")?.value;
      const courseName = fd.get("course") || reg.querySelector('select')?.value;

      const newStudent = {
        fullName: fullName,
        phone: phone,
        password: password,
        status: "applied",
        paymentStatus: "unpaid",
        enrollDate: new Date().toISOString().split("T")[0],
        course: courseName,
        note: "Platformadan ro'yxatdan o'tdi",
        createdAt: Date.now()
      };

      if (window.ITCenterDB) {
        window.ITCenterDB.students.add(newStudent);
        window.ITCenterDB.logActivity("student_register", fullName, "Yangi o'quvchi ro'yxatdan o'tdi");
      }

      closeAuth();
      alert("Ro‘yxatdan o‘tish muvaffaqiyatli! ✅ Arizangiz ko'rib chiqilmoqda.");
      reg.reset();
    });

    // contact form (shikoyatlar va takliflar)
    const contactForm = $("#contact-form");
    const contactMsg = $("#contact-msg");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const subjectMap = {
          question: "Savol",
          complaint: "Shikoyat (Jalova)",
          suggestion: "Taklif",
          other: "Boshqa"
        };
        const subject = subjectMap[fd.get("subject")] || fd.get("subject");

        const app = {
          fullName: fd.get("fullName"),
          phone: fd.get("phone"),
          course: subject, // Use subject as "course" field for categorization
          format: "Online Form",
          note: fd.get("message"),
          status: "new",
          createdAt: Date.now()
        };

        if (window.ITCenterDB) {
          window.ITCenterDB.applications.add(app);
          window.ITCenterDB.logActivity("contact_message", app.fullName, `${subject} qoldirdi`);
        }

        if (contactMsg) {
          contactMsg.textContent = "Xabaringiz yuborildi ✅ Tez orada bog'lanamiz.";
          contactMsg.className = "form-msg form-msg--ok";
        }
        contactForm.reset();
      });
    }

    // pay ui form => open pay modal (demo)
    const payUI = $("#pay-ui-form");
    const payMsg = $("#pay-ui-message");
    if (payUI) {
      payUI.addEventListener("submit", (e) => {
        e.preventDefault();
        if (payMsg) {
          payMsg.textContent = "To‘lov oynasi (demo) ochildi ✅ Keyin real to‘lov integratsiya qilamiz.";
          payMsg.classList.add("form-msg--ok");
        }
        window.__ITC_openModal?.("#pay-modal");
      });
    }

    // New payment form (premium section)
    const paymentForm = $("#payment-form");
    const paymentMsg = $("#payment-message");
    if (paymentForm) {
      paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(paymentForm);
        const method = fd.get("payMethod") || "";
        const amount = fd.get("amount") || "";

        if (paymentMsg) {
          paymentMsg.textContent = `To'lov yuborildi ✅ ${method} orqali ${Number(amount).toLocaleString()} so'm. Demo rejim.`;
          paymentMsg.classList.add("form-msg--ok");
        }

        setTimeout(() => paymentForm.reset(), 3000);
      });
    }
  }

  /* ----------------- Back to top button ----------------- */
  function initToTop() {
    const btn = $("#toTop");
    if (!btn) return;

    const showAt = 650;
    const onScroll = () => {
      const on = window.scrollY > showAt;
      btn.classList.toggle("toTop--show", on);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ----------------- Alumni slider (track scroll) ----------------- */
  function initAlumniSlider() {
    const track = $("#alumni-track");
    if (!track) return;
    const prev = $("#alumni-prev");
    const next = $("#alumni-next");

    const by = (dx) => track.scrollBy({ left: dx, behavior: "smooth" });
    prev && prev.addEventListener("click", () => by(-420));
    next && next.addEventListener("click", () => by(420));

    // auto scroll (gentle)
    setInterval(() => {
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 50) return;
      if (track.scrollLeft >= max - 10) track.scrollTo({ left: 0, behavior: "smooth" });
      else track.scrollBy({ left: 320, behavior: "smooth" });
    }, 9000);
  }

  /* ----------------- Neural Network Particles (3D Animation) ----------------- */
  function initGlobe() {
    const canvas = $("#globe-canvas");
    if (!canvas) return;

    const wrap = canvas.parentElement || canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0, h = 0;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    // Responsive particle count based on screen size
    const getParticleCount = () => {
      if (w < 480) return 45;      // Mobile
      if (w < 768) return 65;      // Tablet
      if (w < 1200) return 85;     // Laptop
      return 110;                   // Desktop
    };

    // Responsive connection distance
    const getConnectionDistance = () => {
      if (w < 480) return 80;
      if (w < 768) return 100;
      return 130;
    };

    let particles = [];
    let particleCount = 80;

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.z = Math.random() * 400 - 200;

        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = (Math.random() - 0.5) * 0.3;

        this.size = Math.random() * 2 + 1;
        this.baseSize = this.size;

        // Random color from palette
        const colors = [
          { r: 34, g: 211, b: 238 },   // Cyan
          { r: 99, g: 102, b: 241 },   // Purple
          { r: 51, g: 255, b: 191 },   // Green
          { r: 139, g: 92, b: 246 },   // Violet
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.3;
      }

      update() {
        // Mouse influence
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.vx += dx * force * 0.0008;
          this.vy += dy * force * 0.0008;
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.vz *= 0.99;

        // Boundaries with smooth wrapping
        if (this.x < -50) this.x = w + 50;
        if (this.x > w + 50) this.x = -50;
        if (this.y < -50) this.y = h + 50;
        if (this.y > h + 50) this.y = -50;
        if (this.z < -200) this.z = 200;
        if (this.z > 200) this.z = -200;

        // Size based on Z depth
        const scale = (this.z + 200) / 400;
        this.size = this.baseSize * (0.5 + scale * 0.8);
        this.alpha = 0.2 + scale * 0.5;
      }

      draw() {
        const scale = (this.z + 200) / 400;
        const screenX = this.x + (this.z * 0.1);
        const screenY = this.y + (this.z * 0.05);

        // Glow effect
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, this.size * 4
        );
        gradient.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},${this.alpha})`);
        gradient.addColorStop(0.4, `rgba(${this.color.r},${this.color.g},${this.color.b},${this.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      getScreenPos() {
        return {
          x: this.x + (this.z * 0.1),
          y: this.y + (this.z * 0.05),
          z: this.z
        };
      }
    }

    function initParticles() {
      particleCount = getParticleCount();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function resize() {
      const r = wrap.getBoundingClientRect();
      w = Math.max(280, r.width);
      h = Math.max(200, r.height);
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Reinitialize particles on significant size change
      const newCount = getParticleCount();
      if (Math.abs(newCount - particleCount) > 10 || particles.length === 0) {
        initParticles();
      }
    }

    function drawConnections() {
      const connectionDist = getConnectionDistance();

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i].getScreenPos();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j].getScreenPos();

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.4;
            const zFactor = ((p1.z + p2.z) / 2 + 200) / 400;

            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(34,211,238,${alpha * zFactor})`);
            gradient.addColorStop(0.5, `rgba(99,102,241,${alpha * zFactor * 0.8})`);
            gradient.addColorStop(1, `rgba(51,255,191,${alpha * zFactor})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5 + zFactor * 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }

    function drawCentralGlow(t) {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const pulseSize = Math.sin(t * 0.001) * 20 + 80;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize * 2);
      gradient.addColorStop(0, "rgba(99,102,241,0.15)");
      gradient.addColorStop(0.3, "rgba(34,211,238,0.08)");
      gradient.addColorStop(0.6, "rgba(51,255,191,0.04)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize * 0.5);
      innerGlow.addColorStop(0, "rgba(255,255,255,0.3)");
      innerGlow.addColorStop(0.5, "rgba(34,211,238,0.2)");
      innerGlow.addColorStop(1, "rgba(99,102,241,0)");

      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw(t) {
      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      // Clear with fade effect for trails
      ctx.fillStyle = "rgba(5,8,22,0.15)";
      ctx.fillRect(0, 0, w, h);

      // Background ambient glow
      const bgGlow = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.6);
      bgGlow.addColorStop(0, "rgba(34,211,238,0.05)");
      bgGlow.addColorStop(0.5, "rgba(99,102,241,0.03)");
      bgGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // Central glow pulse
      drawCentralGlow(t);

      // Sort particles by Z for proper depth rendering
      particles.sort((a, b) => a.z - b.z);

      // Update and draw particles
      ctx.globalCompositeOperation = "lighter";

      // Draw connections first
      drawConnections();

      // Draw particles
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      ctx.globalCompositeOperation = "source-over";

      // Floating particles from edges (ambient effect)
      if (Math.random() < 0.02 && particles.length < particleCount + 5) {
        const p = new Particle();
        p.x = Math.random() < 0.5 ? -20 : w + 20;
        p.y = Math.random() * h;
        particles.push(p);
      }

      // Remove excess particles
      while (particles.length > particleCount + 10) {
        particles.shift();
      }

      if (!prefersReduced) raf(draw);
    }

    // Mouse/Touch events
    function handleMove(e) {
      const r = wrap.getBoundingClientRect();
      if (e.touches) {
        targetMouseX = e.touches[0].clientX - r.left;
        targetMouseY = e.touches[0].clientY - r.top;
      } else {
        targetMouseX = e.clientX - r.left;
        targetMouseY = e.clientY - r.top;
      }
    }

    wrap.addEventListener("mousemove", handleMove, { passive: true });
    wrap.addEventListener("touchmove", handleMove, { passive: true });
    wrap.addEventListener("touchstart", handleMove, { passive: true });

    // Reset mouse position when leaving
    wrap.addEventListener("mouseleave", () => {
      targetMouseX = w * 0.5;
      targetMouseY = h * 0.5;
    }, { passive: true });

    // Device orientation for mobile tilt effect
    if ("DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", (ev) => {
        const g = typeof ev.gamma === "number" ? ev.gamma : 0;
        const b = typeof ev.beta === "number" ? ev.beta : 0;
        targetMouseX = w * 0.5 + g * 3;
        targetMouseY = h * 0.5 + b * 2;
      }, { passive: true });
    }

    resize();
    initParticles();
    window.addEventListener("resize", resize, { passive: true });

    // Initial mouse position at center
    mouseX = w * 0.5;
    mouseY = h * 0.5;
    targetMouseX = mouseX;
    targetMouseY = mouseY;

    raf(draw);
  }

  /* ----------------- Year ----------------- */
  function initYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ----------------- Reveal animations (if CSS uses hidden state) ----------------- */
  function revealAll() {
    // In case some CSS hides [data-animate] until JS: make sure site is visible.
    $$("[data-animate], .reveal, .anim-in").forEach(el => el.classList.add("is-in"));
  }

  /* ----------------- Render Mentors from DB ----------------- */
  function renderMentorsFromDB() {
    const db = window.ITCenterDB;
    const track = document.getElementById("mentor-track");
    if (!db || !track) return;

    const mentors = db.mentors.getAll();
    if (!mentors.length) return;

    // Clear existing static content and render from DB
    track.innerHTML = "";

    mentors.forEach((m, idx) => {
      const badges = ["PRO", "TOP", "⭐"];
      const badge = badges[idx % 3];
      const badgeClass = badge === "PRO" ? "m-badge--pro" : badge === "TOP" ? "m-badge--top" : "m-badge--star";

      const card = document.createElement("article");
      card.className = "mentor-card";
      card.innerHTML = `
        <div class="m-top">
          <span class="m-badge ${badgeClass}">${badge}</span>
          <span class="m-role">${m.role || "Mentor"}</span>
        </div>
        <h3>${m.name}</h3>
        <p>${m.description || m.role + " bo'yicha tajribali mutaxassis."}</p>
        <div class="m-tags">
          ${(m.tags || [m.role]).map(t => `<span>${t}</span>`).join("")}
        </div>
        <div class="m-proof">
          <span>⭐ ${m.rating || 4.8}</span><span>${m.reviews || 50}+ review</span>
        </div>
        <button class="btn btn-ghost">Profil</button>
      `;
      track.appendChild(card);
    });

    // Duplicate for infinite scroll effect
    const cards = track.querySelectorAll(".mentor-card");
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }

  /* ----------------- Render Courses from DB ----------------- */
  function renderCoursesFromDB() {
    const db = window.ITCenterDB;
    const grid = document.querySelector(".courses-grid");
    if (!db || !grid) return;

    const courses = db.courses.getAll();
    if (!courses.length) return;

    // Update prices from DB
    const cards = grid.querySelectorAll(".course-card");
    courses.forEach((course, idx) => {
      if (cards[idx]) {
        const priceEl = cards[idx].querySelector(".course-price");
        if (priceEl && course.price) {
          priceEl.textContent = Number(course.price).toLocaleString() + " so'm/oy";
        }
      }
    });
  }

  /* ----------------- Render Groups from DB ----------------- */
  function renderGroupsFromDB() {
    const db = window.ITCenterDB;
    if (!db) {
      console.warn("ITCenterDB topilmadi!");
      return;
    }

    // Reload to get latest data (especially attendance from other tabs)
    if (db.reload) db.reload();

    const groups = db.groups.getAll();
    const courses = db.courses.getAll();
    const mentors = db.mentors.getAll();
    const todayAttendance = db.attendance.getToday();
    console.log("📊 Guruhlar:", groups.length, "ta, Bugungi davomat:", todayAttendance.length, "ta");

    // Find or create groups display container
    let container = document.getElementById("active-groups-list");
    if (!container) {
      // Create container inside schedule section's .container div
      const scheduleSection = document.getElementById("schedule");
      console.log("📍 Schedule section:", scheduleSection ? "topildi" : "TOPILMADI");

      if (scheduleSection) {
        // Find the .container div inside schedule section
        const innerContainer = scheduleSection.querySelector(".container");
        console.log("📍 Inner container:", innerContainer ? "topildi" : "TOPILMADI");

        const groupsDiv = document.createElement("div");
        groupsDiv.id = "active-groups-list";
        groupsDiv.className = "groups-list-container";

        if (innerContainer) {
          innerContainer.appendChild(groupsDiv);
        } else {
          // Fallback: append to schedule section directly
          scheduleSection.appendChild(groupsDiv);
        }
        container = groupsDiv;
        console.log("✅ Guruhlar container yaratildi");
      }
    }

    if (!container || !groups.length) {
      console.warn("Container yoki guruhlar yo'q");
      return;
    }

    container.innerHTML = `<h3 class="groups-title">📚 Faol guruhlar (${groups.length} ta)</h3>`;

    const list = document.createElement("div");
    list.className = "groups-chips";

    groups.forEach(g => {
      const course = courses.find(c => c.id === g.courseId);
      const mentor = mentors.find(m => m.id === g.mentorId);

      // Get today's attendance for this group
      const todayAttendance = db.attendance.getTodayByGroup(g.id);
      const attendancePercent = todayAttendance ? todayAttendance.percentage : 0;
      const hasAttendance = !!todayAttendance;

      const statusText = g.status === "active" ? "Faol" : g.status === "recruiting" ? "Yig'ilmoqda" : "To'la";
      const statusClass = `group-status--${g.status}`;

      // Attendance status styling
      const attendanceClass = attendancePercent >= 80 ? "high" : attendancePercent >= 50 ? "medium" : "low";
      const attendanceLabel = hasAttendance ? `${attendancePercent}% keldi` : "Davomat yo'q";

      const chip = document.createElement("div");
      chip.className = "group-chip";
      chip.innerHTML = `
        <div class="group-chip-header">
          <span class="group-id">${g.id}</span>
          <span class="group-status ${statusClass}">${statusText}</span>
        </div>
        <span class="group-course">${course?.name || "Kurs"}</span>
        <div class="group-meta">
          <span class="group-meta-item"><span class="group-meta-icon">👨‍🏫</span> ${mentor?.name || "Mentor"}</span>
          <span class="group-meta-item"><span class="group-meta-icon">🕐</span> ${g.schedule?.split("•")[1]?.trim() || g.schedule || ""}</span>
          <span class="group-meta-item"><span class="group-meta-icon">🚪</span> ${g.room || ""}</span>
        </div>
        <div class="group-attendance">
          <div class="group-attendance-bar">
            <div class="group-attendance-fill group-attendance-fill--${attendanceClass}" style="width: ${attendancePercent}%"></div>
          </div>
          <div class="group-attendance-text">
            <span class="group-attendance-label ${hasAttendance ? 'group-attendance-live' : ''}">${hasAttendance ? '🟢 LIVE' : '⚪'} ${attendanceLabel}</span>
            <span>${g.studentCount} talaba</span>
          </div>
        </div>
      `;
      list.appendChild(chip);
    });

    container.appendChild(list);
  }

  /* ----------------- Sync with LocalStorage changes ----------------- */
  function initDBSync() {
    // Listen for storage changes from other tabs (admin panel)
    window.addEventListener("storage", (e) => {
      if (e.key === "itcenter_db") {
        // Reload data and re-render
        const db = window.ITCenterDB;
        if (db && db.reload) db.reload();
        renderMentorsFromDB();
        renderCoursesFromDB();
        renderGroupsFromDB();
      }
    });

    // Listen for custom sync event
    window.addEventListener("itcenter-db-sync", () => {
      renderMentorsFromDB();
      renderCoursesFromDB();
      renderGroupsFromDB();
    });

    // Periodic sync check (every 3 seconds) for cross-tab updates
    let lastSyncTime = localStorage.getItem("itcenter_db_lastupdate") || "0";
    setInterval(() => {
      const currentTime = localStorage.getItem("itcenter_db_lastupdate") || "0";
      if (currentTime !== lastSyncTime) {
        lastSyncTime = currentTime;
        const db = window.ITCenterDB;
        if (db && db.reload) db.reload();
        renderGroupsFromDB();
        console.log("🔄 Davomat yangilandi:", new Date().toLocaleTimeString());
      }
    }, 3000);
  }

  /* ----------------- Init ----------------- */
  document.addEventListener("DOMContentLoaded", () => {
    // Safety: always show content even if something fails later
    revealAll();

    initNavActive();
    initTheme();
    initLang();
    initNotify();
    initModals();
    initAuthTabs();
    initScheduleTabs();
    initCourseFilters();
    initReco();
    initForms();
    initToTop();
    initAlumniSlider();
    initGlobe();
    initYear();

    // Render from database
    renderMentorsFromDB();
    renderCoursesFromDB();
    renderGroupsFromDB();
    initDBSync();

    // Finally hide loader
    hideLoader();
  });

  // Fallback (if DOMContentLoaded already fired)
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => {
      try { hideLoader(); } catch { }
    }, 600);
  }
})();
