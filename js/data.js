/* ==========================================================
   DATA.JS - Data & pengaturan (belum ada logika di sini)
   File ini dimuat lebih dulu dari script.js.
   Di aplikasi sungguhan, data ini datang dari server/database.
   ========================================================== */


/* ---------- 1. Daftar status ----------
   warna : nama class badge (lihat style.css)
   ikon  : bentuk lingkaran kecil di dalam badge
   singkat : tulisan pendek untuk stepper                       */
const STATUS = {
  "Pengecekan Form":   { singkat: "Cek Form",      warna: "b-biru",   ikon: "ik-0" },
  "Proses Desain":     { singkat: "Proses Desain", warna: "b-pink",   ikon: "ik-50" },
  "Pengecekan Bahasa": { singkat: "Cek Bahasa",    warna: "b-biru",   ikon: "ik-0" },
  "Revisi Bahasa":     { singkat: "Revisi Bahasa", warna: "b-pink",   ikon: "ik-50" },
  "Pengecekan Hasil":  { singkat: "Cek Hasil",     warna: "b-pink",   ikon: "ik-50" },
  "Revisi Desain":     { singkat: "Revisi Desain", warna: "b-pink",   ikon: "ik-50" },
  "Siap Unggah":       { singkat: "Siap Unggah",   warna: "b-oranye", ikon: "ik-75" },
  "Selesai":           { singkat: "Selesai",       warna: "b-hijau",  ikon: "ik-ok" },
  "Ditolak":           { singkat: "Ditolak",       warna: "b-merah",  ikon: "ik-x" }
};

// Urutan 8 tahap untuk stepper (Ditolak tidak termasuk)
const URUTAN_STATUS = [
  "Pengecekan Form", "Proses Desain", "Pengecekan Bahasa", "Revisi Bahasa",
  "Pengecekan Hasil", "Revisi Desain", "Siap Unggah", "Selesai"
];


/* ---------- 2. Pengaturan tiap peran ----------
   menu : daftar menu di sidebar (id harus sama dengan id view: "v-" + id) */
const PERAN = {
  pengaju: {
    nama: "Reyhan", label: "Pengaju", dept: "PSDM",
    chip: "Reyhan · Pengaju (PSDM)",
    judulPeran: "Pengaju (Pengaju)",
    email: "reyhan@hmdtif.example",
    departemen: "Dept. PSDM · HMDTIF",
    gabung: "Januari 2026",
    menu: [
      { id: "ajukan", teks: "Ajukan Permintaan", ikon: "i-phone" },
      { id: "tinjau", teks: "Tinjau & Revisi",   ikon: "i-clip" },
      { id: "status", teks: "Status & Riwayat",  ikon: "i-clock" }
    ],
    hak: [
      "Mengajukan request konten",
      "Meninjau draf dan merevisi (maks. 1x)",
      "Melihat status dan riwayat publikasi"
    ]
  },
  humas: {
    nama: "Farid", label: "Humas", dept: "InfoKom",
    chip: "Farid · Humas (InfoKom)",
    judulPeran: "Humas (InfoKom)",
    email: "farid@hmdtif.example",
    departemen: "Departemen InfoKom · HMDTIF",
    gabung: "Januari 2026",
    menu: [
      { id: "humas", teks: "Daftar Pengajuan", ikon: "i-phone" }
    ],
    hak: [
      "Menerima atau menolak pengajuan",
      "Menugaskan PIC MedKraf",
      "Memeriksa bahasa dan meneruskan draf ke pengaju",
      "Mengunggah konten ke media sosial"
    ]
  },
  medkraf: {
    nama: "Kemal", label: "MedKraf", dept: "InfoKom",
    chip: "Kemal · MedKraf (InfoKom)",
    judulPeran: "MedKraf (InfoKom)",
    email: "kemal@hmdtif.example",
    departemen: "Departemen InfoKom · HMDTIF",
    gabung: "Januari 2026",
    menu: [
      { id: "tugas", teks: "Tugas Saya", ikon: "i-tasks" }
    ],
    hak: [
      "Melihat tugas desain yang diberikan",
      "Mengerjakan revisi dari Humas dan pengaju",
      "Menyerahkan hasil desain"
    ]
  }
};

// Pilihan PIC pada modal "Terima & Tugaskan PIC"
const DAFTAR_PIC = ["Kemal", "Raka", "Sinta", "Bima", "Nadia", "Dimas"];


/* ---------- 3. Data request (contoh) ---------- */
const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const NAMA_BULAN_PANJANG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
                            "Agustus", "September", "Oktober", "November", "Desember"];

// Kalimat riwayat untuk tiap tahap (dipakai untuk membuat riwayat awal)
const RIWAYAT_AWAL = {
  form:   "Request terkirim → Pengecekan Form",
  terima: "Request diterima Humas → Proses Desain",
  serah:  "Draf diserahkan MedKraf → Pengecekan Bahasa",
  revbhs: "Humas meminta revisi bahasa → Revisi Bahasa",
  teruskan: "Humas meneruskan draf → Pengecekan Hasil",
  revdes: "Pengaju mengajukan revisi → Revisi Desain",
  setuju: "Pengaju menyetujui desain → Siap Unggah",
  selesai: "Konten sudah diunggah → Selesai"
};

// Urutan kejadian sampai suatu status
const JALUR = {
  "Pengecekan Form":   ["form"],
  "Proses Desain":     ["form", "terima"],
  "Pengecekan Bahasa": ["form", "terima", "serah"],
  "Revisi Bahasa":     ["form", "terima", "serah", "revbhs"],
  "Pengecekan Hasil":  ["form", "terima", "serah", "teruskan"],
  "Revisi Desain":     ["form", "terima", "serah", "teruskan", "revdes"],
  "Siap Unggah":       ["form", "terima", "serah", "teruskan", "setuju"],
  "Selesai":           ["form", "terima", "serah", "teruskan", "setuju", "selesai"]
};

// Membuat satu request contoh lengkap dengan riwayatnya
function buatRequest(id, judul, pengaju, dept, tipe, tanggal, pic, status, ekstra) {
  const kejadian = JALUR[status];
  const riwayat = kejadian.map(function (kunci, i) {
    return { teks: RIWAYAT_AWAL[kunci], waktu: (12 + i) + " Nov, 09.12" };
  });

  const r = {
    id: id, judul: judul, pengaju: pengaju, dept: dept, tipe: tipe, tanggal: tanggal,
    deskripsi: tipe + " untuk " + judul + ".",
    caption: "Info lengkap ada di bio! #HMDTIF",
    pic: pic,
    status: status,
    link: kejadian.length > 2 ? "https://figma.com/design/miaw-" + id : "",  // link hasil MedKraf
    linkUnggahan: "",
    versi: 1,
    kuota: 1,           // sisa kuota revisi pengaju
    catatan: [],        // catatan revisi: { dari: "Humas" / "Pengaju", teks: "..." }
    riwayat: riwayat.reverse()  // terbaru di atas
  };

  // Timpa dengan data khusus kalau ada
  Object.assign(r, ekstra || {});
  return r;
}

let daftarRequest = [
  buatRequest(1, "Open Recruitment Magang", "Reyhan", "PSDM", "Reels", "2026-11-14", "", "Pengecekan Form", {
    deskripsi: "Reels promosi Open Recruitment Magang 2026.",
    caption: "Yuk gabung Magang HMDTIF 2026! Info di bio."
  }),
  buatRequest(2, "Workshop Desain", "Nisa", "BPH", "Feeds", "2026-11-15", "Kemal", "Proses Desain"),
  buatRequest(3, "Seminar Karier", "Dika", "PSDM", "Story", "2026-11-16", "Bima", "Pengecekan Bahasa"),
  buatRequest(4, "Donasi Pendidikan", "Alya", "PSDI", "Feeds", "2026-11-17", "Nadia", "Siap Unggah"),
  buatRequest(5, "Festival Seni", "Fajar", "PIT", "Reels", "2026-11-18", "Dimas", "Selesai", {
    linkUnggahan: "https://instagram.com/p/festival-seni"
  }),
  buatRequest(6, "Promo Akhir Tahun", "Reyhan", "PSDM", "Feeds", "2026-11-20", "Kemal", "Pengecekan Hasil"),
  buatRequest(7, "Pengumuman Acara", "Reyhan", "PSDM", "Story", "2026-11-22", "Sinta", "Proses Desain"),
  buatRequest(8, "Peluncuran Produk", "Reyhan", "PSDM", "Feeds", "2026-11-25", "Kemal", "Revisi Desain", {
    kuota: 0,
    catatan: [{ dari: "Pengaju", teks: "Masukan Pengaju diproses dalam satu kali revisi." }]
  }),
  buatRequest(9, "Lomba Poster", "Nisa", "BPH", "Feeds", "2026-11-27", "Kemal", "Revisi Bahasa", {
    catatan: [{ dari: "Humas", teks: "Typo pada baris ke 3: “pendaftran” → “pendaftaran”." }]
  })
];

let idTerakhir = 9; // untuk membuat id request baru


/* ---------- 4. Notifikasi per peran ---------- */
let daftarNotif = {
  pengaju: [
    { judul: "Draf siap ditinjau", isi: "Promo Akhir Tahun · sisa revisi 1x", waktu: "5 menit lalu", baru: true },
    { judul: "Request diterima Humas", isi: "Pengumuman Acara · PIC: Sinta", waktu: "Kemarin", baru: false },
    { judul: "Request ditolak", isi: "Alasan: instruksi belum lengkap. Ajukan ulang.", waktu: "2 hari lalu", baru: false }
  ],
  humas: [
    { judul: "Pengajuan baru", isi: "Open Recruitment Magang · Reyhan (PSDM)", waktu: "10 menit lalu", baru: true },
    { judul: "Desain siap dicek bahasa", isi: "Seminar Karier · diserahkan MedKraf", waktu: "1 jam lalu", baru: true },
    { judul: "Konten siap diunggah", isi: "Donasi Pendidikan · disetujui pengaju", waktu: "Kemarin", baru: true }
  ],
  medkraf: [
    { judul: "Tugas baru", isi: "Workshop Desain · unggah 15 Nov", waktu: "20 menit lalu", baru: true },
    { judul: "Catatan revisi dari Humas", isi: "Lomba Poster · 1 catatan", waktu: "1 jam lalu", baru: true }
  ]
};
