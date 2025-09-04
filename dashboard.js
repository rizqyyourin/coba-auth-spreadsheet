// wajibkan login
Guard.requireAuth('/login.html');

(async () => {
  try{
    const t = Auth.getToken();
    const me = await Auth.apiMe(t);
    const name = (me && me.user && (me.user.name || me.user.email)) || 'User';
    document.querySelector('#greet').textContent = `Halo, ${name}`;
  }catch{
    Guard.redirectToLogin('/login.html');
  }
})();
