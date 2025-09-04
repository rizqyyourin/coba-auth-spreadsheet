// ---- guard agar file tidak dieksekusi dua kali ----
if (window.__APP_INIT__) {
  console.warn('[app] app.js already loaded; skipping re-init');
} else {
  window.__APP_INIT__ = true;

// CONFIG: URL EXEC GAS (biarkan di window agar tidak redeclare saat reload)
window.GAS_URL = window.GAS_URL || 'https://script.google.com/macros/s/AKfycbw-VDlk2p-iPWeepK443VXvju5ENvxA3KQpz_fbD5zX5yKya09Z0UKYNN1eMeIvEB9N/exec';

// DOM & UTIL
function $(s, root=document){ return root.querySelector(s); }
function esc(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
async function toast(msg, type='info'){
  const t = document.createElement('div');
  t.className = `toast ${type==='ok'?'ok':type==='err'?'err':''}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=> t.classList.add('show'));
  await new Promise(r=>setTimeout(r,2000));
  t.classList.remove('show'); await new Promise(r=>setTimeout(r,180)); t.remove();
}
function showLoader(msg='Memuat...'){
  let el = document.getElementById('__ldr__');
  if(!el){
    el=document.createElement('div');
    el.id='__ldr__';
    el.style.cssText='position:fixed;inset:0;display:grid;place-items:center;background:rgba(255,255,255,.6);backdrop-filter:blur(2px);z-index:9999;opacity:0;transition:.15s';
    el.innerHTML = `<div style="background:#111;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.2)">${esc(msg)}</div>`;
    document.body.appendChild(el); requestAnimationFrame(()=> el.style.opacity = 1);
  } else { el.firstChild.textContent = msg; el.style.display='grid'; el.style.opacity=1; }
}
function hideLoader(){ const el=document.getElementById('__ldr__'); if(!el) return; el.style.opacity=0; setTimeout(()=> el.style.display='none',150); }

// TOKEN
const Auth = {
  saveToken: (t)=> localStorage.setItem('token', String(t||'')),
  getToken : ()=>{
    const t = localStorage.getItem('token'); if (!t) return null;
    const s = String(t).trim(); if (!s || s==='undefined' || s==='null') return null; return s;
  },
  clearToken: ()=> localStorage.removeItem('token'),
};
function looksLikeJwt(t){ if(!t) return false; const parts=String(t).split('.'); return parts.length===3 && parts.every(p=>p.length>0); }

// JSONP (queue-safe)
window.__jsonpQueue = window.__jsonpQueue || [];
window.__jsonp_cb = window.__jsonp_cb || function(d){ const fn = window.__jsonpQueue.shift(); if (typeof fn==='function') fn(d); };
function jsonp(params, { timeout=25000 } = {}){
  return new Promise((resolve, reject) => {
    const id = Date.now() + '_' + Math.random().toString(36).slice(2);
    const all = { ...params, callback:'__jsonp_cb', _ts:id };
    const qs  = Object.entries(all).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    const s   = document.createElement('script');
    s.src = `${window.GAS_URL}?${qs}`; s.async = true;

    // debug URL untuk /me
    if (params && params.action === 'me') {
      console.log('[jsonp] /me url:', s.src, 'len:', s.src.length);
    }

    let done=false, to;
    const cleanup=()=>{ if(done) return; done=true; clearTimeout(to); try{s.remove();}catch{} };
    window.__jsonpQueue.push((data)=>{ cleanup(); resolve(data); });
    s.onerror = ()=>{ cleanup(); reject(new Error('NETWORK_ERROR')); };
    to = setTimeout(()=>{ cleanup(); reject(new Error('TIMEOUT')); }, timeout);

    document.head.appendChild(s);
  });
}

// API
const API = {
  async register(username,email,password){ return jsonp({action:'register', username, email, password}); },
  async login(email,password){ return jsonp({action:'login', email, password}); },
  async me(token){
    return jsonp({
      action:'me',
      jwt: token,
      t: token,
      token: token,
      bearer: token,
      auth: token
    });
  },
  async postsList(q='',page=1,limit=6){ return jsonp({action:'posts.list', q, page:String(page), limit:String(limit)}); },
  async postsGet({slug,id}){ const p={action:'posts.get'}; if(slug) p.slug=slug; if(id) p.id=id; return jsonp(p); },
};

// expose
window.$=$; window.esc=esc; window.toast=toast; window.showLoader=showLoader; window.hideLoader=hideLoader;
window.Auth=Auth; window.API=API; window.looksLikeJwt=looksLikeJwt;

} // end guard __APP_INIT__
