/* ==========================================================
   CORE.JS — V2
   Berisi: state, data bersama, login, shell/sidebar, navigasi,
   notifikasi, modal, dan event global.
   Script halaman dimuat setelah file ini.
   ========================================================== */

let peranAktif = null;
let peranLogin = null;
let viewAktif = null;
let idDipilih = null;
let tipeDipilih = "Reels";
let versiDipilih = "1";
let filterHumas = "Semua";
let timerToast = null;

const HALAMAN = {
  peran: "index.html",
  login: "login.html",
  ajukan: "ajukan.html",
  tinjau: "tinjau.html",
  status: "status.html",
  humas: "humas.html",
  tugas: "tugas.html",
  profil: "profil.html",
};
const KUNCI = "imk_v2_state2";

/* Sidecar dari data.js. Kalau kamu mengubah data.js dan menyimpannya,
   tanda tangan ini berubah -> localStorage lama otomatis diabaikan. */
function tandaTangan(teks) {
  let h = 0;
  for (let i = 0; i < teks.length; i++) {
    h = (h << 5) - h + teks.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(36);
}
const SOURCE_SIG = tandaTangan(
  JSON.stringify({ request: daftarRequest, notif: daftarNotif }),
);

// Singkatan document.getElementById
function $(id) {
  return document.getElementById(id);
}

// Cari request berdasarkan id
function cariRequest(id) {
  return daftarRequest.find(function (r) {
    return r.id === id;
  });
}

// Cegah tag HTML dari input pengguna ikut dijalankan
function aman(teks) {
  return String(teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// "2026-11-14" -> "14 Nov"
function formatPendek(iso) {
  const t = new Date(iso + "T00:00:00");
  return t.getDate() + " " + NAMA_BULAN[t.getMonth()];
}

// "2026-11-14" -> "14 November 2026"
function formatPanjang(iso) {
  const t = new Date(iso + "T00:00:00");
  return (
    t.getDate() + " " + NAMA_BULAN_PANJANG[t.getMonth()] + " " + t.getFullYear()
  );
}

// Waktu sekarang, mis. "24 Nov, 15.29"
function waktuSekarang() {
  const t = new Date();
  const jam = String(t.getHours()).padStart(2, "0");
  const menit = String(t.getMinutes()).padStart(2, "0");
  return (
    t.getDate() + " " + NAMA_BULAN[t.getMonth()] + ", " + jam + "." + menit
  );
}

// HTML ikon SVG (ikon didefinisikan di index.html)
function ikonSvg(nama) {
  return '<svg class="ic"><use href="#' + nama + '"/></svg>';
}

// HTML badge status
function buatBadge(status) {
  const s = STATUS[status];
  return (
    '<span class="badge ' +
    s.warna +
    '"><i class="ik ' +
    s.ikon +
    '"></i>' +
    status +
    "</span>"
  );
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
    '<img class="poster-gambar" src="assets/' +
    src +
    '" alt="Hasil desain: ' +
    aman(judul) +
    '">' +
    "</div>"
  );
}

// HTML satu baris detail (label + isi)
function buatBaris(label, isi) {
  return (
    '<div class="kv"><span class="k">' +
    label +
    '</span><span class="v">' +
    aman(isi) +
    "</span></div>"
  );
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
      '<tr data-id="' +
      r.id +
      '"' +
      (r.id === idDipilih ? ' class="terpilih"' : "") +
      ">" +
      "<td>" +
      aman(r.judul) +
      "</td>" +
      "<td>" +
      r.pengaju +
      "<br>(" +
      r.dept +
      ")</td>" +
      "<td>" +
      r.tipe +
      "</td>" +
      "<td>" +
      formatPendek(r.tanggal) +
      "</td>" +
      "<td>" +
      (r.pic || "-") +
      "</td>" +
      "<td>" +
      buatBadge(r.status) +
      "</td>" +
      "</tr>";
  });

  return (
    '<div class="tabel-wrap"><table class="tabel-6">' +
    "<thead><tr><th>Judul</th><th>Pengaju</th><th>Tipe</th><th>Unggah</th><th>PIC MedKraf</th><th>Status</th></tr></thead>" +
    "<tbody>" +
    baris +
    "</tbody>" +
    "</table></div>"
  );
}

// Request milik peran yang sedang login
function requestSaya() {
  if (peranAktif === "pengaju") {
    return daftarRequest.filter(function (r) {
      return r.pengaju === PERAN.pengaju.nama;
    });
  }
  if (peranAktif === "medkraf") {
    return daftarRequest.filter(function (r) {
      return r.pic === PERAN.medkraf.nama;
    });
  }
  return daftarRequest; // Humas melihat semua
}

// Pastikan idDipilih ada di dalam daftar. Kalau tidak, pilih yang pertama.
function pastikanPilihan(daftar) {
  const ada = daftar.some(function (r) {
    return r.id === idDipilih;
  });
  if (!ada) idDipilih = daftar.length ? daftar[0].id : null;
  return cariRequest(idDipilih);
}

// Catat kejadian ke riwayat sebuah request (yang terbaru di atas)
function tambahRiwayat(r, teks) {
  r.riwayat.unshift({ teks: teks, waktu: waktuSekarang() });
}

// Kirim notifikasi ke peran tertentu
function kirimNotif(untuk, judul, isi) {
  daftarNotif[untuk].unshift({
    judul: judul,
    isi: isi,
    waktu: "Baru saja",
    baru: true,
  });
  perbaruiLencana();
}

// Pesan singkat selama 2,5 detik
function tampilkanToast(pesan) {
  const toast = $("toast");
  toast.textContent = pesan;
  toast.hidden = false;
  clearTimeout(timerToast);
  timerToast = setTimeout(function () {
    toast.hidden = true;
  }, 2500);
}

/* ---------- Simpan / muat state lintas halaman ---------- */
function simpan() {
  try {
    localStorage.setItem(
      KUNCI,
      JSON.stringify({
        request: daftarRequest,
        notif: daftarNotif,
        id: idTerakhir,
        role: peranAktif,
        login: peranLogin,
        selected: idDipilih,
        tipe: tipeDipilih,
        versi: versiDipilih,
        filter: filterHumas,
        sig: SOURCE_SIG,
      }),
    );
  } catch (e) {}
}

function muat() {
  try {
    const d = JSON.parse(localStorage.getItem(KUNCI) || "null");
    if (!d) return;

    // Data di js/data.js berubah -> pakai data baru, buang simpanan lama.
    // Peran aktif tetap dipertahankan supaya tidak dilempar ke halaman login.
    if (d.sig !== SOURCE_SIG) {
      localStorage.removeItem(KUNCI);
      peranAktif = d.role || null;
      peranLogin = d.login || peranAktif;
      return;
    }

    if (d.request) {
      daftarRequest = d.request;
      idTerakhir = d.id || daftarRequest.length;
    }
    if (d.notif) daftarNotif = d.notif;
    peranAktif = d.role || null;
    peranLogin = d.login || peranAktif;
    idDipilih = d.selected || null;
    tipeDipilih = d.tipe || "Reels";
    versiDipilih = d.versi || "1";
    filterHumas = d.filter || "Semua";
  } catch (e) {}
}

/* ---------- Masuk / pindah halaman ---------- */
function masuk(peran) {
  peranAktif = peran;
  peranLogin = peran;
  idDipilih = null;
  versiDipilih = "1";
  simpan();
  location.href = HALAMAN[PERAN[peran].menu[0].id];
}

function gantiPeran() {
  peranAktif = null;
  peranLogin = null;
  simpan();
  location.href = HALAMAN.peran;
}

function tampilkanView(id) {
  viewAktif = id;
  simpan();
  location.href = HALAMAN[id] || HALAMAN.peran;
}

function bangunMenu() {
  if (!peranAktif || !$("menu")) return;
  let html = "";
  PERAN[peranAktif].menu.forEach(function (m) {
    html +=
      '<button type="button" class="menu-item" data-menu="' +
      m.id +
      '">' +
      ikonSvg(m.ikon) +
      "<span>" +
      m.teks +
      "</span></button>";
  });
  $("menu").innerHTML = html;
}

function renderView() {
  if (typeof window.renderHalaman === "function") window.renderHalaman();
}

/* ---------- Event shell & global ---------- */
if ($("menu")) {
  $("menu").addEventListener("click", function (e) {
    const tombol = e.target.closest("[data-menu]");
    if (tombol) tampilkanView(tombol.dataset.menu);
  });
}
if ($("btn-profil"))
  $("btn-profil").addEventListener("click", function () {
    tampilkanView("profil");
  });
if ($("btn-beranda"))
  $("btn-beranda").addEventListener("click", function () {
    tampilkanView(PERAN[peranAktif].menu[0].id);
  });
if ($("btn-keluar")) $("btn-keluar").addEventListener("click", gantiPeran);

document.addEventListener("click", function (e) {
  const baris = e.target.closest("[data-id]");
  if (baris) {
    idDipilih = Number(baris.dataset.id);
    versiDipilih = "1";
    simpan();
    renderView();
  }
  const chip = e.target.closest("[data-filter]");
  if (chip) {
    filterHumas = chip.dataset.filter;
    simpan();
    renderView();
  }
  const aksi = e.target.closest("[data-aksi]");
  if (aksi && typeof window.jalankanAksi === "function")
    window.jalankanAksi(aksi.dataset.aksi);
  if (!e.target.closest(".bel-wrap") && $("dropdown-notif"))
    $("dropdown-notif").hidden = true;
});

// Angka merah di lonceng = jumlah notifikasi yang belum dibaca
function perbaruiLencana() {
  if (!peranAktif) return;
  const jumlah = daftarNotif[peranAktif].filter(function (n) {
    return n.baru;
  }).length;
  $("lencana").textContent = jumlah;
  $("lencana").hidden = jumlah === 0;
}

// Klik lonceng -> buka/tutup daftar notifikasi
if ($("btn-bel"))
  $("btn-bel").addEventListener("click", function () {
    const dropdown = $("dropdown-notif");
    if (!dropdown.hidden) {
      dropdown.hidden = true;
      return;
    }

    let html = "<h4>Notifikasi</h4>";
    const daftar = daftarNotif[peranAktif];
    if (daftar.length === 0)
      html += '<p class="bantuan">Belum ada notifikasi.</p>';
    daftar.forEach(function (n) {
      html +=
        '<div class="notif' +
        (n.baru ? " baru" : "") +
        '"><div>' +
        "<strong>" +
        aman(n.judul) +
        "</strong>" +
        aman(n.isi) +
        "<br><small>" +
        n.waktu +
        "</small>" +
        "</div></div>";
    });
    dropdown.innerHTML = html;
    dropdown.hidden = false;

    // Setelah dibuka, anggap sudah dibaca
    daftar.forEach(function (n) {
      n.baru = false;
    });
    perbaruiLencana();
  });

// Dipanggil setelah sebuah aksi selesai: tutup modal, segarkan tampilan, beri pesan
function selesaiAksi(pesan) {
  simpan();
  tutupSemuaModal();
  renderView();
  tampilkanToast(pesan);
}

function bukaModal(id) {
  $(id).classList.add("tampil");
}

function tutupSemuaModal() {
  document.querySelectorAll(".modal").forEach(function (m) {
    m.classList.remove("tampil");
  });
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

/* ---------- Boot shell ---------- */
muat();
const halaman = document.body.dataset.halaman || "peran";

if (halaman === "peran" || halaman === "login") {
  // halaman login/index ditangani index.js / login.js
} else {
  if (!peranAktif) location.href = HALAMAN.peran;
  else {
    viewAktif = halaman;
    $("info-user").textContent = PERAN[peranAktif].chip;
    bangunMenu();
    document.querySelectorAll(".menu-item").forEach(function (m) {
      m.classList.toggle("aktif", m.dataset.menu === halaman);
    });
    perbaruiLencana();
  }
}
