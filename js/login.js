/* login.js — halaman Login */
if (peranLogin && $("judul-login")) {
  $("judul-login").textContent = "Masuk sebagai " + PERAN[peranLogin].label;
}

if ($("btn-ganti-peran")) $("btn-ganti-peran").addEventListener("click", gantiPeran);
if ($("btn-lupa")) $("btn-lupa").addEventListener("click", function () {
  tampilkanToast("Fitur lupa kata sandi belum tersedia (demo).");
});
if ($("form-login")) $("form-login").addEventListener("submit", function (e) {
  e.preventDefault();
  const emailOk = $("login-email").value.includes("@");
  const sandiOk = $("login-sandi").value.trim() !== "";
  if (!emailOk || !sandiOk) { $("error-login").hidden = false; return; }
  masuk(peranLogin);
});
if ($("btn-google")) $("btn-google").addEventListener("click", function () { masuk(peranLogin); });
