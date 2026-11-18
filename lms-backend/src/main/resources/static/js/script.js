const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const roleNames = ["Mahasiswa", "Dosen", "Admin"];
const icon = name => `<i data-lucide="${name}"></i>`;

const today = new Date();
const dateText = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(today);

const demoCourses = [
  {
    name: "Pemrograman Web",
    code: "TRPL302",
    lecturer: "Dina Rahmawati, S.Kom., M.Kom.",
    room: "Lab Komputer 2",
    time: "Senin, 08.00–09.40",
    progress: 78
  },
  {
    name: "Kecerdasan Buatan",
    code: "TRPL405",
    lecturer: "Andi Saputra, M.Kom.",
    room: "Ruang 304",
    time: "Selasa, 10.00–11.40",
    progress: 55
  },
  {
    name: "Basis Data Lanjut",
    code: "TRPL311",
    lecturer: "Rina Oktaviani, M.Kom.",
    room: "Lab Basis Data",
    time: "Rabu, 13.00–14.40",
    progress: 90
  }
];

const navByRole = {
  Mahasiswa: [
    ["Dashboard", "dashboard", "layout-dashboard"],
    ["Perkuliahan", "perkuliahan", "book-open"],
    ["Aktivitas Akademik", "aktivitas", "clipboard-list"],
    ["Presensi", "presensi", "calendar-check"],
    ["Nilai", "nilai", "chart-no-axes-column-increasing"],
    ["Pengumuman", "pengumuman", "megaphone"],
    ["Profil", "profil", "user-round"]
  ],

  Dosen: [
    ["Dashboard", "dashboard", "layout-dashboard"],
    ["Perkuliahan", "perkuliahan", "book-open"],
    ["Aktivitas Akademik", "aktivitas", "clipboard-list"],
    ["Presensi", "presensi", "calendar-check"],
    ["Penilaian", "nilai", "chart-no-axes-column-increasing"],
    ["Pengumuman", "pengumuman", "megaphone"],
    ["Profil", "profil", "user-round"]
  ],

  Admin: [
    ["Dashboard", "dashboard", "layout-dashboard"],
    ["Pengguna & Hak Akses", "pengguna", "users"],
    ["Data Akademik", "akademik", "database"],
    ["Perkuliahan", "perkuliahan", "book-open"],
    ["Jadwal", "jadwal", "calendar-days"],
    ["Presensi", "presensi", "calendar-check"],
    ["Pengaturan & Laporan", "pengaturan", "settings"],
    ["Profil", "profil", "user-round"]
  ]
};

let currentUser = null;
let currentPage = "dashboard";
let searchTerm = "";

function init() {
  if ($("#loginForm")) initLogin();
  if ($("#pageContent")) initDashboard();
  if (window.lucide) lucide.createIcons();
}

function initLogin() {
  $("#togglePassword")?.addEventListener("click", () => {
    const input = $("#password");

    input.type = input.type === "password" ? "text" : "password";

    $("#togglePassword").innerHTML =
      icon(input.type === "password" ? "eye" : "eye-off");

    refreshIcons();
  });

  $("#loginForm").addEventListener("submit", e => {
    e.preventDefault();

    const username = $("#username").value.trim();
    const password = $("#password").value;
    const role = $("#role").value;

    if (!username || !password) {
      $("#loginError").textContent =
        "Nama pengguna dan kata sandi wajib diisi.";
      return;
    }

    localStorage.setItem(
      "lmsUser",
      JSON.stringify({ username, role })
    );

    window.location.href = "dashboard.html";
  });
}

function initDashboard() {
  try {
    currentUser = JSON.parse(localStorage.getItem("lmsUser"));
  } catch (e) {}

  if (!currentUser || !roleNames.includes(currentUser.role)) {
    window.location.href = "index.html";
    return;
  }

  $("#topName").textContent = currentUser.username;
  $("#topRole").textContent = currentUser.role;
  $("#topAvatar").textContent = initials(currentUser.username);

  renderNav();
  renderPage("dashboard");

  $("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("lmsUser");
    window.location.href = "index.html";
  });

  $("#mobileMenu").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });

  $("#profileMenu").addEventListener("click", () => {
    renderPage("profil");
  });

  $("#notificationBtn").addEventListener("click", () => {
    renderPage("pengumuman");
  });

  $("#globalSearch").addEventListener("input", e => {
    searchTerm = e.target.value.toLowerCase();

    if (
      currentPage === "perkuliahan" ||
      currentPage === "aktivitas" ||
      currentPage === "pengguna"
    ) {
      renderPage(currentPage);
    }
  });

  $("#closeModal").addEventListener("click", closeModal);

  $("#modalBackdrop").addEventListener("click", e => {
    if (e.target.id === "modalBackdrop") closeModal();
  });

  document.addEventListener("click", e => {
    const link = e.target.closest("[data-page]");

    if (link) {
      e.preventDefault();
      renderPage(link.dataset.page);
      $("#sidebar").classList.remove("open");
    }

    const action = e.target.closest("[data-action]");

    if (action) {
      handleAction(
        action.dataset.action,
        action.dataset.name || ""
      );
    }
  });
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(x => x[0])
    .join("")
    .toUpperCase();
}

function renderNav() {
  $("#sideNav").innerHTML = navByRole[currentUser.role]
    .map(([label, page, ic]) => `
      <button class="nav-link ${page === currentPage ? "active" : ""}"
        data-page="${page}">
        ${icon(ic)}
        <span>${label}</span>
        ${
          page === "aktivitas" && currentUser.role === "Mahasiswa"
            ? '<span class="nav-count">3</span>'
            : ""
        }
      </button>
    `)
    .join("");

  refreshIcons();
}

function pageHeading(title, desc, actions = "") {
  return `
    <div class="page-heading">
      <div>
        <h1>${title}</h1>
        <p>${desc}</p>
      </div>
      <div class="heading-actions">${actions}</div>
    </div>
  `;
}

function button(
  label,
  action,
  ic = "plus",
  cls = "btn btn-primary btn-small"
) {
  return `
    <button class="${cls}" data-action="${action}">
      ${icon(ic)}${label}
    </button>
  `;
}

function welcome() {
  const greet =
    today.getHours() < 11 ? "Selamat pagi" :
    today.getHours() < 15 ? "Selamat siang" :
    today.getHours() < 18 ? "Selamat sore" :
    "Selamat malam";

  return `
    <section class="welcome-banner">
      <div class="welcome-copy">
        <span class="eyebrow">LEARNING MANAGEMENT SYSTEM</span>
        <h2>${greet}, ${escapeHTML(currentUser.username)}! 👋</h2>
        <p>
          Semoga aktivitas akademikmu hari ini berjalan lancar.
          Yuk, lanjutkan progres belajarmu.
        </p>
      </div>
      <div class="banner-date">
        ${icon("calendar-days")} ${dateText}
      </div>
    </section>
  `;
}

function stat(label, value, sub, ic, color) {
  return `
    <article class="stat-card">
      <div class="stat-top">
        <span class="stat-label">${label}</span>
        <span class="stat-icon ${color}">${icon(ic)}</span>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-foot">${sub}</div>
    </article>
  `;
}

function dashboardPage() {
  const role = currentUser.role;

  let stats = role === "Mahasiswa" ? [
    stat("Mata Kuliah Aktif", "6", "Semester berjalan", "book-open", "blue"),
    stat("Tugas Mendatang", "3", "2 perlu segera dikumpulkan", "clipboard-check", "orange"),
    stat("Kehadiran", "92%", "+2% dari bulan lalu", "calendar-check", "green"),
    stat("Rata-rata Nilai", "87,5", "Performa akademik baik", "award", "purple")
  ] : role === "Dosen" ? [
    stat("Mata Kuliah Diampu", "4", "Semester berjalan", "book-open", "blue"),
    stat("Total Mahasiswa", "128", "Dari seluruh kelas", "users", "green"),
    stat("Perlu Dinilai", "18", "Pengumpulan tugas", "clipboard-check", "orange"),
    stat("Kuis Aktif", "2", "Sedang berlangsung", "file-question", "purple")
  ] : [
    stat("Total Mahasiswa", "1.248", "Data akademik aktif", "users", "blue"),
    stat("Total Dosen", "86", "Dosen terdaftar", "user-round", "green"),
    stat("Mata Kuliah", "64", "Semester berjalan", "book-open", "orange"),
    stat("Kelas Aktif", "32", "Tahun akademik 2026/2027", "school", "purple")
  ];

  const schedules = role === "Mahasiswa" ? [
    ["08.00 – 09.40", "Pemrograman Web", "Dina Rahmawati · Lab Komputer 2"],
    ["10.00 – 11.40", "Kecerdasan Buatan", "Andi Saputra · Ruang 304"],
    ["13.00 – 14.40", "Basis Data Lanjut", "Rina Oktaviani · Lab Basis Data"]
  ] : role === "Dosen" ? [
    ["08.00 – 09.40", "Pemrograman Web", "TRPL 3A · Lab Komputer 2"],
    ["10.00 – 11.40", "Praktikum Web", "TRPL 3B · Lab Komputer 1"],
    ["13.00 – 14.40", "Konsultasi Akademik", "Ruang Dosen"]
  ] : [
    ["08.00 – 09.40", "Pemrograman Web", "TRPL 3A · Lab Komputer 2"],
    ["10.00 – 11.40", "Kecerdasan Buatan", "TRPL 5A · Ruang 304"],
    ["13.00 – 14.40", "Basis Data Lanjut", "TRPL 3B · Lab Basis Data"]
  ];

  const activities = role === "Mahasiswa" ? [
    ["file-text", "Tugas Pemrograman Web", "Batas pengumpulan: 20 November 2026", "Hari ini"],
    ["megaphone", "Pengumuman jadwal UTS", "Informasi dari bagian akademik", "Kemarin"],
    ["check-circle", "Presensi berhasil dicatat", "Kecerdasan Buatan · Pertemuan 8", "2 hari lalu"]
  ] : role === "Dosen" ? [
    ["inbox", "18 tugas menunggu penilaian", "Periksa pengumpulan mahasiswa", "Hari ini"],
    ["users", "Kelas TRPL 3A diperbarui", "Daftar peserta kelas", "Kemarin"],
    ["file-plus", "Materi baru ditambahkan", "Pemrograman Web · Modul 5", "2 hari lalu"]
  ] : [
    ["user-plus", "Data mahasiswa diperbarui", "Penambahan data mahasiswa baru", "Hari ini"],
    ["calendar", "Jadwal perkuliahan diperbarui", "Semester ganjil 2026/2027", "Kemarin"],
    ["shield-check", "Aktivitas sistem berjalan normal", "Tidak ada kendala terdeteksi", "2 hari lalu"]
  ];

  return `
    ${welcome()}

    <div class="stats-grid">${stats.join("")}</div>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Jadwal Perkuliahan</h3>
            <p>Agenda kegiatan akademik hari ini</p>
          </div>
          <button class="text-link" data-page="jadwal">Lihat jadwal</button>
        </div>

        <div class="schedule-list">
          ${schedules.map((s, i) => `
            <div class="schedule-item">
              <div class="schedule-time">${s[0]}</div>
              <div class="schedule-line"></div>
              <div class="schedule-detail">
                <strong>${s[1]}</strong>
                <small>${s[2]}</small>
              </div>
              <span class="schedule-tag">
                ${i === 0 ? "Berikutnya" : "Terjadwal"}
              </span>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Aktivitas Terbaru</h3>
            <p>Informasi terbaru di LMS</p>
          </div>
          <button class="text-link" data-page="pengumuman">Semua</button>
        </div>

        <div class="activity-list">
          ${activities.map(a => `
            <div class="activity-item">
              <span class="activity-icon">${icon(a[0])}</span>
              <div>
                <strong>${a[1]}</strong>
                <p>${a[2]}</p>
                <small>${a[3]}</small>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>${role === "Admin" ? "Ringkasan Perkuliahan" : "Perkuliahan Saya"}</h3>
          <p>Mata kuliah pada semester berjalan</p>
        </div>
        <button class="text-link" data-page="perkuliahan">Lihat semua</button>
      </div>
      <div class="course-grid">
        ${demoCourses.map(courseCard).join("")}
      </div>
    </section>
  `;
}

function courseCard(c) {
  return `
    <article class="course-card">
      <div class="course-top">
        <span class="course-symbol">${icon("book-open")}</span>
        <span class="status info">${c.code}</span>
      </div>
      <h3>${c.name}</h3>
      <p>${c.lecturer}</p>
      <div class="progress">
        <span style="width:${c.progress}%"></span>
      </div>
      <div class="course-meta">
        <span>Progres materi</span>
        <strong>${c.progress}%</strong>
      </div>
      <div class="course-meta">
        <span>${c.time}</span>
        <span>${c.room}</span>
      </div>
      <div style="margin-top:13px">
        <button class="text-link" data-action="open-course" data-name="${c.name}">
          Buka perkuliahan →
        </button>
      </div>
    </article>
  `;
}

function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

function status(label, type = "info") {
  return `<span class="status ${type}">${label}</span>`;
}

function perkuliahanPage() {
  const courses = demoCourses.filter(c =>
    (c.name + " " + c.code + " " + c.lecturer)
      .toLowerCase()
      .includes(searchTerm)
  );

  const isLecturer = currentUser.role === "Dosen";
  const isAdmin = currentUser.role === "Admin";

  return `
    ${pageHeading(
      "Perkuliahan",
      "Kelola dan akses mata kuliah, materi pembelajaran, RPS, serta informasi dosen.",
      isLecturer
        ? button("Tambah Materi", "add-material", "upload")
        : isAdmin
          ? button("Tambah Mata Kuliah", "add-course")
          : ""
    )}

    <div class="filter-row">
      <div class="search-control">
        ${icon("search")}
        <input id="courseSearch" placeholder="Cari mata kuliah..."
          value="${escapeHTML(searchTerm)}">
      </div>
      <select class="filter-control">
        <option>Semester Ganjil 2026/2027</option>
        <option>Semester Genap 2025/2026</option>
      </select>
      <select class="filter-control">
        <option>Semua mata kuliah</option>
        <option>Berlangsung</option>
      </select>
    </div>

    <div class="course-grid">
      ${courses.map(courseCard).join("") ||
        '<div class="empty-state">Mata kuliah tidak ditemukan.</div>'}
    </div>

    <section class="panel section-gap">
      <div class="panel-head">
        <div>
          <h3>Materi Pembelajaran</h3>
          <p>Materi yang dibagikan dalam perkuliahan.</p>
        </div>
        ${isLecturer ? button("Unggah Materi", "add-material", "upload") : ""}
      </div>

      ${table(
        ["MATERI", "MATA KULIAH", "TIPE", "TANGGAL", "AKSES", "AKSI"],
        [
          ["Modul 01 - Pengenalan", "Pemrograman Web", "PDF", "10 Nov 2026",
            status("Dibuka", "success"),
            `<button class="action-btn" data-action="view-material" data-name="Modul 01 - Pengenalan">Lihat</button>`],
          ["Modul 02 - HTML & CSS", "Pemrograman Web", "PDF", "12 Nov 2026",
            status("Dibuka", "success"),
            `<button class="action-btn" data-action="view-material" data-name="Modul 02 - HTML & CSS">Lihat</button>`],
          ["Pengantar Machine Learning", "Kecerdasan Buatan", "Video", "14 Nov 2026",
            status("Belum dibuka", "warning"),
            `<button class="action-btn" data-action="view-material" data-name="Pengantar Machine Learning">Detail</button>`],
          ["Normalisasi Database", "Basis Data Lanjut", "PDF", "15 Nov 2026",
            status("Dibuka", "success"),
            `<button class="action-btn" data-action="view-material" data-name="Normalisasi Database">Lihat</button>`]
        ].map(r => `<tr>${r.map(v => `<td>${v}</td>`).join("")}</tr>`)
      )}
    </section>
  `;
}

function aktivitasPage() {
  const lecturer = currentUser.role === "Dosen";

  const rows = [
    ["Tugas 01 - Membuat Halaman Web", "Pemrograman Web", "20 Nov 2026",
      lecturer ? "28 / 32 dikumpulkan" : "Belum dikumpulkan",
      lecturer ? status("Perlu dinilai", "warning") : status("Belum dikerjakan", "warning")],
    ["Kuis Dasar Machine Learning", "Kecerdasan Buatan", "22 Nov 2026",
      lecturer ? "32 peserta" : "Durasi 30 menit",
      status("Aktif", "success")],
    ["Tugas Normalisasi Database", "Basis Data Lanjut", "25 Nov 2026",
      lecturer ? "24 / 30 dikumpulkan" : "Sudah dikumpulkan",
      status("Berlangsung", "info")]
  ];

  return `
    ${pageHeading(
      "Aktivitas Akademik",
      "Kelola tugas, pengumpulan tugas, dan kuis perkuliahan.",
      lecturer ? button("Buat Aktivitas", "add-activity") : ""
    )}

    <div class="stats-grid">
      ${stat("Total Aktivitas", "12", "Semester berjalan", "clipboard-list", "blue")}
      ${stat("Tugas", "8", "Tugas perkuliahan", "file-text", "orange")}
      ${stat("Kuis", "4", "Kuis pembelajaran", "file-question", "purple")}
      ${stat(
        lecturer ? "Perlu Diperiksa" : "Selesai",
        lecturer ? "18" : "9",
        "Aktivitas akademik",
        "check-circle",
        "green"
      )}
    </div>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Daftar Aktivitas</h3>
          <p>Aktivitas dan pengumpulan tugas akademik</p>
        </div>
      </div>

      ${table(
        ["NAMA AKTIVITAS", "MATA KULIAH", "TENGGAT", "INFORMASI", "STATUS", "AKSI"],
        rows.map(r => `
          <tr>
            <td><strong>${r[0]}</strong></td>
            <td>${r[1]}</td>
            <td>${r[2]}</td>
            <td>${r[3]}</td>
            <td>${r[4]}</td>
            <td>
              <button class="action-btn"
                data-action="${lecturer ? "grade-activity" : "submit-activity"}"
                data-name="${r[0]}">
                ${lecturer ? "Periksa" : "Buka"}
              </button>
            </td>
          </tr>
        `)
      )}
    </section>
  `;
}

function presensiPage() {
  const lecturer = currentUser.role === "Dosen";

  const rows = [
    ["Pemrograman Web", "10 Nov 2026", "Hadir", "08.00"],
    ["Kecerdasan Buatan", "12 Nov 2026", "Hadir", "10.00"],
    ["Basis Data Lanjut", "14 Nov 2026", "Izin", "13.00"],
    ["Pemrograman Web", "17 Nov 2026", "Hadir", "08.00"]
  ];

  return `
    ${pageHeading(
      "Presensi",
      lecturer
        ? "Catat dan pantau kehadiran mahasiswa."
        : "Lihat riwayat dan persentase kehadiran perkuliahan.",
      lecturer ? button("Catat Presensi", "take-attendance") : ""
    )}

    <div class="stats-grid">
      ${stat("Hadir", "23", "Pertemuan tercatat", "check-circle", "green")}
      ${stat("Izin", "2", "Izin tercatat", "file-text", "orange")}
      ${stat("Tidak Hadir", "1", "Tanpa keterangan", "x-circle", "purple")}
      ${stat("Persentase", "92%", "Kehadiran semester ini", "chart-no-axes-column-increasing", "blue")}
    </div>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>${lecturer ? "Rekap Kehadiran Mahasiswa" : "Riwayat Kehadiran"}</h3>
          <p>Data presensi semester ganjil 2026/2027</p>
        </div>
        <button class="btn btn-outline btn-small" data-action="export-data">
          ${icon("download")} Unduh Rekap
        </button>
      </div>

      ${table(
        ["MATA KULIAH", "TANGGAL", "STATUS", "JAM", "AKSI"],
        rows.map(r => `
          <tr>
            <td><strong>${r[0]}</strong></td>
            <td>${r[1]}</td>
            <td>${status(r[2], r[2] === "Hadir" ? "success" : "warning")}</td>
            <td>${r[3]}</td>
            <td>
              <button class="action-btn" data-action="attendance-detail" data-name="${r[0]}">
                Detail
              </button>
            </td>
          </tr>
        `)
      )}
    </section>
  `;
}

function nilaiPage() {
  const lecturer = currentUser.role === "Dosen";

  return `
    ${pageHeading(
      lecturer ? "Penilaian" : "Nilai Akademik",
      lecturer
        ? "Kelola nilai tugas, kuis, feedback, dan nilai akhir mahasiswa."
        : "Pantau hasil penilaian tugas, kuis, dan nilai akhir perkuliahan."
    )}

    <div class="stats-grid">
      ${stat("Nilai Tugas", "88", "Rata-rata tugas", "file-text", "blue")}
      ${stat("Nilai Kuis", "85", "Rata-rata kuis", "file-question", "orange")}
      ${stat("Nilai UTS", "86", "Hasil ujian tengah semester", "book-open", "purple")}
      ${stat("Nilai Akhir", "87,5", "Predikat A", "award", "green")}
    </div>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>${lecturer ? "Rekap Penilaian" : "Rincian Nilai"}</h3>
          <p>Nilai berdasarkan mata kuliah dan aktivitas akademik</p>
        </div>
        ${lecturer ? button("Input Nilai", "input-grade") : ""}
      </div>

      ${table(
        ["MATA KULIAH", "TUGAS", "KUIS", "UTS", "NILAI AKHIR", "FEEDBACK"],
        [
          ["Pemrograman Web", "90", "88", "85", "88",
            `<button class="action-btn" data-action="feedback">Lihat feedback</button>`],
          ["Kecerdasan Buatan", "85", "90", "88", "87,7",
            `<button class="action-btn" data-action="feedback">Lihat feedback</button>`],
          ["Basis Data Lanjut", "88", "80", "85", "84,3",
            `<button class="action-btn" data-action="feedback">Lihat feedback</button>`]
        ].map(r => `<tr>${r.map(v => `<td>${v}</td>`).join("")}</tr>`)
      )}
    </section>
  `;
}

function pengumumanPage() {
  return `
    ${pageHeading(
      "Pengumuman & Komunikasi",
      "Informasi akademik, pengumuman dosen, dan notifikasi sistem.",
      currentUser.role === "Admin"
        ? button("Buat Pengumuman", "add-announcement")
        : ""
    )}

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Pengumuman Terbaru</h3>
          <p>Informasi yang ditujukan kepada pengguna LMS</p>
        </div>
      </div>

      ${[
        [
          "megaphone",
          "Informasi Jadwal Ujian Tengah Semester",
          "Jadwal UTS semester ganjil 2026/2027 dapat dilihat melalui bagian akademik. Pastikan seluruh mahasiswa memperhatikan jadwal dan ruang ujian.",
          "17 November 2026"
        ],
        [
          "calendar-days",
          "Pembaruan Jadwal Perkuliahan",
          "Terdapat penyesuaian jadwal pada beberapa mata kuliah. Silakan periksa jadwal terbaru.",
          "15 November 2026"
        ],
        [
          "book-open",
          "Materi Pembelajaran Minggu Ke-8",
          "Dosen pengampu telah membagikan materi pembelajaran terbaru melalui menu Perkuliahan.",
          "13 November 2026"
        ]
      ].map(n => `
        <div class="notice-item">
          <span class="activity-icon">${icon(n[0])}</span>
          <div>
            <strong>${n[1]}</strong>
            <p>${n[2]}</p>
            <small>${n[3]} · Akademik</small>
          </div>
        </div>
      `).join("")}
    </section>
  `;
}

function profilPage() {
  return `
    ${pageHeading(
      "Profil Pengguna",
      "Informasi akun dan data diri pengguna LMS.",
      button("Edit Profil", "edit-profile", "pencil", "btn btn-outline btn-small")
    )}

    <section class="panel profile-card">
      <div class="profile-large">${initials(currentUser.username)}</div>
      <div>
        <h3>${escapeHTML(currentUser.username)}</h3>
        <p>${currentUser.role} · LMS Kampus</p>
        <div style="margin-top:9px">${status("Akun aktif", "success")}</div>
      </div>
    </section>

    <section class="panel section-gap">
      <div class="panel-head">
        <div>
          <h3>Informasi Pengguna</h3>
          <p>Data profil dan informasi akademik</p>
        </div>
      </div>

      <div class="profile-details">
        ${[
          ["Nama Pengguna", currentUser.username],
          ["Role", currentUser.role],
          ["Email", currentUser.username.toLowerCase().replace(/\s+/g, ".") + "@kampus.ac.id"],
          ["Status Akun", "Aktif"],
          ["Program Studi", "Teknologi Rekayasa Perangkat Lunak"],
          ["Tahun Akademik", "2026/2027"]
        ].map(x => `
          <div class="info-row">
            <span>${x[0]}</span>
            <strong>${escapeHTML(x[1])}</strong>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="panel section-gap">
      <div class="panel-head">
        <div>
          <h3>Keamanan Akun</h3>
          <p>Pengaturan keamanan akun pengguna</p>
        </div>
      </div>
      <button class="btn btn-outline btn-small" data-action="change-password">
        ${icon("lock")} Ubah Kata Sandi
      </button>
    </section>
  `;
}

function penggunaPage() {
  const users = [
    ["Gina Evelyn", "gina@kampus.ac.id", "Mahasiswa", "Aktif"],
    ["Dina Rahmawati", "dina@kampus.ac.id", "Dosen", "Aktif"],
    ["Andi Saputra", "andi@kampus.ac.id", "Dosen", "Aktif"],
    ["Admin Akademik", "admin@kampus.ac.id", "Admin", "Aktif"]
  ];

  return `
    ${pageHeading(
      "Pengguna & Hak Akses",
      "Kelola data mahasiswa, dosen, akun, dan role pengguna.",
      button("Tambah Pengguna", "add-user", "user-plus")
    )}

    <div class="stats-grid">
      ${stat("Total Pengguna", "1.334", "Seluruh akun", "users", "blue")}
      ${stat("Mahasiswa", "1.248", "Akun mahasiswa", "graduation-cap", "green")}
      ${stat("Dosen", "86", "Akun dosen", "user-round", "orange")}
      ${stat("Admin", "4", "Pengelola sistem", "shield-check", "purple")}
    </div>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Daftar Pengguna</h3>
          <p>Data pengguna dan hak akses LMS</p>
        </div>
      </div>

      ${table(
        ["NAMA", "EMAIL", "ROLE", "STATUS", "AKSI"],
        users.map(u => `
          <tr>
            <td><strong>${u[0]}</strong></td>
            <td>${u[1]}</td>
            <td>${u[2]}</td>
            <td>${status(u[3], "success")}</td>
            <td>
              <button class="action-btn" data-action="edit-user" data-name="${u[0]}">
                Kelola
              </button>
            </td>
          </tr>
        `)
      )}
    </section>

    <section class="panel section-gap">
      <div class="panel-head">
        <div>
          <h3>Impor Data Pengguna</h3>
          <p>Unggah data mahasiswa atau dosen melalui file Excel.</p>
        </div>
      </div>
      <button class="btn btn-outline btn-small" data-action="import-excel">
        ${icon("file-spreadsheet")} Pilih File Excel
      </button>
    </section>
  `;
}

function akademikPage() {
  return `
    ${pageHeading(
      "Data Akademik",
      "Kelola fakultas, program studi, mata kuliah, SKS, semester, dan tahun akademik.",
      button("Tambah Data", "add-academic")
    )}

    <div class="stats-grid">
      ${stat("Fakultas", "5", "Data fakultas", "building-2", "blue")}
      ${stat("Program Studi", "12", "Program studi aktif", "school", "green")}
      ${stat("Mata Kuliah", "64", "Mata kuliah terdaftar", "book-open", "orange")}
      ${stat("Tahun Akademik", "2026/27", "Semester ganjil", "calendar-days", "purple")}
    </div>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Daftar Mata Kuliah</h3>
          <p>Data mata kuliah dan beban studi</p>
        </div>
      </div>

      ${table(
        ["KODE", "MATA KULIAH", "PROGRAM STUDI", "SKS", "SEMESTER", "AKSI"],
        [
          ["TRPL302", "Pemrograman Web", "TRPL", "3", "3"],
          ["TRPL405", "Kecerdasan Buatan", "TRPL", "3", "5"],
          ["TRPL311", "Basis Data Lanjut", "TRPL", "3", "3"]
        ].map(r => `
          <tr>
            ${r.map(v => `<td>${v}</td>`).join("")}
            <td><button class="action-btn" data-action="edit-academic">Edit</button></td>
          </tr>
        `)
      )}
    </section>
  `;
}

function jadwalPage() {
  return `
    ${pageHeading(
      "Pengelolaan Jadwal",
      "Atur jadwal kuliah berdasarkan hari, jam, dan ruangan.",
      button("Tambah Jadwal", "add-schedule")
    )}

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Jadwal Perkuliahan</h3>
          <p>Semester ganjil 2026/2027</p>
        </div>
        <select class="filter-control">
          <option>Semua hari</option>
          <option>Senin</option>
          <option>Selasa</option>
          <option>Rabu</option>
        </select>
      </div>

      ${table(
        ["HARI", "JAM", "MATA KULIAH", "KELAS", "DOSEN", "RUANGAN", "AKSI"],
        [
          ["Senin", "08.00–09.40", "Pemrograman Web", "TRPL 3A", "Dina Rahmawati", "Lab Komputer 2"],
          ["Selasa", "10.00–11.40", "Kecerdasan Buatan", "TRPL 5A", "Andi Saputra", "Ruang 304"],
          ["Rabu", "13.00–14.40", "Basis Data Lanjut", "TRPL 3B", "Rina Oktaviani", "Lab Basis Data"]
        ].map(r => `
          <tr>
            ${r.map(v => `<td>${v}</td>`).join("")}
            <td><button class="action-btn" data-action="edit-schedule">Edit</button></td>
          </tr>
        `)
      )}
    </section>
  `;
}

function pengaturanPage() {
  return `
    ${pageHeading(
      "Pengaturan & Laporan Sistem",
      "Kelola pengumuman umum, laporan aktivitas, konfigurasi, dan keamanan sistem."
    )}

    <div class="detail-grid">
      <article class="info-card">
        <h3>Pengaturan Sistem</h3>
        <div class="info-row"><span>Nama Sistem</span><strong>LMS Kampus</strong></div>
        <div class="info-row"><span>Tahun Akademik</span><strong>2026/2027</strong></div>
        <div class="info-row"><span>Semester Aktif</span><strong>Ganjil</strong></div>
        <div class="info-row"><span>Status Sistem</span>${status("Berjalan normal", "success")}</div>
        <button class="btn btn-outline btn-small section-gap" data-action="system-settings">
          ${icon("settings")} Konfigurasi Sistem
        </button>
      </article>

      <article class="info-card">
        <h3>Laporan Aktivitas</h3>
        <div class="info-row"><span>Login hari ini</span><strong>248 aktivitas</strong></div>
        <div class="info-row"><span>Materi diakses</span><strong>512 aktivitas</strong></div>
        <div class="info-row"><span>Pengumpulan tugas</span><strong>96 aktivitas</strong></div>
        <div class="info-row"><span>Presensi tercatat</span><strong>384 aktivitas</strong></div>
        <button class="btn btn-outline btn-small section-gap" data-action="export-report">
          ${icon("download")} Unduh Laporan
        </button>
      </article>

      <article class="info-card">
        <h3>Keamanan</h3>
        <div class="info-row"><span>Validasi akun</span>${status("Aktif", "success")}</div>
        <div class="info-row"><span>Hak akses role</span>${status("Diterapkan", "success")}</div>
        <div class="info-row"><span>Pembaruan sistem</span><strong>Terbaru</strong></div>
      </article>

      <article class="info-card">
        <h3>Pengumuman Umum</h3>
        <p class="muted">Buat informasi yang dapat dilihat oleh pengguna sesuai hak akses.</p>
        <button class="btn btn-primary btn-small" data-action="add-announcement">
          ${icon("megaphone")} Buat Pengumuman
        </button>
      </article>
    </div>
  `;
}

function renderPage(page) {
  const allowed = navByRole[currentUser.role].map(x => x[1]);

  if (page === "jadwal" && currentUser.role !== "Admin") {
    page = "dashboard";
  }

  if (!allowed.includes(page)) page = "dashboard";

  currentPage = page;

  const titles = {
    dashboard: "Dashboard",
    perkuliahan: "Perkuliahan",
    aktivitas: "Aktivitas Akademik",
    presensi: "Presensi",
    nilai: currentUser.role === "Dosen" ? "Penilaian" : "Nilai",
    pengumuman: "Pengumuman",
    profil: "Profil",
    pengguna: "Pengguna & Hak Akses",
    akademik: "Data Akademik",
    jadwal: "Jadwal",
    pengaturan: "Pengaturan & Laporan"
  };

  const renderers = {
    dashboard: dashboardPage,
    perkuliahan: perkuliahanPage,
    aktivitas: aktivitasPage,
    presensi: presensiPage,
    nilai: nilaiPage,
    pengumuman: pengumumanPage,
    profil: profilPage,
    pengguna: penggunaPage,
    akademik: akademikPage,
    jadwal: jadwalPage,
    pengaturan: pengaturanPage
  };

  $("#breadcrumbCurrent").textContent = titles[page] || "Dashboard";
  $("#pageContent").innerHTML = (renderers[page] || dashboardPage)();

  renderNav();
  refreshIcons();

  $("#courseSearch")?.addEventListener("input", e => {
    searchTerm = e.target.value.toLowerCase();
    renderPage("perkuliahan");

    const el = $("#courseSearch");
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
  });
}

function handleAction(action, name) {
  if (action === "close-info") {
    closeModal();
    return;
  }

  const messages = {
    "open-course": `Halaman perkuliahan ${name} siap dibuka.`,
    "view-material": `Detail materi: ${name}.`,
    "export-data": "Fitur unduh rekap akan dihubungkan ke backend.",
    "attendance-detail": `Detail presensi untuk ${name}.`,
    "feedback": "Feedback dosen: Pertahankan hasil belajar dan tingkatkan latihan.",
    "submit-activity": "Halaman pengumpulan tugas siap digunakan.",
    "grade-activity": `Pemeriksaan pengumpulan untuk ${name}.`,
    "import-excel": "Pilih file Excel untuk simulasi impor data.",
    "export-report": "Laporan aktivitas siap diintegrasikan.",
    "system-settings": "Pengaturan konfigurasi sistem."
  };

  const formActions = [
    "add-material",
    "add-course",
    "add-activity",
    "add-user",
    "add-academic",
    "add-schedule",
    "add-announcement",
    "input-grade",
    "take-attendance",
    "edit-profile"
  ];

  if (formActions.includes(action)) {
    openForm(action);
    return;
  }

  if (action === "edit-user" || action === "edit-academic" || action === "edit-schedule") {
    showModal(
      "Kelola Data",
      `<p class="modal-body-copy">Form pengelolaan data ${name || "terpilih"} dapat dihubungkan ke database.</p>`
    );
    return;
  }

  if (action === "change-password") {
    showModal(
      "Ubah Kata Sandi",
      `
        <div class="form-field">
          <label>Kata sandi baru</label>
          <input type="password" placeholder="Masukkan kata sandi baru">
        </div>
        <div class="form-field section-gap">
          <label>Konfirmasi kata sandi</label>
          <input type="password" placeholder="Ulangi kata sandi">
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary btn-small" data-action="save-demo">
            Simpan
          </button>
        </div>
      `
    );
    return;
  }

  if (action === "save-demo") {
    closeModal();
    toast("Aksi berhasil disimulasikan.");
    return;
  }

  showModal(
    "Informasi",
    `
      <p class="modal-body-copy">
        ${messages[action] || "Aksi ini merupakan bagian dari prototype UI LMS Kampus."}
      </p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-small" data-action="close-info">
          Mengerti
        </button>
      </div>
    `
  );
}

function openForm(action) {
  const config = {
    "add-material": ["Unggah Materi", ["Nama Materi", "Mata Kuliah", "Tipe Materi", "Tautan / Nama File"]],
    "add-course": ["Tambah Mata Kuliah", ["Kode Mata Kuliah", "Nama Mata Kuliah", "Dosen Pengampu", "Jumlah SKS"]],
    "add-activity": ["Buat Aktivitas Akademik", ["Nama Aktivitas", "Mata Kuliah", "Jenis Aktivitas", "Batas Pengumpulan"]],
    "add-user": ["Tambah Pengguna", ["Nama Lengkap", "Email", "Role", "Program Studi"]],
    "add-academic": ["Tambah Data Akademik", ["Kode", "Nama Mata Kuliah", "Program Studi", "SKS"]],
    "add-schedule": ["Tambah Jadwal", ["Mata Kuliah", "Hari", "Jam", "Ruangan"]],
    "add-announcement": ["Buat Pengumuman", ["Judul Pengumuman", "Ditujukan Kepada", "Isi Pengumuman"]],
    "input-grade": ["Input Nilai", ["Nama Mahasiswa", "Mata Kuliah", "Nilai Tugas", "Nilai Kuis"]],
    "take-attendance": ["Catat Presensi", ["Mata Kuliah", "Tanggal", "Kelas", "Keterangan"]],
    "edit-profile": ["Edit Profil", ["Nama Lengkap", "Email", "Program Studi", "Nomor Induk"]]
  };

  const [title, fields] = config[action];

  const body = `
    <form id="demoForm">
      <div class="form-grid">
        ${fields.map((f, i) => `
          <div class="form-field ${fields.length === 3 && i === 2 ? "full" : ""}">
            <label>${f}</label>
            ${
              f.toLowerCase().includes("isi pengumuman")
                ? '<textarea required placeholder="Tulis informasi..."></textarea>'
                : f.toLowerCase().includes("role")
                  ? '<select><option>Mahasiswa</option><option>Dosen</option><option>Admin</option></select>'
                  : `<input required placeholder="Masukkan ${f.toLowerCase()}">`
            }
          </div>
        `).join("")}
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-outline btn-small" data-action="close-info">
          Batal
        </button>
        <button class="btn btn-primary btn-small" type="submit">
          Simpan
        </button>
      </div>
    </form>
  `;

  showModal(title, body);

  $("#demoForm").addEventListener("submit", e => {
    e.preventDefault();
    closeModal();
    toast("Data berhasil disimpan (simulasi).");
  });
}

function showModal(title, body) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = body;
  $("#modalBackdrop").classList.add("open");
  refreshIcons();
}

function closeModal() {
  $("#modalBackdrop").classList.remove("open");
}

function toast(message) {
  $("#toastText").textContent = message;
  $("#toast").classList.add("show");

  setTimeout(() => {
    $("#toast").classList.remove("show");
  }, 2600);
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

document.addEventListener("DOMContentLoaded", init);
