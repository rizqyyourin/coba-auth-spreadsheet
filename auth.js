(() => {
  // ======== KONFIG ========
  const GAS_URL   = 'https://script.google.com/macros/s/AKfycbw-VDlk2p-iPWeepK443VXvju5ENvxA3KQpz_fbD5zX5yKya09Z0UKYNN1eMeIvEB9N/exec'; // ganti jika perlu
  const PROXY_URL = 'http://localhost:3000/api'; // dipakai hanya saat DEV
  const USE_PROXY = /^(localhost|127\.|10\.|192\.168\.)/.test(location.hostname);

  // ======== UTIL UI (scoped) ========
  const sel = (s, root = document) => root.querySelector(s);
  function toast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.classList.add('show');
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
    });
  }

  // ======== TOKEN ========
  const saveToken  = (t) => localStorage.setItem('token', t);
  const getToken   = ()  => localStorage.getItem('token');
  const clearToken = ()  => localStorage.removeItem('token');

  // ======== TRANSPORTS ========

  // DEV: fetch via Node proxy
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

  // PROD: JSONP (GET) dengan callback tetap + queue
  window.__jsonpQueue = window.__jsonpQueue || [];
  window.__jsonp_cb = window.__jsonp_cb || function (data) {
    const next = window.__jsonpQueue.shift();
    if (typeof next === 'function') next(data);
  };

  function callViaJsonp(params, { timeout = 60000 } = {}) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + '_' + Math.random().toString(36).slice(2);
      const all = { ...params, callback: '__jsonp_cb', _ts: id }; // cache buster

      // bangun URL
      const qs = Object.entries(all)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');

      // buat <script> lebih dulu supaya bisa direferensikan di cleanup()
      const s = document.createElement('script');
      s.src = `${GAS_URL}?${qs}`;
      s.async = true;

      let done = false;
      const cleanup = () => {
        if (done) return;
        done = true;
        clearTimeout(to);
        try { s.remove(); } catch (_) {}
      };

      // log untuk debug (boleh hapus nanti)
      // console.log('[jsonp] url:', s.src);

      // antre callback agar aman jika ada beberapa request berurutan
      window.__jsonpQueue.push((data) => { cleanup(); resolve(data); });

      s.onerror = () => { 
        // console.log('[jsonp] onerror for:', s.src);
        cleanup(); 
        reject(new Error('JSONP network error')); 
      };

      const to = setTimeout(() => { cleanup(); reject(new Error('JSONP timeout')); }, timeout);

      document.head.appendChild(s);
    });
  }

  // ======== API WRAPPERS ========
  const apiRegister = (email, password) =>
    USE_PROXY ? callViaProxy({ action: 'register', email, password })
              : callViaJsonp({ action: 'register', email, password });

  const apiLogin = (email, password) =>
    USE_PROXY ? callViaProxy({ action: 'login', email, password })
              : callViaJsonp({ action: 'login', email, password });

  const apiMe = (token) =>
    USE_PROXY ? callViaProxy({ action: 'me', auth: token })
              : callViaJsonp({ action: 'me', auth: token });

  // ======== EXPOSE GLOBAL ========
  window.Auth = { apiRegister, apiLogin, apiMe, saveToken, getToken, clearToken, $: sel, toast };
})();
