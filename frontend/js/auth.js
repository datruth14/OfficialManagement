const Auth = {
  user: null,

  async init() {
    try {
      const res = await apiGet('/auth/me');
      this.user = res;
    } catch {
      this.user = null;
    }
  },

  isLoggedIn() {
    return !!this.user;
  },

  isSuperAdmin() {
    return this.user && (this.user.role === 'super_admin' || this.user.role === 'super_user');
  },

  getRole() {
    return this.user ? this.user.role : null;
  },

  async login(username, password) {
    const res = await apiPost('/auth/login', { username, password });
    this.user = res.user;
    return res;
  },

  async logout() {
    try {
      await apiPost('/auth/logout');
    } catch {}
    this.user = null;
    window.location.hash = '#/login';
  },
};
