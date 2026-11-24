# Request Desain · InfoKom HMDTIF (Versi Website)

Prototype website hi-fi (desktop 1440px) dari desain Figma, dibuat dengan HTML, CSS, dan JavaScript biasa.
Ada 3 tampilan sesuai peran: **Pengaju (requester)**, **Humas**, dan **MedKraf (tim desain InfoKom)**.

## Cara menjalankan
Buka `index.html` di browser (klik dua kali, atau pakai Live Server di VS Code).
Mode demo: di halaman login, isi email (harus ada tanda @) dan kata sandi apa saja, atau klik "Masuk dengan Google".

## Struktur folder
```
miaw-website/
├── index.html      -> kerangka: login, sidebar, 6 halaman, 6 modal
├── css/style.css   -> tampilan + responsif (desktop & tablet)
└── js/
    ├── data.js     -> data contoh & pengaturan peran
    └── script.js   -> logika: login, menu, tampilan, aksi, notifikasi
```

## Halaman per peran
| Peran   | Menu | Yang bisa dilakukan |
|---------|------|---------------------|
| Pengaju | Ajukan Permintaan, Tinjau & Revisi, Status & Riwayat | Kirim pengajuan, tinjau draf, revisi (kuota 1x), setujui, lihat progres 8 tahap |
| Humas   | Daftar Pengajuan | Tolak/Terima + tugaskan PIC, cek bahasa (revisi / teruskan), unggah & tandai selesai |
| MedKraf | Tugas Saya | Lihat tugas & catatan revisi, serahkan hasil desain |

Semua peran: notifikasi (lonceng) dan halaman Profil (klik nama di pojok kanan atas).

## Alur status
Pengecekan Form → Proses Desain → Pengecekan Bahasa ⇄ Revisi Bahasa → Pengecekan Hasil → (Revisi Desain) → Siap Unggah → Selesai

## Responsif
- Layar lebar (>1100px): sidebar + 2 kolom
- Laptop/tablet (768-1100px): isi jadi 1 kolom; di bawah 900px sidebar hanya ikon
- Tampilan HP tidak dibuat.

Data hanya disimpan di memori (hilang saat refresh) karena belum ada database.
