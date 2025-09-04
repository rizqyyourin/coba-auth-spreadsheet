(() => {
  const { $: q, toast, apiMe, getToken, clearToken } = window.Auth;

  (async function init(){
    const token = getToken();
    if (!token) { location.href = './login.html'; return; }
    try{
      const me = await apiMe(token);
      if (me.error) throw new Error(me.error);
      q('#greet').textContent = `Halo, ${me.user.email}`;
    } catch(e){
      clearToken();
      toast('Sesi berakhir. Silakan login lagi.','err');
      location.href = './login.html';
    }
  })();

  q('#btnLogout').onclick = () => {
    clearToken();
    location.href = './login.html';
  };
})();
