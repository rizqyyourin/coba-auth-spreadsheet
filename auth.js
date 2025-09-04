// === KONFIG ===
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw-VDlk2p-iPWeepK443VXvju5ENvxA3KQpz_fbD5zX5yKya09Z0UKYNN1eMeIvEB9N/exec';
window.__GAS_URL_OVERRIDE__ = GAS_URL; // untuk modul lain

// === UTIL DOM & TOAST ===
function $(s, root=document){ return root.querySelector(s); }
async function toast(msg, type='info'){
  const t = document.createElement('div');
  t.className = `toast ${type==='ok'?'ok': type==='err'?'err':''}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=>{ t.classList.add('show'); });
  await new Promise(r=>setTimeout(r, 2200));
  t.classList.remove('show');
  await new Promise(r=>setTimeout(r, 200));
  t.remove();
}

// === TOKEN ===
function saveToken(t){ localStorage.setItem('token', t); }
function getToken(){ return localStorage.getItem('token'); }
function clearToken(){ localStorage.removeItem('token'); }

// === JSONP (queue-safe) ===
window.__jsonpQueue = window.__jsonpQueue || [];
window.__jsonp_cb = window.__jsonp_cb || function(d){
  const next = window.__jsonpQueue.shift();
  if (typeof next === 'function') next(d);
};
function jsonp(params, { timeout=30000 } = {}){
  return new Promise((resolve, reject) => {
    const id = Date.now() + '_' + Math.random().toString(36).slice(2);
    const all = { ...params, callback:'__jsonp_cb', _ts:id };
    const qs = Object.entries(all).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    const script = document.createElement('script');
    script.src = `${GAS_URL}?${qs}`; script.async = true;

    let done=false, to;
    const cleanup=()=>{ if(done) return; done=true; clearTimeout(to); try{script.remove();}catch{} };
    window.__jsonpQueue.push((data)=>{ cleanup(); resolve(data); });
    script.onerror = ()=>{ cleanup(); reject(new Error('JSONP network error')); };
    to = setTimeout(()=>{ cleanup(); reject(new Error('JSONP timeout')); }, timeout);

    document.head.appendChild(script);
  });
}

// === API AUTH ===
async function apiRegister(username, email, password){
  return jsonp({ action:'register', username, email, password });
}
async function apiLogin(email, password){
  return jsonp({ action:'login', email, password });
}
async function apiMe(token){
  return jsonp({ action:'me', auth: token });
}

// expose global
window.Auth = { $, toast, saveToken, getToken, clearToken, apiRegister, apiLogin, apiMe };
