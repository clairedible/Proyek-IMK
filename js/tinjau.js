/* tinjau.js — halaman tinjau */
function renderHalaman() {
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

// Pilih versi draf
$("versi").addEventListener("click", function (e) {
  const tombol = e.target.closest("button");
  if (!tombol || tombol.disabled) return;
  versiDipilih = tombol.dataset.nilai;
  renderView();
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





window.renderHalaman = renderHalaman;
renderHalaman();
