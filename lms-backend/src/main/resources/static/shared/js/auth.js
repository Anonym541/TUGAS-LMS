
document.getElementById('loginForm').addEventListener('submit',e=>{
 e.preventDefault();
 const role=document.getElementById('role').value;
 const identity=document.getElementById('identity').value.trim();
 if(!identity){alert('Masukkan identitas akun.');return;}
 localStorage.setItem('lms_role',role);
 localStorage.setItem('lms_user',identity);
 const target=role==='admin'?'admin/html/a-dashboard.html':role==='dosen'?'dosen/html/a-dashboard.html':'mahasiswa/html/a-dashboard.html';
 location.href=target;
});
