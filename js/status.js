/* status.js — halaman status */
function renderHalaman() {
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





window.renderHalaman = renderHalaman;
renderHalaman();
