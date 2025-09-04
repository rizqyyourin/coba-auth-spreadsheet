// nav.js — navbar responsif + dropdown user + state aktif
(() => {
  const root = document.getElementById('app-nav');
  if (!root) return;

  const PATH = location.pathname.replace(/\/+$/, '');
  const isActive = (href) => {
    const u = new URL(href, location.origin);
    return PATH === u.pathname.replace(/\/+$/, '');
  };

  const iconMenu = `
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v2H4zm0 5.5h16v2H4zM4 17h16v2H4z"></path>
    </svg>`;
  const iconLogout = `
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 17l5-5-5-5v3H9v4h7v3zM4 5h7V3H4a2 2 0 00-2 2v14a2 2 0 002 2h7v-2H4V5z"></path>
    </svg>`;

  const tpl = (state) => {
    const loggedIn = !!state.user;
    const name = loggedIn ? (state.user.name || state.user.email || 'User') : '';
    return `
      <nav class="nv">
        <div class="nv__in container">
          <a href="./index.html" class="nv__brand">
            <span class="nv__logo">✦</span>
            <span class="nv__title">Blog</span>
          </a>

          <button class="nv__hamb" id="nvHamb" aria-label="Buka menu" aria-expanded="false">${iconMenu}</button>

          <div class="nv__links" id="nvLinks" data-open="false">
            <a class="nv__link ${isActive('./index.html') ? 'is-active':''}" href="./index.html">Beranda</a>
            <a class="nv__link" href="./index.html#artikel">Artikel</a>
            ${loggedIn ? `<a class="nv__link ${isActive('./dashboard.html') ? 'is-active':''}" href="./dashboard.html">Dashboard</a>` : ''}
          </div>

          <div class="nv__auth">
            ${loggedIn ? `
              <div class="nv__user">
                <button class="nv__userBtn" id="nvUserBtn" aria-haspopup="menu" aria-expanded="false">
                  <span class="nv__avatar">${name.slice(0,1).toUpperCase()}</span>
                  <span class="nv__uname">${name}</span>
                </button>
                <div class="nv__menu" id="nvMenu" role="menu">
                  <a role="menuitem" class="nv__menuItem" href="./dashboard.html">Dashboard</a>
                  <button role="menuitem" class="nv__menuItem" id="nvLogout">${iconLogout}Keluar</button>
                </div>
              </div>
            ` : `
              <a class="btn btn--lite" href="./login.html">Login / Register</a>
            `}
          </div>
        </div>
      </nav>
    `;
  };

  async function getUser(){
    try{
      const t = window.Auth?.getToken?.();
      if (!t) return null;
      const me = await window.Auth.apiMe(t);
      if (me && me.user) return me.user;
    }catch{}
    return null;
  }

  async function render(){
    const user = await getUser();
    root.innerHTML = tpl({ user });
    bind(user);
  }

  function bind(user){
    // hamburger
    const hamb = document.getElementById('nvHamb');
    const links = document.getElementById('nvLinks');
    if (hamb && links){
      hamb.onclick = () => {
        const open = links.getAttribute('data-open') === 'true';
        links.setAttribute('data-open', String(!open));
        hamb.setAttribute('aria-expanded', String(!open));
      };
    }

    // dropdown user
    const btn = document.getElementById('nvUserBtn');
    const menu = document.getElementById('nvMenu');
    if (btn && menu){
      const toggle = (open) => {
        menu.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      };
      let opened = false;

      btn.onclick = (e) => { e.stopPropagation(); opened = !opened; toggle(opened); };
      document.addEventListener('click', () => { if (opened){ opened = false; toggle(false); } });
      menu.addEventListener('click', (e)=> e.stopPropagation());
    }

    // logout
    const out = document.getElementById('nvLogout');
    if (out){
      out.onclick = async () => {
        window.Auth?.clearToken?.();
        await window.Auth?.toast?.('Anda telah logout.','ok');
        location.href = './index.html';
      };
    }
  }

  render();
})();
