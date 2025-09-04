(() => {
  const { $: q, toast, apiLogin, apiRegister, saveToken, getToken } = window.Auth;

  const emailEl = q('#email');
  const passEl  = q('#password');
  const btnLogin= q('#btnLogin');

  const regModal= q('#regModal');
  const openReg = q('#openReg');
  const regEmail= q('#regEmail');
  const regPass = q('#regPass');
  const regPass2= q('#regPass2');
  const btnReg  = q('#btnReg');
  const btnClose= q('#btnClose');

  // Jika sudah login → langsung ke dashboard
  if (getToken()) location.href = './dashboard.html';

  // Modal register
  openReg?.addEventListener('click', () => {
    regModal.classList.add('open');
    regEmail.value = emailEl.value;
    regEmail.focus();
  });
  btnClose?.addEventListener('click', () => regModal.classList.remove('open'));

  // Register
  btnReg?.addEventListener('click', async () => {
    const email = regEmail.value.trim(), pass = regPass.value, pass2 = regPass2.value;
    if (!email || !pass) return toast('Email/password wajib diisi','err');
    if (pass.length < 6)  return toast('Password min 6','err');
    if (pass !== pass2)   return toast('Konfirmasi tidak cocok','err');

    btnReg.disabled = true; btnReg.textContent = 'Mendaftarkan...';
    try{
      const res = await apiRegister(email, pass);
      if (res.error) throw new Error(res.error);
      toast('Register berhasil','ok');
      regModal.classList.remove('open');
      emailEl.value = email; passEl.value='';
    }catch(e){
      toast('Register gagal: ' + e.message,'err');
    }finally{
      btnReg.disabled = false; btnReg.textContent = 'Buat Akun';
    }
  });

  // Login
  btnLogin.addEventListener('click', async () => {
    const email = emailEl.value.trim(), pass = passEl.value;
    if (!email || !pass) return toast('Email & password wajib diisi','err');

    btnLogin.disabled = true; btnLogin.textContent = 'Masuk...';
    try{
      const res = await apiLogin(email, pass);
      if (res.error) throw new Error(res.error);
      if (!res.token) throw new Error('Token kosong');
      saveToken(res.token);
      location.href = './dashboard.html';
    }catch(e){
      toast('Login gagal: ' + e.message,'err');
    }finally{
      btnLogin.disabled = false; btnLogin.textContent = 'Login';
    }
  });

  // Enter untuk submit
  [ emailEl, passEl ].forEach(el => el.addEventListener('keydown', e => {
    if (e.key === 'Enter') btnLogin.click();
  }));
})();
