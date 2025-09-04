(() => {
  const $ = (s, r=document) => r.querySelector(s);
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

  async function apiPostsList({ q, page, limit }){
    return jsonp({ action:'posts.list', q:q||'', page:String(page||1), limit:String(limit||6) });
  }

  const state = { page:1, limit:6, q:'' };

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function renderItems(items){
    const list = $('#list'); list.innerHTML = '';
    if (!items || !items.length){
      list.innerHTML = `<div class="empty muted">Tidak ada artikel.</div>`;
      return;
    }
    for (const it of items){
      const card = document.createElement('article');
      card.className = 'blog-card';
      const d = it.created_at ? new Date(it.created_at) : null;
      const dstr = d && !isNaN(d) ? d.toLocaleDateString('id-ID',{year:'numeric',month:'short',day:'numeric'}) : '';
      card.innerHTML = `
        <a class="blog-title" href="./post.html?slug=${encodeURIComponent(it.slug)}">${escapeHtml(it.title)}</a>
        <p class="blog-excerpt">${escapeHtml(it.excerpt || '')}</p>
        <div class="blog-meta">
          <span>${it.author_name ? escapeHtml(it.author_name) : 'Anon'}</span>
          ${dstr ? `<span>• ${dstr}</span>` : ''}
        </div>`;
      list.appendChild(card);
    }
  }

  async function load(){
    try{
      const res = await apiPostsList(state);
      if (res.error) throw new Error(res.error);
      renderItems(res.items||[]);
      $('#pageInfo').textContent = `Hal ${res.page||state.page} dari ${res.total_pages||1}`;
      $('#prev').disabled = (res.page||1) <= 1;
      $('#next').disabled = (res.page||1) >= (res.total_pages||1);
    }catch(e){
      if (window.Auth && Auth.toast) await Auth.toast('Gagal memuat artikel: ' + e.message, 'err');
      else alert('Gagal memuat artikel: ' + e.message);
    }
  }

  $('#btnSearch').onclick = () => { state.q = $('#q').value.trim(); state.page = 1; load(); };
  $('#prev').onclick = () => { if (state.page > 1){ state.page--; load(); } };
  $('#next').onclick = () => { state.page++; load(); };

  const url = new URL(location.href);
  state.q = url.searchParams.get('q') || '';
  $('#q').value = state.q;
  load();
})();
