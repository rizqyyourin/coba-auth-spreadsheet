(() => {
  const { $: q, toast, apiLogin, apiRegister, saveToken, getToken } = window.Auth;

  const emailEl = q('#email');
  const passEl  = q('#password');
  const btnLogin= q('#btnLogin');

  const regModal = q('#regModal');
  const openReg  = q('#openReg');
  const regUsername = q('#regUsername');
  const regEmail = q('#regEmail');
  const regPass  = q('#regPass');
  const regPass2 = q('#regPass2');
  const btnReg   = q('#btnReg');
  const btnClose = q('#btnClose');

  // sudah login? langsung ke dashboard
  if (getToken()) location.href = './dashboard.html';

  // modal register
  openReg?.addEventListener('click', () => {
    regModal.classList.add('open');
    regEmail.value = emailEl.value;
    regUsername.focus();
  });
  btnClose?.addEventListener('click', () => regModal.classList.remove('open'));

  // register
  btnReg?.addEventListener('click', async () => {
    const username = (regUsername.value||'').trim();
    const email = (regEmail.value||'').trim();
    const pass  = regPass.value;
    const pass2 = regPass2.value;

    if (!username || username.length < 3) return toast('Username minimal 3 karakter','err');
    if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) return toast('Username hanya huruf/angka/underscore (3–24)','err');
    if (!email || !pass) return toast('Email & password wajib diisi','err');
    if (pass.length < 6)  return toast('Password minimal 6','err');
    if (pass !== pass2)   return toast('Konfirmasi password tidak cocok','err');

    btnReg.disabled = true; btnReg.textContent = 'Mendaftarkan...';
    try{
      const res = await apiRegister(username, email, pass);
      if (res.error) throw new Error(res.error);
      await toast('Register berhasil. Silakan login.','ok');
      regModal.classList.remove('open');
      emailEl.value = email; passEl.value='';
    }catch(e){
      await toast('Register gagal: ' + e.message,'err');
    }finally{
      btnReg.disabled = false; btnReg.textContent = 'Buat Akun';
    }
  });

  // login
  btnLogin.addEventListener('click', async () => {
    const email = (emailEl.value||'').trim(), pass = passEl.value;
    if (!email || !pass) return toast('Email & password wajib diisi','err');

    btnLogin.disabled = true; btnLogin.textContent = 'Masuk...';
    try{
      const res = await apiLogin(email, pass);
      if (res.error) throw new Error(res.error);
      if (!res.token) throw new Error('Token kosong');
      saveToken(res.token);
      location.href = './dashboard.html';
    }catch(e){
      await toast('Login gagal: ' + e.message,'err');
    }finally{
      btnLogin.disabled = false; btnLogin.textContent = 'Login';
    }
  });

  // enter submit
  [ emailEl, passEl ].forEach(el => el.addEventListener('keydown', e => {
    if (e.key === 'Enter') btnLogin.click();
  }));
})();
