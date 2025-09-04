(() => {
  // ======== KONFIG ========
  const GAS_URL   = 'https://script.google.com/macros/s/AKfycbw-VDlk2p-iPWeepK443VXvju5ENvxA3KQpz_fbD5zX5yKya09Z0UKYNN1eMeIvEB9N/exec';
  const PROXY_URL = 'http://localhost:3000/api'; // dev only
  const USE_PROXY = /^(localhost|127\.|10\.|192\.168\.)/.test(location.hostname);

  // ======== Alert modal (centered) ========
  function alertBox({ title='Info', message='', type='info', okText='OK' }){
    const backdrop = document.createElement('div');
    backdrop.className = 'alert-backdrop';
    const box = document.createElement('div');
    box.className = 'alert-box';
    const h = document.createElement('div'); h.className = 'alert-title'; h.textContent = title;
    const p = document.createElement('div'); p.className = 'alert-msg';   p.textContent = message;
    const act = document.createElement('div'); act.className = 'alert-actions';
    const ok = document.createElement('button'); ok.className = 'alert-btn alert-ok'; ok.textContent = okText;
    if (type === 'ok') ok.classList.add('ok');
    if (type === 'err') ok.classList.add('err');
    act.appendChild(ok); box.appendChild(h); box.appendChild(p); box.appendChild(act); backdrop.appendChild(box);
    document.body.appendChild(backdrop);
    requestAnimationFrame(()=>backdrop.classList.add('show'));
    return new Promise(res=>{
      const close=()=>{ backdrop.classList.remove('show'); setTimeout(()=>backdrop.remove(),180); res(); };
      ok.onclick = close; backdrop.addEventListener('click',e=>{ if(e.target===backdrop) close(); });
    });
  }

  // Back-compat: ganti `toast()` jadi alert center
  function toast(msg, type='info'){ return alertBox({ title: type==='err'?'Terjadi Kesalahan': (type==='ok'?'Berhasil':'Info'), message: msg, type }); }

  // ======== UTIL ========
  const sel = (s, root = document) => root.querySelector(s);
  const saveToken  = (t) => localStorage.setItem('token', t);
  const getToken   = ()  => localStorage.getItem('token');
  const clearToken = ()  => localStorage.removeItem('token');

  // ======== TRANSPORTS ========
  async function callViaProxy(payload) {
    const r = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    const txt = await r.text();
    if (!r.ok) return { error: `HTTP ${r.status}`, raw: txt };
    try { return JSON.parse(txt); } catch { return { error: 'Invalid JSON', raw: txt }; }
  }

  window.__jsonpQueue = window.__jsonpQueue || [];
  window.__jsonp_cb = window.__jsonp_cb || function (data) {
    const next = window.__jsonpQueue.shift();
    if (typeof next === 'function') next(data);
  };

  function callViaJsonp(params, { timeout = 60000 } = {}) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + '_' + Math.random().toString(36).slice(2);
      const all = { ...params, callback: '__jsonp_cb', _ts: id };

      const qs = Object.entries(all)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');

      const s = document.createElement('script');
      s.src = `${GAS_URL}?${qs}`;
      s.async = true;

      let done = false;
      const cleanup = () => { if (done) return; done = true; clearTimeout(to); try { s.remove(); } catch(_){} };

      window.__jsonpQueue.push((data) => { cleanup(); resolve(data); });
      s.onerror = () => { cleanup(); reject(new Error('JSONP network error')); };
      const to = setTimeout(() => { cleanup(); reject(new Error('JSONP timeout')); }, timeout);

      document.head.appendChild(s);
    });
  }

  // ======== API WRAPPERS ========
  const apiRegister = (username, email, password) =>
    USE_PROXY ? callViaProxy({ action: 'register', username, email, password })
              : callViaJsonp({ action: 'register', username, email, password });

  const apiLogin = (email, password) =>
    USE_PROXY ? callViaProxy({ action: 'login', email, password })
              : callViaJsonp({ action: 'login', email, password });

  // kirim dua nama param (auth & token) agar backend selalu menangkap token
  const apiMe = (jwt) =>
    USE_PROXY ? callViaProxy({ action: 'me', auth: jwt, token: jwt })
              : callViaJsonp({ action: 'me', auth: jwt, token: jwt });

  // ======== EXPOSE GLOBAL ========
  window.Auth = { apiRegister, apiLogin, apiMe, saveToken, getToken, clearToken, $: sel, toast, alertBox };
})();
