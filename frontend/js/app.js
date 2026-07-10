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
    `<a href="${l.href}" onclick="return Router.navigate('${l.href.slice(1)}')" class="flex items-center gap-3 px-3.5 py-2.5 text-white/55 transition-all duration-150 text-sm rounded-[6px] my-0.5 no-underline hover:bg-sidebar-hover hover:text-slate-200">
      <span class="w-5 h-5 shrink-0 opacity-50 flex items-center justify-center">${icons[l.icon] || ''}</span> ${l.label}
    </a>`
  ).join('');

  sidebar.innerHTML = `
    <div class="flex items-center gap-3 px-6 pb-5 pt-6 border-b border-white/10">
      <div class="w-9 h-9 bg-gradient-to-br from-brand to-brand-dark rounded-[6px] flex items-center justify-center text-sm text-slate-900 font-bold shrink-0">S</div>
      <span class="text-sm font-bold text-slate-200 tracking-tight">Official Management</span>
    </div>
    <nav class="flex-1 px-3 py-2 overflow-y-auto">
      <div class="text-[0.65rem] font-bold uppercase tracking-wider text-white/25 px-3 pt-4 pb-1.5">Navigation</div>
      ${navHtml}
    </nav>
    <div class="px-5 py-4 border-t border-white/10">
      <div class="flex items-center gap-3 mb-3.5">
        <div class="w-9 h-9 bg-gradient-to-br from-brand to-brand-dark rounded-[6px] flex items-center justify-center text-sm text-slate-900 font-bold shrink-0">${initials}</div>
        <div class="min-w-0">
          <div class="text-slate-200 font-semibold text-sm truncate">${escapeHtml(user.fullname)}</div>
          <div class="text-white/35 text-[0.7rem] uppercase tracking-wide mt-0.5">${user.role === 'super_admin' ? 'PROGRAM MANAGER' : user.role === 'super_user' ? 'SUPER USER' : 'TEAM LEADER'}</div>
        </div>
      </div>
      <button class="w-full py-2 bg-red-500/10 text-red-300 border-none rounded-[6px] cursor-pointer text-xs transition-all duration-150 flex items-center justify-center gap-1.5 font-medium hover:bg-red-500/20" onclick="Auth.logout()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Logout
      </button>
    </div>
  `;

  const hash = Router.getCurrentHash();
  sidebar.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === '#' + hash) {
      a.classList.add('bg-brand/10', 'text-brand-light', 'font-semibold');
      const icon = a.querySelector('span');
      if (icon) { icon.classList.remove('opacity-50'); icon.classList.add('opacity-100', 'text-brand-light'); }
    }
  });
}

function showLoading() {
  document.getElementById('page-content').innerHTML = '<div class="text-center py-16 md:py-20 text-slate-400"><div class="spinner"></div><p class="mt-3 text-sm">Loading...</p></div>';
}

function showError(msg) {
  document.getElementById('page-content').innerHTML = `<div class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200">${msg}</div>`;
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
    ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Active</span>'
    : '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">Inactive</span>';
}

function renderWelcomePage() {
  const app = document.getElementById('app');
  app.classList.add('login-mode');
  const mc = document.getElementById('mainContent');
  if (mc) mc.classList.add('login-mode');
  const sb = document.getElementById('sidebar');
  if (sb) { sb.innerHTML = ''; sb.style.display = 'none'; }

  document.getElementById('page-content').innerHTML = `
    <div class="min-h-dvh bg-gradient-to-br from-[#0f172a] via-[#1e293b] via-[#334155] to-[#0f172a] relative overflow-hidden flex flex-col">
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="relative z-10 px-4 md:px-12 pt-6 md:pt-10 pb-3 md:pb-5">
        <div class="flex items-center gap-3 md:gap-4">
          <svg width="32" height="32" viewBox="0 0 72 72" fill="none" class="md:w-10 md:h-10 drop-shadow-[0_8px_24px_rgba(245,158,11,0.35)]">
            <rect width="72" height="72" rx="18" fill="#f59e0b"/>
            <path d="M36 20c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zM18 50c0-4.67 10-7 18-7s18 2.33 18 7v4H18v-4z" fill="#0f172a"/>
          </svg>
          <div>
            <h1 class="text-lg md:text-xl font-bold text-slate-100 mb-0.5">Software Portal</h1>
            <p class="text-xs md:text-sm text-white/40">Select an application to launch</p>
          </div>
        </div>
      </div>
      <div class="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 px-4 md:px-12 pb-6 md:pb-10 max-w-5xl mx-auto w-full">
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-7 cursor-pointer transition-all duration-250 flex flex-col hover:bg-white/10 hover:border-brand/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 active:-translate-y-0.5" onclick="Router.navigate('/login')">
          <div class="mb-3 md:mb-4">
            <svg width="32" height="32" viewBox="0 0 72 72" fill="none" class="md:w-10 md:h-10 drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
              <rect width="72" height="72" rx="16" fill="url(#g1)"/>
              <path d="M36 20c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zM18 50c0-4.67 10-7 18-7s18 2.33 18 7v4H18v-4z" fill="#0f172a"/>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="72" y2="72"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#d97706"/></linearGradient></defs>
            </svg>
          </div>
          <div>
            <h3 class="text-sm md:text-base font-semibold text-slate-100 mb-1.5 md:mb-2">Official Management Portal</h3>
            <p class="text-xs md:text-sm text-white/45 leading-relaxed">Manage staff, events, teams, roles, and track organizational activities.</p>
          </div>
          <div class="mt-3 md:mt-5">
            <span class="inline-flex items-center gap-1.5 px-4 py-1.5 md:px-5 md:py-2 bg-brand/15 text-white/80 text-xs md:text-sm font-medium rounded-full border-none transition-all duration-200 hover:bg-gradient-to-r hover:from-brand hover:to-brand-dark hover:text-slate-900">Launch</span>
          </div>
        </div>
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-7 flex flex-col opacity-70">
          <div class="mb-3 md:mb-4">
            <svg width="32" height="32" viewBox="0 0 72 72" fill="none" class="md:w-10 md:h-10 drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
              <rect width="72" height="72" rx="16" fill="url(#g2)"/>
              <path d="M22 48V28l14-8 14 8v20l-14 8-14-8z" stroke="#0f172a" stroke-width="3" fill="none"/>
              <circle cx="36" cy="38" r="6" fill="#0f172a"/>
              <defs><linearGradient id="g2" x1="0" y1="0" x2="72" y2="72"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#d97706"/></linearGradient></defs>
            </svg>
          </div>
          <div>
            <h3 class="text-sm md:text-base font-semibold text-slate-100 mb-1.5 md:mb-2">Budget Management</h3>
            <p class="text-xs md:text-sm text-white/45 leading-relaxed">Track budgets, expenses, and financial reports across departments.</p>
          </div>
          <div class="mt-3 md:mt-5">
            <span class="inline-flex items-center gap-1.5 px-4 py-1.5 md:px-5 md:py-2 bg-white/10 text-white/50 text-xs md:text-sm font-medium rounded-full border border-dashed border-white/20">Coming Soon</span>
          </div>
        </div>
      </div>
      <p class="relative z-10 text-center text-[0.7rem] md:text-xs text-white/15 px-4 pb-6 md:pb-8 pt-3 md:pt-5">© 2026 Software Portal. All rights reserved.</p>
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
