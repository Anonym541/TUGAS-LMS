
const ROLE_CONFIG = {
 admin:{label:"Administrator",icon:"▦",pages:[
  ["Dashboard","a-dashboard.html","▦"],["Manajemen Akun","b-manajemen-akun.html","♙"],["Manajemen Kelas","c-manajemen-kelas.html","▤"],["Monitoring Perkuliahan","d-monitoring-perkuliahan.html","◉"],["Laporan","e-laporan.html","▥"],["Pengaturan","f-pengaturan.html","⚙"],["Riwayat Aktivitas","g-riwayat-aktivitas.html","◷"]]},
 dosen:{label:"Dosen",icon:"▣",pages:[
  ["Dashboard","a-dashboard.html","▦"],["Jadwal","b-jadwal.html","▦"],["Mengajar","c-mengajar.html","▤"],["Pengaturan","d-pengaturan.html","⚙"],["Arsip Kelas","e-arsip-kelas.html","◷"]]},
 mahasiswa:{label:"Mahasiswa",icon:"♙",pages:[
  ["Dashboard","a-dashboard.html","▦"],["Jadwal","b-jadwal.html","▦"],["Tugas","c-tugas.html","✓"],["Pengaturan","d-pengaturan.html","⚙"],["Arsip Kelas","e-arsip-kelas.html","◷"]]}
};
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function getRole(){return document.body.dataset.role}
function getPage(){return document.body.dataset.page}
function getStore(k, fallback){try{return JSON.parse(localStorage.getItem("lms_"+k))??fallback}catch{return fallback}}
function setStore(k,v){localStorage.setItem("lms_"+k,JSON.stringify(v))}
function toast(msg){let t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.append(t);setTimeout(()=>t.remove(),2400)}
function goLogin(){localStorage.removeItem("lms_session");location.href="../../login.html"}
function rootFor(role){return `../../${role}/html/`}
function nav(role,active){return ROLE_CONFIG[role].pages.map(([n,f,i])=>`<a class="nav-link ${f===active?'active':''}" href="${rootFor(role)+f}"><span class="nav-icon">${i}</span>${n}</a>`).join("")}
function shell(content){
 const role=getRole(), cfg=ROLE_CONFIG[role], title=document.body.dataset.title||"Dashboard", session=getStore("session",{name:cfg.label});
 $("#app").innerHTML=`<div class="app"><aside class="sidebar" id="sidebar"><div class="brand"><div class="brand-mark">C</div><div>LMS POLTEK CWE<small>LEARNING MANAGEMENT SYSTEM</small></div></div><div class="nav-label">MENU UTAMA</div>${nav(role,location.pathname.split("/").pop())}<div class="sidebar-bottom"><a class="nav-link" href="#" id="logout"><span class="nav-icon">↪</span>Keluar</a></div></aside><main class="main"><header class="topbar"><div style="display:flex;align-items:center"><button class="mobile-toggle" id="toggle">☰</button><div><div class="crumb">LMS / ${cfg.label}</div><div class="top-title">${title}</div></div></div><div class="top-actions"><div class="user-mini"><div class="avatar">${esc((session.name||cfg.label).slice(0,1).toUpperCase())}</div><div><strong>${esc(session.name||cfg.label)}</strong><small>${cfg.label}</small></div></div></div></header><section class="content">${content}</section></main></div>`;
 $("#logout").onclick=e=>{e.preventDefault();goLogin()};
 $("#toggle").onclick=()=>$("#sidebar").classList.toggle("open");
}
function pageHead(title,desc,button=""){return `<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div>${button}</div>`}
function stat(label,value,icon,note){return `<div class="card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`}
function activity(title,desc){return `<div class="activity"><span class="dot"></span><div><strong>${title}</strong><p>${desc}</p></div></div>`}
const defaultAccounts=[
 {name:"Andi Pratama",id:"D-001",role:"Dosen",email:"andi@poltekkecwe.ac.id",status:"Aktif"},
 {name:"Siti Rahma",id:"D-002",role:"Dosen",email:"siti@poltekkecwe.ac.id",status:"Aktif"},
 {name:"Budi Santoso",id:"M-001",role:"Mahasiswa",email:"budi@student.poltekkecwe.ac.id",status:"Aktif"},
 {name:"Nadia Putri",id:"M-002",role:"Mahasiswa",email:"nadia@student.poltekkecwe.ac.id",status:"Aktif"}
];
const defaultClasses=[
 {name:"Pemrograman Web",code:"IF203",lecturer:"Andi Pratama",members:32,status:"Aktif"},
 {name:"Basis Data",code:"IF204",lecturer:"Siti Rahma",members:28,status:"Aktif"},
 {name:"Jaringan Komputer",code:"IF205",lecturer:"Andi Pratama",members:30,status:"Aktif"}
];
function accounts(){return getStore("accounts",defaultAccounts)}
function classes(){return getStore("classes",defaultClasses)}
function dashboard(role){
 let stats=role==="admin"?[["Total Dosen", "12","♙","Akun dosen terdaftar"],["Total Mahasiswa","248","♧","Akun mahasiswa terdaftar"],["Kelas Aktif", "18","▤","Kelas semester ini"],["Aktivitas Hari Ini","36","◷","Aktivitas tercatat"]]:
 role==="dosen"?[["Kelas Saya","4","▤","Kelas yang dikelola"],["Mahasiswa","120","♙","Total mahasiswa"],["Tugas Aktif","8","✓","Tugas berjalan"],["Perlu Diperiksa","14","◷","Pengumpulan menunggu review"]]:
 [["Kelas Diikuti","5","▤","Mata kuliah semester ini"],["Tugas Belum Selesai","3","✓","Perlu segera dikerjakan"],["Sudah Dikumpulkan","12","↥","Tugas terkirim"],["Nilai Terbaru","A-","★","Hasil penilaian terakhir"]];
 return pageHead("Selamat datang di LMS",`Berikut ringkasan aktivitas ${ROLE_CONFIG[role].label.toLowerCase()} Anda.`)+`<div class="grid stats">${stats.map(x=>stat(...x)).join("")}</div><div class="grid two-col"><div class="card"><div class="section-title"><h2>Aktivitas Terbaru</h2><span>Contoh data</span></div>${activity("Materi baru ditambahkan","Pemrograman Web · 10 menit lalu")}${activity("Tugas telah diperbarui","Basis Data · 1 jam lalu")}${activity("Jadwal perkuliahan diperbarui","Jaringan Komputer · Kemarin")}</div><div class="card"><div class="section-title"><h2>Informasi Akademik</h2><span>Semester berjalan</span></div><h3 style="margin:8px 0">Semester Ganjil 2026/2027</h3><p style="color:var(--muted);line-height:1.7;font-size:12px">Gunakan LMS untuk mengakses kelas, materi, jadwal, tugas, dan informasi akademik secara terpusat.</p><div class="notice" style="margin:15px 0 0">Pastikan profil dan informasi akun selalu diperbarui.</div></div></div>`;
}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${headers.length}" class="empty">Belum ada data.</td></tr>`}</tbody></table></div>`}
function adminAccounts(){let data=accounts();return pageHead("Manajemen Akun","Kelola akun dosen dan mahasiswa.",'<button class="btn" id="add-account">+ Tambah Akun</button>')+`<div class="toolbar"><input class="field" id="search" placeholder="Cari nama, ID, atau email..."><select class="field" id="role-filter"><option value="">Semua peran</option><option>Dosen</option><option>Mahasiswa</option></select></div><div id="account-table">${accountTable(data)}</div><div class="card" id="account-form" style="display:none;margin-top:18px"><div class="section-title"><h2>Form Akun</h2><span>Data demo tersimpan di browser</span></div><form id="account-add"><div class="form-grid"><div class="form-group"><label>Nama lengkap</label><input name="name" required></div><div class="form-group"><label>ID pengguna</label><input name="id" required></div><div class="form-group"><label>Email</label><input name="email" type="email" required></div><div class="form-group"><label>Peran</label><select name="role"><option>Dosen</option><option>Mahasiswa</option></select></div></div><div class="form-actions"><button class="btn">Simpan Akun</button><button class="btn secondary" type="button" id="cancel-account">Batal</button></div></form></div>`}
function accountTable(data){return table(["Nama","ID","Peran","Email","Status","Aksi"],data.map((a,i)=>[esc(a.name),esc(a.id),esc(a.role),esc(a.email),`<span class="status">${esc(a.status)}</span>`,`<button class="btn secondary delete-account" data-index="${i}">Hapus</button>`]))}
function classTable(data){return table(["Nama Kelas","Kode","Dosen Pengampu","Mahasiswa","Status"],data.map(c=>[esc(c.name),esc(c.code),esc(c.lecturer),c.members,`<span class="status">${esc(c.status)}</span>`]))}
function classPage(){return pageHead("Manajemen Kelas","Daftar kelas yang terdaftar di LMS.",'<button class="btn" id="add-class">+ Tambah Kelas</button>')+`<div class="toolbar"><input class="field" id="class-search" placeholder="Cari kelas atau kode..."></div><div id="class-table">${classTable(classes())}</div><div class="card" id="class-form" style="display:none;margin-top:18px"><h2 style="font-size:15px">Tambah Kelas</h2><form id="class-add"><div class="form-grid"><div class="form-group"><label>Nama kelas</label><input name="name" required></div><div class="form-group"><label>Kode kelas</label><input name="code" required></div><div class="form-group"><label>Dosen pengampu</label><input name="lecturer" required></div><div class="form-group"><label>Jumlah mahasiswa</label><input name="members" type="number" min="0" value="0"></div></div><div class="form-actions"><button class="btn">Simpan Kelas</button><button class="btn secondary" type="button" id="cancel-class">Batal</button></div></form></div>`}
function monitoring(){return pageHead("Monitoring Perkuliahan","Pantau aktivitas pembelajaran pada sistem.")+`<div class="grid stats">${stat("Materi Terunggah","86","▤","Seluruh kelas")}${stat("Tugas Dibuat","42","✓","Semester berjalan")}${stat("Tugas Dikumpulkan","318","↥","Dari seluruh mahasiswa")}${stat("Menunggu Pemeriksaan","27","◷","Perlu ditindaklanjuti")}</div><div class="card"><div class="section-title"><h2>Ringkasan Monitoring</h2><span>Contoh data</span></div>${activity("Aktivitas dosen","Dosen memperbarui materi Pemrograman Web")}${activity("Aktivitas mahasiswa","Mahasiswa mengumpulkan tugas Basis Data")}${activity("Pemeriksaan tugas","Beberapa pengumpulan menunggu penilaian")}</div>`}
function reports(){return pageHead("Laporan","Ringkasan laporan akademik dan aktivitas.")+`<div class="grid stats">${stat("Jumlah Kelas","18","▤","Semester berjalan")}${stat("Dosen Aktif","12","♙","Terdaftar")}${stat("Mahasiswa Aktif","248","♧","Terdaftar")}${stat("Pengumpulan Tugas","318","↥","Tercatat")}</div><div class="card"><div class="section-title"><h2>Rekapitulasi</h2><button class="btn secondary" id="export-csv">Unduh CSV</button></div><div id="report-table">${table(["Kategori","Jumlah"],[["Dosen",12],["Mahasiswa",248],["Kelas Aktif",18],["Pengumpulan Tugas",318]])}</div></div>`}
function schedule(){let days=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];return pageHead("Jadwal Perkuliahan","Agenda perkuliahan dan pengingat jadwal.")+`<div class="card"><div class="section-title"><h2>November 2026</h2><span>Kalender akademik</span></div><div class="calendar">${days.map(d=>`<div class="day">${d}</div>`).join("")}${Array.from({length:35},(_,i)=>`<div class="${i===19?'today':''}">${i<30?i+1:"" }${[4,11,18,25].includes(i+1)?'<p style="color:var(--blue);font-size:9px">Kuliah</p>':""}</div>`).join("")}</div></div><div class="card" style="margin-top:18px"><div class="section-title"><h2>Agenda Mendatang</h2></div>${activity("Pemrograman Web · 08.00–09.40","Ruang 201 · Dosen Andi Pratama")}${activity("Basis Data · 10.00–11.40","Ruang 203 · Dosen Siti Rahma")}</div>`}
function teaching(role){let isTeacher=role==="dosen";return pageHead(isTeacher?"Kegiatan Mengajar":"Daftar Tugas","Kelola aktivitas pembelajaran dalam kelas.")+`<div class="tabs"><button class="tab active" data-tab="materi">${isTeacher?"Materi":"Tugas"}</button><button class="tab" data-tab="tugas">${isTeacher?"Tugas":"Sudah Dikumpulkan"}</button><button class="tab" data-tab="anggota">${isTeacher?"Mahasiswa":"Kelas"}</button><button class="tab" data-tab="nilai">Nilai</button></div><div id="tab-content" class="card">${isTeacher?`<div class="section-title"><h2>Materi Perkuliahan</h2><button class="btn" id="add-item">+ Tambah Materi</button></div><div id="items">${activity("Pengantar Pemrograman Web","PDF · Diunggah 12 November 2026")}${activity("HTML dan CSS Dasar","PDF · Diunggah 14 November 2026")}</div>`:`<div class="section-title"><h2>Tugas Saya</h2><span>Daftar tugas dari dosen</span></div>${activity("Tugas 1 - HTML Dasar","Pemrograman Web · Deadline 25 November 2026")}${activity("Normalisasi Database","Basis Data · Deadline 28 November 2026")}`}</div>`}
function archive(){return pageHead("Arsip Kelas","Riwayat kelas, materi, tugas, dan nilai.")+`<div class="grid two-col"><div class="card"><div class="section-title"><h2>Kelas Selesai</h2><span>Arsip akademik</span></div>${activity("Algoritma dan Pemrograman","Semester Genap 2025/2026")}${activity("Pengantar Teknologi Informasi","Semester Genap 2025/2026")}</div><div class="card"><div class="section-title"><h2>Informasi Arsip</h2></div><p style="color:var(--muted);line-height:1.7">Materi, tugas, dan nilai dari kelas yang telah selesai tetap dapat dilihat sesuai hak akses pengguna.</p></div></div>`}
function settings(){let s=getStore("session",{name:"Pengguna",email:""});return pageHead("Pengaturan Akun","Kelola informasi profil dan preferensi akun.")+`<div class="card"><div class="section-title"><h2>Profil Pengguna</h2></div><form id="profile-form"><div class="form-grid"><div class="form-group"><label>Nama lengkap</label><input name="name" value="${esc(s.name||"")}" required></div><div class="form-group"><label>Email</label><input name="email" type="email" value="${esc(s.email||"")}" placeholder="nama@email.com"></div><div class="form-group"><label>Notifikasi</label><select name="notifications"><option>Aktif</option><option>Nonaktif</option></select></div><div class="form-group"><label>Password baru (demo)</label><input type="password" placeholder="Tidak terhubung ke server"></div></div><div class="form-actions"><button class="btn">Simpan Perubahan</button></div></form></div>`}
function historyPage(){return pageHead("Riwayat Aktivitas","Catatan aktivitas dan perubahan pada sistem.")+`<div class="card">${activity("Admin masuk ke sistem","Hari ini · 09.10")}${activity("Data kelas diperbarui","Hari ini · 08.45")}${activity("Akun mahasiswa ditambahkan","Kemarin · 14.20")}</div>`}
function render(){
 let role=getRole(),page=getPage(),content="";
 if(page==="dashboard")content=dashboard(role);
 else if(page==="akun")content=adminAccounts();
 else if(page==="kelas")content=classPage();
 else if(page==="monitoring")content=monitoring();
 else if(page==="laporan")content=reports();
 else if(page==="jadwal")content=schedule();
 else if(page==="mengajar"||page==="tugas")content=teaching(role);
 else if(page==="arsip")content=archive();
 else if(page==="pengaturan")content=settings();
 else if(page==="riwayat")content=historyPage();
 else content=dashboard(role);
 shell(content); bindPage();
}
function bindPage(){
 const role=getRole();
 if($("#add-account"))$("#add-account").onclick=()=>$("#account-form").style.display="block";
 if($("#cancel-account"))$("#cancel-account").onclick=()=>$("#account-form").style.display="none";
 if($("#account-add"))$("#account-add").onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target));let a=accounts();a.push({...d,status:"Aktif"});setStore("accounts",a);$("#account-table").innerHTML=accountTable(a);$("#account-form").style.display="none";e.target.reset();bindDelete();toast("Akun berhasil ditambahkan (demo).")};
 bindDelete();
 function bindDelete(){document.querySelectorAll(".delete-account").forEach(b=>b.onclick=()=>{let a=accounts();a.splice(+b.dataset.index,1);setStore("accounts",a);$("#account-table").innerHTML=accountTable(a);bindDelete();toast("Akun dihapus (demo).")})}
 if($("#search"))$("#search").oninput=filterAccounts;
 if($("#role-filter"))$("#role-filter").onchange=filterAccounts;
 function filterAccounts(){let q=($("#search").value||"").toLowerCase(),r=$("#role-filter").value;let a=accounts().filter(x=>(x.name+x.id+x.email).toLowerCase().includes(q)&&(!r||x.role===r));$("#account-table").innerHTML=accountTable(a);bindDelete()}
 if($("#add-class"))$("#add-class").onclick=()=>$("#class-form").style.display="block";
 if($("#cancel-class"))$("#cancel-class").onclick=()=>$("#class-form").style.display="none";
 if($("#class-add"))$("#class-add").onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target));d.members=Number(d.members);d.status="Aktif";let a=classes();a.push(d);setStore("classes",a);$("#class-table").innerHTML=classTable(a);$("#class-form").style.display="none";e.target.reset();toast("Kelas berhasil ditambahkan (demo).")};
 if($("#class-search"))$("#class-search").oninput=e=>{$("#class-table").innerHTML=classTable(classes().filter(c=>(c.name+c.code+c.lecturer).toLowerCase().includes(e.target.value.toLowerCase())))};
 document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");let name=b.dataset.tab;let box=$("#tab-content");box.innerHTML=`<div class="section-title"><h2>${b.textContent}</h2><span>Informasi kelas</span></div>${activity(name==="nilai"?"Nilai pembelajaran":name==="anggota"?"Daftar anggota kelas":name==="tugas"?"Daftar tugas":"Materi perkuliahan","Contoh konten. Data asli memerlukan integrasi backend.")}`});
 if($("#add-item"))$("#add-item").onclick=()=>{let n=prompt("Masukkan nama materi:");if(n){$("#items").insertAdjacentHTML("beforeend",activity(esc(n),"Materi baru · Demo lokal"));toast("Materi ditambahkan pada tampilan demo.")}};
 if($("#profile-form"))$("#profile-form").onsubmit=e=>{e.preventDefault();let s=getStore("session",{});let d=Object.fromEntries(new FormData(e.target));s.name=d.name;s.email=d.email;setStore("session",s);toast("Profil demo disimpan.")};
 if($("#export-csv"))$("#export-csv").onclick=()=>{let csv="Kategori,Jumlah\\nDosen,12\\nMahasiswa,248\\nKelas Aktif,18\\nPengumpulan Tugas,318";let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="laporan-lms.csv";a.click();URL.revokeObjectURL(a.href)};
}
document.addEventListener("DOMContentLoaded",()=>{
 const role=getRole();
 const session=getStore("session",null);
 if(!session||session.role!==role){location.href="../../login.html";return}
 render();
});
