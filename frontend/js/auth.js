const Auth = {
  user: null,
  token: null,

  init() {
    this.token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      try { this.user = JSON.parse(userData); } catch { this.user = null; }
    }
  },

  isLoggedIn() {
    return !!this.token && !!this.user;
  },

  isSuperAdmin() {
    return this.user && (this.user.role === 'super_admin' || this.user.role === 'super_user');
  },

  getRole() {
    return this.user ? this.user.role : null;
  },

  async login(username, password) {
    const res = await apiPost('/auth/login', { username, password });
    this.token = res.token;
    this.user = res.user;
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res;
  },

  async fetchMe() {
    try {
      const res = await apiGet('/auth/me');
      this.user = res;
      localStorage.setItem('user', JSON.stringify(res));
      return res;
    } catch {
      this.logout();
      return null;
    }
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#/login';
  },
};
