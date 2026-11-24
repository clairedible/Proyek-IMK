/* ==========================================================
   SCRIPT.JS - Request Desain · InfoKom HMDTIF
   (membutuhkan data.js, jadi dimuat setelahnya)

   Isi file ini:
   1. Variabel
   2. Fungsi bantu kecil
   3. Login & pilih peran
   4. Pindah halaman (view) & menu
   5. Menampilkan data tiap halaman (render)
   6. Aksi Pengaju
   7. Aksi Humas
   8. Aksi MedKraf
   9. Notifikasi, profil, modal
   ========================================================== */


/* ==========================================================
   1. VARIABEL
   ========================================================== */
let peranAktif = null;        // "pengaju" / "humas" / "medkraf" (null = belum login)
let peranLogin = null;        // peran yang dipilih di halaman login
let viewAktif = null;         // halaman yang sedang tampil, mis. "ajukan"
let idDipilih = null;         // id request yang sedang dilihat
let tipeDipilih = "Reels";    // pilihan tipe konten di form
let versiDipilih = "1";       // pilihan versi draf
let filterHumas = "Semua";    // filter status di halaman Humas
let timerToast = null;


/* ==========================================================
   2. FUNGSI BANTU KECIL
   ========================================================== */

// Singkatan document.getElementById
function $(id) {
  return document.getElementById(id);
}

// Cari request berdasarkan id
function cariRequest(id) {
  return daftarRequest.find(function (r) { return r.id === id; });
}

// Cegah tag HTML dari input pengguna ikut dijalankan
function aman(teks) {
  return String(teks).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// "2026-11-14" -> "14 Nov"
function formatPendek(iso) {
  const t = new Date(iso + "T00:00:00");
  return t.getDate() + " " + NAMA_BULAN[t.getMonth()];
}

// "2026-11-14" -> "14 November 2026"
function formatPanjang(iso) {
  const t = new Date(iso + "T00:00:00");
  return t.getDate() + " " + NAMA_BULAN_PANJANG[t.getMonth()] + " " + t.getFullYear();
}

// Waktu sekarang, mis. "24 Nov, 15.29"
function waktuSekarang() {
  const t = new Date();
  const jam = String(t.getHours()).padStart(2, "0");
  const menit = String(t.getMinutes()).padStart(2, "0");
  return t.getDate() + " " + NAMA_BULAN[t.getMonth()] + ", " + jam + "." + menit;
}

// HTML ikon SVG (ikon didefinisikan di index.html)
function ikonSvg(nama) {
  return '<svg class="ic"><use href="#' + nama + '"/></svg>';
}

// HTML badge status
function buatBadge(status) {
  const s = STATUS[status];
  return '<span class="badge ' + s.warna + '"><i class="ik ' + s.ikon + '"></i>' + status + "</span>";
}

// Gambar hasil desain sesuai judul (aset Figma)
function gambarPoster(judul) {
  const t = (judul || "").toLowerCase();
  if (t.includes("rekrut") || t.includes("magang")) return "1082f.png";
  if (t.includes("workshop")) return "preview-workshop.svg";
  if (t.includes("seminar")) return "preview-seminar.svg";
  if (t.includes("donasi")) return "preview-donasi.svg";
  if (t.includes("festival")) return "preview-festival.svg";
  return "preview-generic.svg";
}

function buatPoster(judul) {
  const src = gambarPoster(judul);
  return (
    '<div class="poster">' +
      '<img class="poster-gambar" src="assets/' + src + '" alt="Hasil desain: ' + aman(judul) + '">' +
    "</div>"
  );
}

// HTML satu baris detail (label + isi)
function buatBaris(label, isi) {
  return '<div class="kv"><span class="k">' + label + '</span><span class="v">' + aman(isi) + "</span></div>";
}

// HTML seluruh detail sebuah request
function buatDetail(r) {
  return (
    buatBaris("Judul", r.judul) +
    buatBaris("Pengaju", r.pengaju + " · Dept. " + r.dept) +
    buatBaris("Tipe Konten", r.tipe) +
    buatBaris("Tanggal Unggah", formatPanjang(r.tanggal)) +
    buatBaris("Deskripsi", r.deskripsi) +
    buatBaris("Caption", r.caption || "-") +
    buatBaris("PIC MedKraf", r.pic || "Belum Ditugaskan")
  );
}

// HTML tabel daftar request (baris bisa diklik untuk memilih)
function buatTabel(daftar) {
  if (daftar.length === 0) {
    return '<div class="tabel-wrap"><table><tbody><tr><td class="kosong">Belum ada data.</td></tr></tbody></table></div>';
  }

  let baris = "";
  daftar.forEach(function (r) {
    baris +=
      '<tr data-id="' + r.id + '"' + (r.id === idDipilih ? ' class="terpilih"' : "") + ">" +
        "<td>" + aman(r.judul) + "</td>" +
        "<td>" + r.pengaju + "<br>(" + r.dept + ")</td>" +
        "<td>" + r.tipe + "</td>" +
        "<td>" + formatPendek(r.tanggal) + "</td>" +
        "<td>" + (r.pic || "-") + "</td>" +
        "<td>" + buatBadge(r.status) + "</td>" +
      "</tr>";
  });

  return (
    '<div class="tabel-wrap"><table class="tabel-6">' +
      "<thead><tr><th>Judul</th><th>Pengaju</th><th>Tipe</th><th>Unggah</th><th>PIC MedKraf</th><th>Status</th></tr></thead>" +
      "<tbody>" + baris + "</tbody>" +
    "</table></div>"
  );
}

// Request milik peran yang sedang login
function requestSaya() {
  if (peranAktif === "pengaju") {
    return daftarRequest.filter(function (r) { return r.pengaju === PERAN.pengaju.nama; });
  }
  if (peranAktif === "medkraf") {
    return daftarRequest.filter(function (r) { return r.pic === PERAN.medkraf.nama; });
  }
  return daftarRequest; // Humas melihat semua
}

// Pastikan idDipilih ada di dalam daftar. Kalau tidak, pilih yang pertama.
function pastikanPilihan(daftar) {
  const ada = daftar.some(function (r) { return r.id === idDipilih; });
  if (!ada) idDipilih = daftar.length ? daftar[0].id : null;
  return cariRequest(idDipilih);
}

// Catat kejadian ke riwayat sebuah request (yang terbaru di atas)
function tambahRiwayat(r, teks) {
  r.riwayat.unshift({ teks: teks, waktu: waktuSekarang() });
}

// Kirim notifikasi ke peran tertentu
function kirimNotif(untuk, judul, isi) {
  daftarNotif[untuk].unshift({ judul: judul, isi: isi, waktu: "Baru saja", baru: true });
  perbaruiLencana();
}

// Pesan singkat selama 2,5 detik
function tampilkanToast(pesan) {
  const toast = $("toast");
  toast.textContent = pesan;
  toast.hidden = false;
  clearTimeout(timerToast);
  timerToast = setTimeout(function () { toast.hidden = true; }, 2500);
}


/* ==========================================================
   3. LOGIN & PILIH PERAN
   ========================================================== */

// Klik salah satu kartu peran -> tampilkan form login
document.querySelectorAll("[data-peran]").forEach(function (kartu) {
  kartu.addEventListener("click", function () {
    peranLogin = kartu.dataset.peran;
    $("judul-login").textContent = "Masuk sebagai " + PERAN[peranLogin].label;
    $("login-email").value = "";
    $("login-sandi").value = "";
    $("error-login").hidden = true;
    $("halaman-peran").hidden = true;
    $("halaman-login").hidden = false;
  });
});

$("btn-ganti-peran").addEventListener("click", function () {
  $("halaman-login").hidden = true;
  $("halaman-peran").hidden = false;
});

$("btn-lupa").addEventListener("click", function () {
  tampilkanToast("Fitur lupa kata sandi belum tersedia (demo).");
});

// Tombol Masuk: periksa email & kata sandi (demo: asal terisi)
$("form-login").addEventListener("submit", function (e) {
  e.preventDefault();
  const emailOk = $("login-email").value.includes("@");
  const sandiOk = $("login-sandi").value.trim() !== "";
  if (!emailOk || !sandiOk) {
    $("error-login").hidden = false;
    return;
  }
  masuk(peranLogin);
});

$("btn-google").addEventListener("click", function () {
  masuk(peranLogin);
});

// Masuk ke aplikasi sebagai peran tertentu
function masuk(peran) {
  peranAktif = peran;
  idDipilih = null;
  versiDipilih = "1";

  $("halaman-login").hidden = true;
  $("halaman-peran").hidden = true;
  $("aplikasi").hidden = false;

  $("info-user").textContent = PERAN[peran].chip;
  bangunMenu();
  perbaruiLencana();
  tampilkanView(PERAN[peran].menu[0].id);
}

// Keluar (Ganti Peran) -> kembali ke pilih peran
$("btn-keluar").addEventListener("click", function () {
  peranAktif = null;
  $("aplikasi").hidden = true;
  $("dropdown-notif").hidden = true;
  $("halaman-peran").hidden = false;
  window.scrollTo(0, 0);
});


/* ==========================================================
   4. PINDAH HALAMAN (VIEW) & MENU
   ========================================================== */

// Isi menu sidebar sesuai peran
function bangunMenu() {
  let html = "";
  PERAN[peranAktif].menu.forEach(function (m) {
    html += '<button type="button" class="menu-item" data-menu="' + m.id + '">' + ikonSvg(m.ikon) + "<span>" + m.teks + "</span></button>";
  });
  $("menu").innerHTML = html;
}

// Tampilkan satu view, sembunyikan yang lain
function tampilkanView(id) {
  viewAktif = id;

  document.querySelectorAll(".view").forEach(function (v) { v.hidden = true; });
  $("v-" + id).hidden = false;

  document.querySelectorAll(".menu-item").forEach(function (m) {
    m.classList.toggle("aktif", m.dataset.menu === id);
  });

  renderView();
  window.scrollTo(0, 0);
}

// Klik menu sidebar
$("menu").addEventListener("click", function (e) {
  const tombol = e.target.closest("[data-menu]");
  if (tombol) tampilkanView(tombol.dataset.menu);
});

// Klik nama/avatar di header -> halaman profil
$("btn-profil").addEventListener("click", function () {
  tampilkanView("profil");
});

$("btn-beranda").addEventListener("click", function () {
  tampilkanView(PERAN[peranAktif].menu[0].id);
});

// Klik di mana saja (satu pendengar untuk banyak elemen yang dibuat JavaScript)
document.addEventListener("click", function (e) {
  // Klik baris tabel / kartu -> pilih request itu
  const baris = e.target.closest("[data-id]");
  if (baris) {
    idDipilih = Number(baris.dataset.id);
    versiDipilih = "1";
    renderView();
  }

  // Klik chip filter (Humas)
  const chip = e.target.closest("[data-filter]");
  if (chip) {
    filterHumas = chip.dataset.filter;
    renderView();
  }

  // Klik tombol aksi (Tolak, Terima, dst.)
  const aksi = e.target.closest("[data-aksi]");
  if (aksi) jalankanAksi(aksi.dataset.aksi);

  // Klik di luar dropdown notifikasi -> tutup
  if (!e.target.closest(".bel-wrap")) $("dropdown-notif").hidden = true;
});


/* ==========================================================
   5. MENAMPILKAN DATA TIAP HALAMAN (RENDER)
   ========================================================== */

// Menjalankan render sesuai view yang aktif
function renderView() {
  if (viewAktif === "ajukan") renderAjukan();
  if (viewAktif === "tinjau") renderTinjau();
  if (viewAktif === "status") renderStatus();
  if (viewAktif === "humas") renderHumas();
  if (viewAktif === "tugas") renderTugas();
  if (viewAktif === "profil") renderProfil();
}

// ----- Pengaju 1: Ajukan Permintaan -----
function renderAjukan() {
  const terakhir = requestSaya().slice(-2).reverse();
  let html = "";
  terakhir.forEach(function (r) {
    html +=
      '<div class="kartu-tugas">' +
        "<strong>" + aman(r.judul) + "</strong>" +
        "<p>" + r.tipe + " · unggah " + formatPendek(r.tanggal) + "</p>" +
        buatBadge(r.status) +
      "</div>";
  });
  $("daftar-terakhir").innerHTML = html;
}

// ----- Pengaju 2: Tinjau & Revisi -----
function renderTinjau() {
  // Hanya request yang sudah punya draf (link hasil)
  const daftar = requestSaya().filter(function (r) { return r.link !== ""; });
  const r = pastikanPilihan(daftar);

  // Tabel "Konten untuk ditinjau"
  let baris = "";
  daftar.forEach(function (x) {
    baris +=
      '<tr data-id="' + x.id + '"' + (x.id === idDipilih ? ' class="terpilih"' : "") + ">" +
        "<td>" + aman(x.judul) + "</td><td>" + x.tipe + "</td>" +
        '<td><button type="button" class="btn btn-utama kecil">Lihat detail</button></td>' +
      "</tr>";
  });
  $("tabel-tinjau").innerHTML = daftar.length
    ? '<div class="tabel-wrap"><table><thead><tr><th>Judul</th><th>Tipe</th><th>Aksi</th></tr></thead><tbody>' + baris + "</tbody></table></div>"
    : '<p class="bantuan">Belum ada draf yang dikirim.</p>';

  // Draf kosong
  if (!r) {
    $("badge-tinjau").innerHTML = "";
    $("tinjau-link").value = "";
    $("tinjau-caption").value = "";
    $("poster-tinjau").innerHTML = "";
    $("badge-kuota").innerHTML = "";
    $("btn-setujui").disabled = true;
    $("btn-ajukan-revisi").disabled = true;
    $("petunjuk-tinjau").textContent = "Belum ada draf untuk ditinjau.";
    return;
  }

  $("badge-tinjau").innerHTML = buatBadge(r.status);
  $("tinjau-link").value = r.link;
  $("tinjau-caption").value = r.caption || "-";
  $("poster-tinjau").innerHTML = buatPoster(r.judul);

  // Pilihan versi: Versi 2 hanya ada setelah revisi
  if (r.versi !== 2) versiDipilih = "1";
  document.querySelectorAll("#versi button").forEach(function (b) {
    b.classList.toggle("aktif", b.dataset.nilai === versiDipilih);
    if (b.dataset.nilai === "2") b.disabled = (r.versi !== 2);
  });

  $("badge-kuota").innerHTML =
    '<span class="badge b-merah"><i class="ik ik-50"></i> Sisa Kuota Revisi : ' + r.kuota + "x</span>";

  // Tombol aktif hanya saat status "Pengecekan Hasil"
  const bisaTinjau = (r.status === "Pengecekan Hasil");
  $("btn-setujui").disabled = !bisaTinjau;
  $("btn-ajukan-revisi").disabled = !(bisaTinjau && r.kuota > 0);

  if (!bisaTinjau) {
    $("petunjuk-tinjau").textContent = "Status saat ini “" + r.status + "”. Tinjauan hanya bisa dilakukan saat status Pengecekan Hasil.";
  } else if (r.kuota === 0) {
    $("petunjuk-tinjau").textContent = "Kuota revisi sudah habis. Kamu masih bisa menyetujui desain.";
  } else {
    $("petunjuk-tinjau").textContent = "";
  }
}

// ----- Pengaju 3: Status & Riwayat -----
function renderStatus() {
  const daftar = requestSaya();
  const r = pastikanPilihan(daftar);

  $("tabel-status").innerHTML = buatTabel(daftar);

  if (!r) {
    $("stepper").innerHTML = "";
    $("detail-status").innerHTML = '<p class="bantuan">Belum ada pengajuan.</p>';
    $("riwayat").innerHTML = "";
    return;
  }

  // Stepper 8 tahap: sebelum posisi = selesai, posisi = sekarang
  const posisi = URUTAN_STATUS.indexOf(r.status); // -1 kalau "Ditolak"
  let langkah = "";
  URUTAN_STATUS.forEach(function (nama, i) {
    let kelas = "tahap";
    if (r.status === "Selesai" || i < posisi) kelas += " selesai";
    else if (i === posisi) kelas += " sekarang";
    langkah += '<div class="' + kelas + '"><div class="angka">' + (i + 1) + "</div>" + STATUS[nama].singkat + "</div>";
  });
  $("stepper").innerHTML = langkah;

  $("detail-status").innerHTML = buatDetail(r) + (r.status === "Ditolak"
    ? '<p class="pesan-error">⚠ Pengajuan ini ditolak. Silakan ajukan ulang.</p>' : "");

  let riwayat = "";
  r.riwayat.forEach(function (h) {
    riwayat += "<li><strong>" + aman(h.teks) + "</strong><small>" + h.waktu + "</small></li>";
  });
  $("riwayat").innerHTML = riwayat;
}

// ----- Humas: Daftar Pengajuan -----
function renderHumas() {
  // Chip filter
  const semua = ["Semua"].concat(URUTAN_STATUS, ["Ditolak"]);
  let chips = "";
  semua.forEach(function (nama) {
    chips += '<button type="button" class="chip' + (nama === filterHumas ? " aktif" : "") + '" data-filter="' + nama + '">' + nama + "</button>";
  });
  $("chips").innerHTML = chips;

  // Tabel sesuai filter
  const daftar = daftarRequest.filter(function (r) {
    return filterHumas === "Semua" || r.status === filterHumas;
  });
  const r = pastikanPilihan(daftar);
  $("tabel-humas").innerHTML = buatTabel(daftar);
  $("panel-humas").innerHTML = buatPanelHumas(r);
}

// Panel kanan Humas: isinya berubah sesuai status request
function buatPanelHumas(r) {
  if (!r) return '<h2>Detail Pengajuan</h2><p class="bantuan">Tidak ada pengajuan.</p>';

  // Pengecekan Form -> Tolak / Terima
  if (r.status === "Pengecekan Form") {
    return (
      "<h2>Detail Pengajuan</h2>" + buatDetail(r) +
      '<div class="dua-tombol jarak-atas">' +
        '<button type="button" class="btn btn-garis" data-aksi="tolak">Tolak</button>' +
        '<button type="button" class="btn btn-utama" data-aksi="terima">Terima</button>' +
      "</div>"
    );
  }

  // Pengecekan Bahasa -> periksa, revisi, atau teruskan
  if (r.status === "Pengecekan Bahasa") {
    return (
      "<h2>Pengecekan Bahasa</h2>" +
      '<a class="tautan-kotak" href="#" data-aksi="buka-link"><span>' + aman(r.link) + "</span>" + ikonSvg("i-ext") + "</a>" +
      buatPoster(r.judul) +
      '<button type="button" class="btn btn-garis penuh" data-aksi="revisi-bahasa">Ajukan Revisi ke MedKraf</button>' +
      '<button type="button" class="btn btn-utama penuh" data-aksi="teruskan">Teruskan ke Pengaju</button>'
    );
  }

  // Siap Unggah -> unggah ke media sosial
  if (r.status === "Siap Unggah") {
    return (
      "<h2>Unggah Desain</h2>" +
      '<div class="field"><input type="text" readonly value="' + aman(r.link) + '"></div>' +
      buatPoster(r.judul) +
      '<label>Caption</label><div class="field"><input type="text" readonly value="' + aman(r.caption) + '"></div>' +
      '<div class="dua-tombol">' +
        '<button type="button" class="btn btn-garis" data-aksi="unduh">Unduh Desain</button>' +
        '<button type="button" class="btn btn-garis" data-aksi="salin">Salin Caption</button>' +
      "</div>" +
      '<button type="button" class="btn btn-utama penuh" data-aksi="unggah">Tandai Sudah Diunggah</button>'
    );
  }

  // Status lain -> hanya detail
  return (
    "<h2>Detail Pengajuan</h2>" + buatDetail(r) +
    '<div class="jarak-atas"><p class="judul-kecil">Status</p>' + buatBadge(r.status) + "</div>" +
    (r.linkUnggahan ? buatBaris("Link Unggahan", r.linkUnggahan) : "") +
    '<p class="bantuan jarak-atas">Tidak ada aksi untuk status ini.</p>'
  );
}

// ----- MedKraf: Tugas Saya -----
function renderTugas() {
  const daftar = requestSaya();
  const r = pastikanPilihan(daftar);

  let kartu = "";
  daftar.forEach(function (x) {
    kartu +=
      '<div class="kartu-tugas' + (x.id === idDipilih ? " terpilih" : "") + '" data-id="' + x.id + '">' +
        "<strong>" + aman(x.judul) + "</strong>" +
        "<p>" + x.tipe + " · unggah " + formatPendek(x.tanggal) + "</p>" +
        buatBadge(x.status) +
      "</div>";
  });
  $("daftar-tugas").innerHTML = kartu || '<p class="bantuan">Belum ada tugas.</p>';

  if (!r) {
    $("detail-tugas").innerHTML = '<p class="bantuan">Pilih tugas di sebelah kanan.</p>';
    $("blok-catatan").innerHTML = "";
    $("poster-tugas").innerHTML = "";
    $("btn-serahkan").disabled = true;
    $("input-hasil").disabled = true;
    return;
  }

  $("detail-tugas").innerHTML = buatDetail(r);

  // Catatan revisi dari Humas / Pengaju
  let catatan = "";
  if (r.catatan.length > 0) {
    catatan = '<h2 class="jarak-atas">Catatan Revisi</h2>';
    r.catatan.forEach(function (c) {
      catatan += '<div class="catatan"><strong>Catatan Revisi ' + c.dari + "</strong>" + aman(c.teks) + "</div>";
    });
  }
  $("blok-catatan").innerHTML = catatan;

  $("poster-tugas").innerHTML = buatPoster(r.judul);

  // Bisa diserahkan hanya saat sedang dikerjakan
  const bisa = (r.status === "Proses Desain" || r.status === "Revisi Bahasa" || r.status === "Revisi Desain");
  $("btn-serahkan").disabled = !bisa;
  $("input-hasil").disabled = !bisa;
  $("petunjuk-tugas").textContent = bisa ? "" : "Hasil sudah diserahkan. Status saat ini: " + r.status + ".";
}

// ----- Profil (semua peran) -----
function renderProfil() {
  const p = PERAN[peranAktif];
  $("profil-nama").textContent = p.nama;
  $("profil-peran").textContent = p.judulPeran;

  $("profil-detail").innerHTML =
    buatBaris("Nama lengkap", p.nama) +
    buatBaris("Peran", p.label) +
    buatBaris("Departemen", p.departemen) +
    buatBaris("Email", p.email) +
    buatBaris("Bergabung sejak", p.gabung);

  // Ringkasan angka
  const daftar = requestSaya();
  const sedang = daftar.filter(function (r) { return r.status !== "Selesai" && r.status !== "Ditolak"; }).length;
  const selesai = daftar.filter(function (r) { return r.status === "Selesai"; }).length;
  $("profil-angka").innerHTML =
    "<div><b>" + daftar.length + "</b>Total pengajuan</div>" +
    "<div><b>" + sedang + "</b>Sedang diproses</div>" +
    "<div><b>" + selesai + "</b>Selesai</div>";

  let hak = "";
  p.hak.forEach(function (h) { hak += "<li>" + h + "</li>"; });
  $("profil-hak").innerHTML = hak;
}


/* ==========================================================
   6. AKSI PENGAJU
   ========================================================== */

// Pilih tipe konten
$("tipe-konten").addEventListener("click", function (e) {
  const tombol = e.target.closest("button");
  if (!tombol) return;

  tipeDipilih = tombol.dataset.nilai;
  this.querySelectorAll("button").forEach(function (b) { b.classList.remove("aktif"); });
  tombol.classList.add("aktif");

  // Story tidak memakai caption
  $("input-caption").disabled = (tipeDipilih === "Story");
  if (tipeDipilih === "Story") $("input-caption").value = "";
});

// Hapus pesan error saat mulai mengetik
["judul", "tanggal", "deskripsi"].forEach(function (nama) {
  $("input-" + nama).addEventListener("input", function () {
    $("error-" + nama).hidden = true;
    this.classList.remove("salah");
  });
});

// Periksa satu kolom wajib. Hasilnya true jika terisi.
function periksaKolom(nama) {
  const terisi = $("input-" + nama).value.trim() !== "";
  $("error-" + nama).hidden = terisi;
  $("input-" + nama).classList.toggle("salah", !terisi);
  return terisi;
}

// Kosongkan form
function resetForm() {
  ["judul", "tanggal", "deskripsi", "caption"].forEach(function (nama) {
    $("input-" + nama).value = "";
  });
  $("input-caption").disabled = false;
  tipeDipilih = "Reels";
  document.querySelectorAll("#tipe-konten button").forEach(function (b) {
    b.classList.toggle("aktif", b.dataset.nilai === "Reels");
  });
}

// Kirim Pengajuan
$("btn-kirim").addEventListener("click", function () {
  const judulOk = periksaKolom("judul");
  const tanggalOk = periksaKolom("tanggal");
  const deskripsiOk = periksaKolom("deskripsi");
  if (!(judulOk && tanggalOk && deskripsiOk)) {
    tampilkanToast("Lengkapi kolom yang wajib diisi.");
    return;
  }

  idTerakhir = idTerakhir + 1;
  const baru = {
    id: idTerakhir,
    judul: $("input-judul").value.trim(),
    pengaju: PERAN.pengaju.nama, dept: PERAN.pengaju.dept,
    tipe: tipeDipilih,
    tanggal: $("input-tanggal").value,
    deskripsi: $("input-deskripsi").value.trim(),
    caption: $("input-caption").value.trim(),
    pic: "", status: "Pengecekan Form",
    link: "", linkUnggahan: "", versi: 1, kuota: 1, catatan: [],
    riwayat: [{ teks: RIWAYAT_AWAL.form, waktu: waktuSekarang() }]
  };
  daftarRequest.push(baru);

  kirimNotif("humas", "Pengajuan baru", baru.judul + " · " + baru.pengaju + " (" + baru.dept + ")");
  idDipilih = baru.id;
  resetForm();
  tampilkanToast("Pengajuan berhasil dikirim!");
  tampilkanView("status");
});

// Pilih versi draf
$("versi").addEventListener("click", function (e) {
  const tombol = e.target.closest("button");
  if (!tombol || tombol.disabled) return;
  versiDipilih = tombol.dataset.nilai;
  renderTinjau();
});

// Buka modal revisi / setujui
$("btn-ajukan-revisi").addEventListener("click", function () {
  $("catatan-revisi").value = "";
  $("btn-konfirmasi-revisi").disabled = true;
  bukaModal("modal-revisi");
});

$("btn-setujui").addEventListener("click", function () {
  bukaModal("modal-setujui");
});

$("catatan-revisi").addEventListener("input", function () {
  $("btn-konfirmasi-revisi").disabled = (this.value.trim() === "");
});

// Konfirmasi ajukan revisi (kuota 1x)
$("btn-konfirmasi-revisi").addEventListener("click", function () {
  const r = cariRequest(idDipilih);
  r.kuota = 0;
  r.status = "Revisi Desain";
  r.catatan.push({ dari: "Pengaju", teks: $("catatan-revisi").value.trim() });
  tambahRiwayat(r, RIWAYAT_AWAL.revdes);
  kirimNotif("medkraf", "Revisi dari pengaju", r.judul + " · 1 catatan revisi");
  selesaiAksi("Revisi dikirim ke MedKraf.");
});

// Konfirmasi setujui desain
$("btn-konfirmasi-setujui").addEventListener("click", function () {
  const r = cariRequest(idDipilih);
  r.status = "Siap Unggah";
  tambahRiwayat(r, RIWAYAT_AWAL.setuju);
  kirimNotif("humas", "Konten siap diunggah", r.judul + " · disetujui pengaju");
  selesaiAksi("Desain disetujui. Status: Siap Unggah.");
});


/* ==========================================================
   7. AKSI HUMAS
   ========================================================== */

// Semua tombol aksi di panel Humas memakai atribut data-aksi
function jalankanAksi(aksi) {
  const r = cariRequest(idDipilih);
  if (!r) return;

  if (aksi === "tolak") {
    $("alasan-tolak").value = "";
    $("btn-konfirmasi-tolak").disabled = true;
    bukaModal("modal-tolak");
  }

  if (aksi === "terima") {
    let pilihan = '<option value="">Pilih anggota MedKraf</option>';
    DAFTAR_PIC.forEach(function (nama) { pilihan += '<option value="' + nama + '">' + nama + "</option>"; });
    $("pilih-pic").innerHTML = pilihan;
    $("btn-konfirmasi-terima").disabled = true;
    bukaModal("modal-terima");
  }

  if (aksi === "revisi-bahasa") {
    $("catatan-bahasa").value = "";
    $("btn-konfirmasi-revisi-bahasa").disabled = true;
    bukaModal("modal-revisi-bahasa");
  }

  if (aksi === "teruskan") {
    r.status = "Pengecekan Hasil";
    tambahRiwayat(r, RIWAYAT_AWAL.teruskan);
    kirimNotif("pengaju", "Draf siap ditinjau", r.judul + " · sisa revisi " + r.kuota + "x");
    selesaiAksi("Draf diteruskan ke pengaju.");
  }

  if (aksi === "unggah") {
    $("link-unggahan").value = "";
    $("btn-konfirmasi-unggah").disabled = true;
    bukaModal("modal-unggah");
  }

  if (aksi === "unduh") tampilkanToast("Mengunduh desain… (simulasi)");

  if (aksi === "salin") {
    try {
      navigator.clipboard.writeText(r.caption);
      tampilkanToast("Caption disalin.");
    } catch (err) {
      tampilkanToast("Caption: " + r.caption);
    }
  }

  if (aksi === "buka-link") tampilkanToast("Membuka tautan desain… (simulasi)");
}

// Tombol di modal aktif hanya jika kolomnya terisi
$("alasan-tolak").addEventListener("input", function () {
  $("btn-konfirmasi-tolak").disabled = (this.value.trim() === "");
});
$("pilih-pic").addEventListener("change", function () {
  $("btn-konfirmasi-terima").disabled = (this.value === "");
});
$("catatan-bahasa").addEventListener("input", function () {
  $("btn-konfirmasi-revisi-bahasa").disabled = (this.value.trim() === "");
});
$("link-unggahan").addEventListener("input", function () {
  $("btn-konfirmasi-unggah").disabled = (this.value.trim() === "");
});

// Konfirmasi tolak
$("btn-konfirmasi-tolak").addEventListener("click", function () {
  const r = cariRequest(idDipilih);
  const alasan = $("alasan-tolak").value.trim();
  r.status = "Ditolak";
  tambahRiwayat(r, "Request ditolak Humas. Alasan: " + alasan);
  kirimNotif("pengaju", "Request ditolak", "Alasan: " + alasan);
  selesaiAksi("Pengajuan ditolak.");
});

// Konfirmasi terima & tugaskan PIC
$("btn-konfirmasi-terima").addEventListener("click", function () {
  const r = cariRequest(idDipilih);
  r.pic = $("pilih-pic").value;
  r.status = "Proses Desain";
  tambahRiwayat(r, "Request diterima Humas, PIC: " + r.pic + " → Proses Desain");
  kirimNotif("pengaju", "Request diterima Humas", r.judul + " · PIC: " + r.pic);
  kirimNotif("medkraf", "Tugas baru", r.judul + " · unggah " + formatPendek(r.tanggal));
  selesaiAksi("Diterima. PIC: " + r.pic);
});

// Konfirmasi revisi bahasa ke MedKraf
$("btn-konfirmasi-revisi-bahasa").addEventListener("click", function () {
  const r = cariRequest(idDipilih);
  r.status = "Revisi Bahasa";
  r.catatan.push({ dari: "Humas", teks: $("catatan-bahasa").value.trim() });
  tambahRiwayat(r, RIWAYAT_AWAL.revbhs);
  kirimNotif("medkraf", "Catatan revisi dari Humas", r.judul + " · 1 catatan");
  selesaiAksi("Revisi dikirim ke MedKraf.");
});

// Konfirmasi tandai sudah diunggah
$("btn-konfirmasi-unggah").addEventListener("click", function () {
  const r = cariRequest(idDipilih);
  r.linkUnggahan = $("link-unggahan").value.trim();
  r.status = "Selesai";
  tambahRiwayat(r, RIWAYAT_AWAL.selesai);
  kirimNotif("pengaju", "Konten sudah diunggah", r.judul + " · sudah tayang");
  selesaiAksi("Ditandai sudah diunggah. Selesai!");
});


/* ==========================================================
   8. AKSI MEDKRAF
   ========================================================== */
$("input-hasil").addEventListener("input", function () {
  $("error-hasil").hidden = true;
  this.classList.remove("salah");
});

$("btn-serahkan").addEventListener("click", function () {
  const link = $("input-hasil").value.trim();
  if (link === "") {
    $("error-hasil").hidden = false;
    $("input-hasil").classList.add("salah");
    return;
  }

  const r = cariRequest(idDipilih);
  r.link = link;

  if (r.status === "Revisi Desain") {
    // Revisi dari pengaju: hasil langsung siap unggah (tanpa tinjauan ulang)
    r.status = "Siap Unggah";
    r.versi = 2;
    tambahRiwayat(r, "Revisi selesai diserahkan MedKraf → Siap Unggah");
    kirimNotif("humas", "Konten siap diunggah", r.judul + " · revisi pengaju selesai");
    kirimNotif("pengaju", "Revisi selesai", r.judul + " · Versi 2 sudah tersedia");
  } else {
    // Draf pertama atau revisi bahasa: periksa bahasa oleh Humas
    r.status = "Pengecekan Bahasa";
    tambahRiwayat(r, RIWAYAT_AWAL.serah);
    kirimNotif("humas", "Desain siap dicek bahasa", r.judul + " · diserahkan MedKraf");
  }

  $("input-hasil").value = "";
  selesaiAksi("Desain berhasil diserahkan.");
});


/* ==========================================================
   9. NOTIFIKASI, PROFIL, MODAL
   ========================================================== */

// Angka merah di lonceng = jumlah notifikasi yang belum dibaca
function perbaruiLencana() {
  if (!peranAktif) return;
  const jumlah = daftarNotif[peranAktif].filter(function (n) { return n.baru; }).length;
  $("lencana").textContent = jumlah;
  $("lencana").hidden = (jumlah === 0);
}

// Klik lonceng -> buka/tutup daftar notifikasi
$("btn-bel").addEventListener("click", function () {
  const dropdown = $("dropdown-notif");
  if (!dropdown.hidden) {
    dropdown.hidden = true;
    return;
  }

  let html = "<h4>Notifikasi</h4>";
  const daftar = daftarNotif[peranAktif];
  if (daftar.length === 0) html += '<p class="bantuan">Belum ada notifikasi.</p>';
  daftar.forEach(function (n) {
    html +=
      '<div class="notif' + (n.baru ? " baru" : "") + '"><div>' +
        "<strong>" + aman(n.judul) + "</strong>" + aman(n.isi) + "<br><small>" + n.waktu + "</small>" +
      "</div></div>";
  });
  dropdown.innerHTML = html;
  dropdown.hidden = false;

  // Setelah dibuka, anggap sudah dibaca
  daftar.forEach(function (n) { n.baru = false; });
  perbaruiLencana();
});

// Dipanggil setelah sebuah aksi selesai: tutup modal, segarkan tampilan, beri pesan
function selesaiAksi(pesan) {
  tutupSemuaModal();
  renderView();
  tampilkanToast(pesan);
}

function bukaModal(id) {
  $(id).classList.add("tampil");
}

function tutupSemuaModal() {
  document.querySelectorAll(".modal").forEach(function (m) { m.classList.remove("tampil"); });
}

// Tombol ✕ dan Batal (punya atribut data-tutup)
document.querySelectorAll("[data-tutup]").forEach(function (tombol) {
  tombol.addEventListener("click", tutupSemuaModal);
});

// Klik area gelap di luar modal
document.querySelectorAll(".modal").forEach(function (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target === modal) tutupSemuaModal();
  });
});

// Tombol Esc
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    tutupSemuaModal();
    $("dropdown-notif").hidden = true;
  }
});
