/* tugas.js — halaman tugas */
function renderHalaman() {
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





window.renderHalaman = renderHalaman;
renderHalaman();
