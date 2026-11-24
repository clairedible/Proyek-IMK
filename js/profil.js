/* profil.js — halaman profil */
function renderHalaman() {
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





window.renderHalaman = renderHalaman;
renderHalaman();
