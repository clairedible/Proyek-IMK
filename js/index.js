// pilih peran
document.querySelectorAll("[data-peran]").forEach(function (kartu) {
  kartu.addEventListener("click", function () {
    peranLogin = kartu.dataset.peran;
    simpan();
    location.href = HALAMAN.login;
  });
});
