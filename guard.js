window.Guard = {
  isAuthed(){ return !!(window.Auth && Auth.getToken && Auth.getToken()); },
  requireAuth(loginPath = '/login.html'){
    if (!this.isAuthed()){
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = `${loginPath}?next=${next}`;
    }
  },
  redirectToLogin(loginPath = '/login.html'){
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = `${loginPath}?next=${next}`;
  }
};
