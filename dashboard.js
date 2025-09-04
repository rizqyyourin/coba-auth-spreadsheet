(() => {
  const { $: q, toast, apiMe, getToken, clearToken } = window.Auth;

  (async function init(){
    const token = getToken();
    if (!token) { location.href = './index.html'; return; }
    try{
      const me = await apiMe(token);
      if (me && me.ok && me.user) {
        const name = me.user.name || me.user.username || me.user.email;
        q('#greet').textContent = `Halo, ${name}`;
        return;
      }
      const errMsg = (me && (me.error || me.raw)) || 'Unknown error';
      throw new Error(errMsg);
    } catch(e){
      clearToken();
      await toast('Sesi berakhir. Silakan login lagi.','err');
      location.href = './index.html';
    }
  })();

  const btn = document.querySelector('#btnLogout');
  if (btn) btn.onclick = async () => {
    clearToken();
    await toast('Anda telah logout.','ok');
    location.href = './index.html';
  };
})();
