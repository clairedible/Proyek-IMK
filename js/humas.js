/* humas.js — halaman humas */
function renderHalaman() {
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

// Semua tombol aksi di panel Humas memakai atribut data-aksi
window.jalankanAksi = function jalankanAksi(aksi) {
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





window.renderHalaman = renderHalaman;
renderHalaman();
