# Request Desain · InfoKom HMDTIF — VERSI 2 (V2)

Branch **`V2`** adalah versi terstruktur. Branch `main` tetap berisi versi 1 (file HTML & JS terpusat) dan tidak diubah.

## Perubahan di V2

Sebelum (V1):
```
index.html        -> semua halaman jadi satu
js/script.js      -> semua logika jadi satu
```

Sekarang (V2):
```
index.html        -> halaman Pilih Peran
login.html        -> halaman Login
ajukan.html       -> form Ajukan Permintaan
tinjau.html       -> Tinjau & Revisi
status.html       -> Status & Riwayat
humas.html        -> Daftar & Detail Pengajuan (Humas)
tugas.html        -> Tugas Saya (MedKraf)
profil.html       -> Profil

css/style.css     -> tampilan (sama seperti V1)
js/
  data.js         -> data & pengaturan (dipakai semua halaman)
  core.js         -> state, auth, sidebar, navigasi, notifikasi, modal, event global
  index.js        -> logika halaman Pilih Peran
  login.js        -> logika halaman Login
  ajukan.js       -> logika halaman Ajukan
  tinjau.js       -> logika halaman Tinjau
  status.js       -> logika halaman Status
  humas.js        -> logika halaman Humas
  tugas.js        -> logika halaman MedKraf
  profil.js       -> logika halaman Profil
assets/           -> ikon & gambar asli Figma
```

## Data lintas halaman

Karena tiap halaman adalah file HTML terpisah, state aplikasi (daftar request, notifikasi, peran aktif, dll.) disimpan di `localStorage` dengan kunci `imk_v2_state`.

Untuk mengulang dari data awal:
```js
localStorage.removeItem("imk_v2_state");
location.reload();
```

## Cara menjalankan

Buka `index.html` dengan Live Server di VS Code, atau lebih disarankan:
```sh
python3 serve.py
```
lalu buka http://localhost:8445

`serve.py` mengirim header `Cache-Control: no-store`, jadi **setiap kali kamu menyimpan perubahan di VS Code, cukup refresh browser (Cmd/Ctrl+R)** — tidak perlu hard refresh.

Mode demo: email bebas yang mengandung `@`, kata sandi apa saja (atau klik "Masuk dengan Google").

## Cara ambil V2

```sh
git fetch origin V2
git checkout V2
```

## Alur status

Pengecekan Form → Proses Desain → Pengecekan Bahasa ⇄ Revisi Bahasa → Pengecekan Hasil → (Revisi Desain) → Siap Unggah → Selesai
