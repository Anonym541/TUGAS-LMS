const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080'
  : 'https://special-fiesta-7v5grpjv7rpx3pp54-8080.app.github.dev'; // contoh: https://special-fi...-8080.app.github.dev (tanpa / di akhir)

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const role = document.getElementById('role').value;
  const identity = document.getElementById('identity').value.trim();
  const password = document.getElementById('password').value;
  const statusNote = document.getElementById('loginStatusNote');

  if (!identity || !password) {
    alert('Masukkan identitas akun dan password.');
    return;
  }

  if (statusNote) {
    statusNote.style.borderColor = '';
    statusNote.innerHTML = '<b>Memverifikasi akun...</b><br>Mohon tunggu sebentar.';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrNimNidn: identity,
        password: password,
        role: role
      })
    });

    const data = await res.json();

    if (res.ok) {
      const activeRole = (data.role || role).toLowerCase();
      localStorage.setItem('lms_role', activeRole);
      localStorage.setItem('lms_user', data.namaLengkap || identity);
      localStorage.setItem('user', JSON.stringify({ ...data, role: activeRole }));

      const target = activeRole === 'admin'
        ? 'admin/html/a-dashboard.html'
        : activeRole === 'dosen'
          ? 'dosen/html/a-dashboard.html'
          : 'mahasiswa/html/a-dashboard.html';

      location.href = target;
    } else {
      if (statusNote) {
        statusNote.style.borderColor = '#e11d48';
        statusNote.innerHTML = `<b style="color:#e11d48;">Login Gagal</b><br>${data.message || 'NIM/Email atau password salah.'}`;
      } else {
        alert(data.message || 'NIM/Email atau password salah.');
      }
    }
  } catch (err) {
    console.error('Login Error:', err);
    if (statusNote) {
      statusNote.innerHTML = '<b>Koneksi Gagal</b><br>Tidak dapat terhubung ke server backend.';
    } else {
      alert('Koneksi gagal ke server backend.');
    }
  }
});