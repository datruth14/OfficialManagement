function toggleSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  document.body.classList.toggle('sidebar-open', open);
}

function setupMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const overlay = document.getElementById('sidebarOverlay');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      toggleSidebar(!sidebar.classList.contains('open'));
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => toggleSidebar(false));
  }
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.style.display = '';
  if (!Auth.isLoggedIn()) {
    sidebar.innerHTML = '';
    return;
  }

  const user = Auth.user;
  const isSuper = Auth.isSuperAdmin();
  const navLinks = isSuper
    ? [
        { href: '#/super-admin/dashboard', label: 'Dashboard', icon: 'grid' },
        { href: '#/super-admin/admins', label: 'Team Leaders', icon: 'shield' },
        { href: '#/super-admin/events', label: 'Events', icon: 'calendar' },
        { href: '#/super-admin/staff', label: 'Officials', icon: 'users' },
        { href: '#/super-admin/teams', label: 'Teams', icon: 'users' },
        { href: '#/super-admin/roles', label: 'Roles', icon: 'tag' },
      ]
    : [
        { href: '#/admin/dashboard', label: 'Dashboard', icon: 'grid' },
        { href: '#/admin/events', label: 'Events', icon: 'calendar' },
        { href: '#/admin/staff', label: 'Officials', icon: 'users' },
        { href: '#/admin/roles', label: 'Roles', icon: 'tag' },
        { href: '#/admin/teams', label: 'Teams', icon: 'users' },
      ];

  const icons = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  };

  const initials = user.fullname ? user.fullname.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  let navHtml = navLinks.map(l =>
    `<a href="${l.href}" onclick="return Router.navigate('${l.href.slice(1)}')">
      <span class="nav-icon">${icons[l.icon] || ''}</span> ${l.label}
    </a>`
  ).join('');

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-logo">S</div>
      <span class="brand-text">Official Management</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Navigation</div>
      ${navHtml}
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">${initials}</div>
        <div class="user-details">
          <div class="name">${escapeHtml(user.fullname)}</div>
          <div class="role">${user.role === 'super_admin' ? 'PROGRAM MANAGER' : user.role === 'super_user' ? 'SUPER USER' : 'TEAM LEADER'}</div>
        </div>
      </div>
      <button class="btn-logout" onclick="Auth.logout()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Logout
      </button>
    </div>
  `;

  const hash = Router.getCurrentHash();
  sidebar.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === '#' + hash) a.classList.add('active');
  });
}

function showLoading() {
  document.getElementById('page-content').innerHTML = '<div class="loading"><div class="spinner"></div><p style="margin-top:12px;color:var(--text-light)">Loading...</p></div>';
}

function showError(msg) {
  document.getElementById('page-content').innerHTML = `<div class="alert alert-error">${msg}</div>`;
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getStatusBadge(status) {
  return status === 'active'
    ? '<span class="badge badge-active">Active</span>'
    : '<span class="badge badge-inactive">Inactive</span>';
}

function renderWelcomePage() {
  const app = document.getElementById('app');
  app.classList.add('login-mode');
  const mc = document.getElementById('mainContent');
  if (mc) mc.classList.add('login-mode');
  const sb = document.getElementById('sidebar');
  if (sb) { sb.innerHTML = ''; sb.style.display = 'none'; }

  document.getElementById('page-content').innerHTML = `
    <div class="portal-page">
      <div class="portal-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="portal-header">
        <div class="portal-brand">
          <svg width="40" height="40" viewBox="0 0 72 72" fill="none">
            <rect width="72" height="72" rx="18" fill="#f59e0b"/>
            <path d="M36 20c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zM18 50c0-4.67 10-7 18-7s18 2.33 18 7v4H18v-4z" fill="#0f172a"/>
          </svg>
          <div>
            <h1>Software Portal</h1>
            <p>Select an application to launch</p>
          </div>
        </div>
      </div>
      <div class="portal-grid">
        <div class="portal-card" onclick="Router.navigate('/login')">
          <div class="portal-card-icon">
            <svg width="40" height="40" viewBox="0 0 72 72" fill="none">
              <rect width="72" height="72" rx="16" fill="url(#g1)"/>
              <path d="M36 20c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zM18 50c0-4.67 10-7 18-7s18 2.33 18 7v4H18v-4z" fill="#0f172a"/>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="72" y2="72"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#d97706"/></linearGradient></defs>
            </svg>
          </div>
          <div class="portal-card-body">
            <h3>Official Management Portal</h3>
            <p>Manage staff, events, teams, roles, and track organizational activities.</p>
          </div>
          <div class="portal-card-footer">
            <span class="btn btn-primary btn-sm">Launch</span>
          </div>
        </div>
      </div>
      <p class="portal-footer">© 2026 Software Portal. All rights reserved.</p>
    </div>
  `;
}

function registerRoutes() {
  Router.register('/welcome', renderWelcomePage);
  Router.register('/login', renderLoginPage);
  Router.register('/admin/dashboard', renderAdminDashboard);
  Router.register('/admin/events', renderAdminEvents);
  Router.register('/admin/staff', renderAdminStaff);
  Router.register('/admin/roles', renderAdminRoles);
  Router.register('/admin/teams', renderAdminTeams);
  Router.register('/super-admin/dashboard', renderSuperAdminDashboard);
  Router.register('/super-admin/admins', renderSuperAdminAdmins);
  Router.register('/super-admin/events', renderSuperAdminEvents);
  Router.register('/super-admin/staff', renderSuperAdminStaff);
  Router.register('/super-admin/roles', renderSuperAdminRoles);
  Router.register('/super-admin/teams', renderSuperAdminTeams);
}

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  registerRoutes();
  renderSidebar();
  Router.init();
  setupMobileNav();
  window.addEventListener('hashchange', () => toggleSidebar(false));
});
