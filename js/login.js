(function () {
  'use strict';
  const lockForm = document.getElementById('lockForm');
  const lockEmail = document.getElementById('lockEmail');
  const lockPassword = document.getElementById('lockPassword');
  const lockError = document.getElementById('lockError');

  async function redirectIfLoggedIn() {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) location.replace('admin.html');
  }

  lockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    lockError.textContent = 'Verificando…';
    const { error } = await supabaseClient.auth.signInWithPassword({ email: lockEmail.value.trim(), password: lockPassword.value });
    if (error) {
      lockError.textContent = 'Correo o contraseña incorrectos.';
      lockPassword.value = '';
      lockPassword.focus();
      return;
    }
    location.replace('admin.html');
  });

  redirectIfLoggedIn();
})();
