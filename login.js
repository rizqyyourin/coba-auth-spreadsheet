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

  // helpers kecil
  function markError(el){
    el.classList.add('input-error','shake');
    setTimeout(()=>el.classList.remove('shake'), 450);
  }
  function clearErrors(){
    [emailEl, passEl, regUsername, regEmail, regPass, regPass2]
      .filter(Boolean).forEach(el => el.classList.remove('input-error'));
  }

  // modal register
  openReg?.addEventListener('click', () => {
    regModal.classList.add('open');
    regEmail.value = emailEl.value;
    regUsername.focus();
  });
  btnClose?.addEventListener('click', () => regModal.classList.remove('open'));

  // register
  btnReg?.addEventListener('click', async () => {
    clearErrors();
    const username = (regUsername?.value||'').trim();
    const email = (regEmail?.value||'').trim();
    const pass  = regPass?.value||'';
    const pass2 = regPass2?.value||'';

    if (!username || username.length < 3){ markError(regUsername); return toast('Username minimal 3 karakter','err'); }
    if (!/^[A-Za-z0-9_]{3,24}$/.test(username)){ markError(regUsername); return toast('Username hanya huruf/angka/underscore (3–24)','err'); }
    if (!email || !pass){ markError(regEmail); markError(regPass); return toast('Email & password wajib diisi','err'); }
    if (pass.length < 6){ markError(regPass); return toast('Password minimal 6','err'); }
    if (pass !== pass2){ markError(regPass2); return toast('Konfirmasi password tidak cocok','err'); }

    btnReg.disabled = true; btnReg.textContent = 'Mendaftarkan...';
    try{
      const res = await apiRegister(username, email, pass);
      if (res.error) throw new Error(res.error);
      await toast('Register berhasil. Silakan login.','ok');
      regModal.classList.remove('open');
      emailEl.value = email; passEl.value='';
    }catch(e){
      // mapping error register
      const msg = String(e.message||'').toLowerCase();
      if (msg.includes('username already exists')) { markError(regUsername); await toast('Username sudah dipakai.','err'); }
      else if (msg.includes('email already exists')){ markError(regEmail); await toast('Email sudah terdaftar.','err'); }
      else { await toast('Register gagal: ' + e.message,'err'); }
    }finally{
      btnReg.disabled = false; btnReg.textContent = 'Buat Akun';
    }
  });

  // login
  btnLogin.addEventListener('click', async () => {
    clearErrors();
    const email = (emailEl.value||'').trim(), pass = passEl.value;
    if (!email || !pass){
      if (!email) markError(emailEl);
      if (!pass)  markError(passEl);
      return toast('Email & password wajib diisi','err');
    }

    btnLogin.disabled = true; btnLogin.textContent = 'Masuk...';
    try{
      const res = await apiLogin(email, pass);

      // handle error dari server tanpa melempar exception dulu
      if (res && res.error){
        const err = String(res.error).toLowerCase();
        if (err.includes('user not found')){
          markError(emailEl);
          await toast('Akun tidak ditemukan. Cek email atau daftar dulu.','err');
          emailEl.focus();
          return;
        }
        if (err.includes('invalid credentials')){
          passEl.value = '';
          markError(passEl);
          await toast('Password salah. Coba lagi.','err');
          passEl.focus();
          return;
        }
        // error lain
        await toast('Login gagal: ' + res.error, 'err');
        return;
      }

      if (!res || !res.token) throw new Error('Token kosong');
      saveToken(res.token);
      location.href = './dashboard.html';
    }catch(e){
      // network/JSONP timeouts
      const msg = String(e.message||'').toLowerCase();
      if (msg.includes('jsonp')) {
        await toast('Gangguan jaringan. Coba lagi.','err');
      } else {
        await toast('Login gagal: ' + e.message,'err');
      }
    }finally{
      btnLogin.disabled = false; btnLogin.textContent = 'Login';
    }
  });

  // enter submit
  [ emailEl, passEl ].forEach(el => el.addEventListener('keydown', e => {
    if (e.key === 'Enter') btnLogin.click();
  }));
})();
