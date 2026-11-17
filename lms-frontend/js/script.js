
document.addEventListener("DOMContentLoaded", function () {

    // PROSES LOGIN
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;
            const error = document.getElementById("loginError");

            if (!username || !password || !role) {
                error.textContent = "Semua kolom wajib diisi.";
                return;
            }

            // Simpan data pengguna
            localStorage.setItem("username", username);
            localStorage.setItem("role", role);

            // Masuk ke dashboard
            window.location.href = "dashboard.html";
        });
    }

    // PROSES DASHBOARD
    const userName = localStorage.getItem("username");
    const userRole = localStorage.getItem("role");

    if (document.body.classList.contains("dashboard-page")) {

        // Periksa sesi login
        if (!userName || !userRole) {
            window.location.href = "index.html";
            return;
        }

        // Tampilkan informasi pengguna
        document.getElementById("userName").textContent = userName;
        document.getElementById("userRole").textContent = userRole;
        document.getElementById("welcomeText").textContent =
            "Halo, " + userName + "!";

        document.getElementById("profileInitial").textContent =
            userName.charAt(0).toUpperCase();

        // Tanggal otomatis
        document.getElementById("currentDate").textContent =
            new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

        // Atur menu berdasarkan role
        const menus = document.querySelectorAll(".menu a[data-roles]");

        menus.forEach(function (menu) {
            const allowedRoles = menu.dataset.roles.split(",");

            if (!allowedRoles.includes(userRole)) {
                menu.style.display = "none";
            }
        });

        // Menu mobile
        const menuToggle = document.getElementById("menuToggle");

        if (menuToggle) {
            menuToggle.addEventListener("click", function () {
                document.querySelector(".sidebar")
                    .classList.toggle("show-sidebar");
            });
        }
    }
});

// LOGOUT
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "index.html";
}
