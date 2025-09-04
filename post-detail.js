(() => {
  const GAS_URL = window.__GAS_URL_OVERRIDE__ || 'https://script.google.com/macros/s/AKfycbw-VDlk2p-iPWeepK443VXvju5ENvxA3KQpz_fbD5zX5yKya09Z0UKYNN1eMeIvEB9N/exec';

  function jsonp(params, { timeout=30000 } = {}){
    return new Promise((resolve, reject) => {
      const id = Date.now() + '_' + Math.random().toString(36).slice(2);
      const all = { ...params, callback:'__jsonp_cb', _ts:id };
      const qs = Object.entries(all).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');

      window.__jsonpQueue = window.__jsonpQueue || [];
      window.__jsonp_cb = window.__jsonp_cb || function(d){ const n=window.__jsonpQueue.shift(); if(typeof n==='function') n(d); };

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

  function esc(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  (async function init(){
    const p = new URL(location.href).searchParams;
    const slug = p.get('slug') || '';
    if (!slug){
      if (window.Auth && Auth.toast) await Auth.toast('Artikel tidak ditemukan.','err');
      location.href = './index.html';
      return;
    }
    try{
      const res = await jsonp({ action:'posts.get', slug });
      if (res.error) throw new Error(res.error);

      document.title = esc(res.title || 'Artikel');
      document.querySelector('#title').textContent = res.title || '(Tanpa judul)';
      const d = res.created_at ? new Date(res.created_at) : null;
      const dstr = d && !isNaN(d) ? d.toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'}) : '';
      document.querySelector('#meta').textContent = `${res.author_name || 'Anon'}${dstr ? ' • ' + dstr : ''}`;
      document.querySelector('#content').innerText = res.content || '';
    }catch(e){
      if (window.Auth && Auth.toast) await Auth.toast('Gagal memuat artikel: ' + e.message, 'err');
      location.href = './index.html';
    }
  })();
})();
