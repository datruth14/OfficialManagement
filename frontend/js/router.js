const Router = {
  routes: {},
  currentHash: '',

  register(hash, handler) {
    this.routes[hash] = handler;
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  getCurrentHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return '/welcome';
    return hash;
  },

  handleRoute() {
    const hash = this.getCurrentHash();

    if (!Auth.isLoggedIn() && hash !== '/login' && hash !== '/welcome') {
      this.navigate('/login');
      return;
    }

    if (Auth.isLoggedIn() && hash === '/login') {
      const role = Auth.getRole();
      this.navigate(role === 'super_admin' || role === 'super_user' ? '/super-admin/dashboard' : '/admin/dashboard');
      return;
    }

    if (Auth.isLoggedIn()) {
      document.getElementById('mainContent')?.classList.remove('login-mode');
      const role = Auth.getRole();
      if (hash.startsWith('/super-admin') && role !== 'super_admin' && role !== 'super_user') {
        this.navigate('/admin/dashboard');
        return;
      }
      if (hash.startsWith('/admin') && role !== 'admin') {
        this.navigate('/super-admin/dashboard');
        return;
      }
    }

    const handler = this.routes[hash];
    if (handler) {
      this.currentHash = hash;
      handler();
      if (typeof renderSidebar === 'function') renderSidebar();
    } else {
      document.getElementById('page-content').innerHTML =
        '<div class="loading"><h2>Page not found</h2></div>';
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },
};
window.Router = Router;
