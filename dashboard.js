(() => {
  const { $: q, toast, apiMe, getToken, clearToken } = window.Auth;

  (async function init(){
    const token = getToken();
    console.log('[dashboard] token:', token ? token.slice(0, 24) + '...' : token);
    if (!token) { 
      console.warn('[dashboard] no token → redirect');
      location.href = './index.html'; 
      return; 
    }
    try{
      const me = await apiMe(token);
      console.log('[dashboard] me result:', me);
      if (me && me.ok && me.user && me.user.email) {
        q('#greet').textContent = `Halo, ${me.user.email}`;
        return;
      }
      const errMsg = (me && (me.error || me.raw)) || 'Unknown error';
      throw new Error(errMsg);
    } catch(e){
      console.error('[dashboard] apiMe error:', e);
      clearToken();
      toast('Sesi berakhir. Silakan login lagi.','err');
      location.href = './index.html';
    }
  })();

  const btn = document.querySelector('#btnLogout');
  if (btn) btn.onclick = () => {
    clearToken();
    location.href = './index.html';
  };
})();
