function renderSuperAdminDashboard() {
  showLoading();
  apiGet('/dashboard/super-admin').then(data => {
    const { cards, charts, recentAdmins, recentEvent } = data;
    document.getElementById('page-content').innerHTML = `
      <div>
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">${Auth.user && Auth.user.role === 'super_user' ? 'Super User Dashboard' : 'Program Manager Dashboard'}</h1>
        <p class="text-sm text-slate-400 mt-1">System overview and analytics</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/super-admin/events')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-amber-50">📅</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.totalEvents}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">Total Events</div></div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/super-admin/staff')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-emerald-50">👤</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.totalStaff}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">Total Officials</div></div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/super-admin/admins')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-blue-50">👥</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.totalAdmins}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">Total Team Leaders</div></div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/super-admin/teams')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-blue-50">👥</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.activeTeams}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">Active Teams</div></div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/super-admin/roles')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-amber-50">🔖</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.totalRoles}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">Total Roles</div></div>
      </div>
      ${recentEvent ? `
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Recent Event: ${escapeHtml(recentEvent.event_name)}</h2></div>
        <div style="padding:0 16px 16px;font-size:0.9rem;color:var(--text-light)">
          ${recentEvent.venue ? 'Venue: ' + escapeHtml(recentEvent.venue) + ' &middot; ' : ''}
          ${recentEvent.event_date ? 'Date: ' + recentEvent.event_date : ''}
          ${recentEvent.start_time ? ' &middot; ' + recentEvent.start_time + (recentEvent.end_time ? ' - ' + recentEvent.end_time : '') : ''}
        </div>
        ${recentEvent.teams && recentEvent.teams.length ? `
        <div class="overflow-x-auto">
          <table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Team</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Members</th></tr></thead><tbody>
            ${recentEvent.teams.map(t => `<tr><td data-label="Team" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(t.team_name)}</td><td data-label="Members" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${t.member_count}</td></tr>`).join('')}
          </tbody></table>
        </div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No teams created for this event yet</p></div>'}
      </div>` : ''}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-7">
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Officials Per Event</h2></div>
          <div class="h-48 md:h-[300px] relative">${renderSimpleBarChart(charts.staffPerEvent, 'event_name', 'count')}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Officials Per Role</h2></div>
          <div class="h-48 md:h-[300px] relative">${renderSimpleBarChart(charts.staffPerRole, 'name', 'count')}</div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Recent Team Leaders</h2></div>
        ${recentAdmins.length ? `<div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Username</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Email</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Status</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Created</th></tr></thead><tbody>
          ${recentAdmins.map(a => `<tr><td data-label="Name" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(a.fullname)}</td><td data-label="Username" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(a.username)}</td><td data-label="Email" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(a.email)}</td><td data-label="Status" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${getStatusBadge(a.status)}</td><td data-label="Created" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${a.created_at}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No team leaders yet</p></div>'}
      </div>
    `;
  }).catch(err => showError(err.message));
}

function renderSimpleBarChart(data, labelKey, valueKey) {
  if (!data || !data.length) return '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No data</p></div>';
  const maxVal = Math.max(...data.map(d => parseInt(d[valueKey] || 0)));
  const bars = data.map(d => {
    const pct = maxVal ? (parseInt(d[valueKey] || 0) / maxVal * 100) : 0;
    const label = escapeHtml(d[labelKey] || '');
    return `
      <div style="display:flex;align-items:center;margin-bottom:6px;font-size:0.8rem">
        <div style="width:100px;text-align:right;padding-right:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${label}</div>
        <div style="flex:1;background:#e2e8f0;border-radius:4px;height:20px;position:relative">
          <div style="background:var(--primary);height:20px;border-radius:4px;width:${pct}%;transition:width 0.3s"></div>
        </div>
        <div style="width:30px;text-align:right;padding-left:8px;font-weight:600">${d[valueKey]}</div>
      </div>
    `;
  }).join('');
  return `<div style="padding:8px">${bars}</div>`;
}
