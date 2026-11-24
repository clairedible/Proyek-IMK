/* ajukan.js — halaman ajukan */
function renderHalaman() {
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
  simpan();

  kirimNotif("humas", "Pengajuan baru", baru.judul + " · " + baru.pengaju + " (" + baru.dept + ")");
  idDipilih = baru.id;
  resetForm();
  tampilkanToast("Pengajuan berhasil dikirim!");
  tampilkanView("status");
});

window.renderHalaman = renderHalaman;
renderHalaman();
