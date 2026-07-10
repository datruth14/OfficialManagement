function renderAdminDashboard() {
  showLoading();
  apiGet('/dashboard/admin').then(data => {
    const { cards, upcomingEvents, recentTeams, recentStaff, recentEvent } = data;
    document.getElementById('page-content').innerHTML = `
      <div class="mb-6 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Team Leader Dashboard</h1>
        <p class="text-sm text-slate-400 mt-1">Welcome back, ${Auth.user.fullname}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/admin/events')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-amber-50">📅</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.myEvents}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">Active Events</div></div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/admin/staff')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-emerald-50">👤</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.myStaff}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">My Officials</div></div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/admin/teams')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-blue-50">👥</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.myTeams}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">My Teams</div></div>
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" onclick="Router.navigate('/admin/roles')"><div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-3.5"><div class="w-10 h-10 md:w-12 md:h-12 rounded-[10px] flex items-center justify-center shrink-0 bg-amber-50">🔖</div><div class="text-xl md:text-2xl font-bold text-slate-900 leading-none">${cards.myRoles}</div></div><div class="text-xs md:text-sm text-slate-400 font-medium">Roles</div></div>
      </div>
      ${recentEvent ? `
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Current Event: ${escapeHtml(recentEvent.event_name)}</h2></div>
        <div style="padding:0 16px 16px;font-size:0.9rem;color:var(--text-light)">
          ${recentEvent.venue ? 'Venue: ' + escapeHtml(recentEvent.venue) + ' &middot; ' : ''}
          ${recentEvent.event_date ? 'Date: ' + recentEvent.event_date : ''}
          ${recentEvent.start_time ? ' &middot; ' + recentEvent.start_time + (recentEvent.end_time ? ' - ' + recentEvent.end_time : '') : ''}
        </div>
        ${recentEvent.teams && recentEvent.teams.length ? `
        <div class="table-responsive">
          <table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Team</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Members</th></tr></thead><tbody>
            ${recentEvent.teams.map(t => `<tr><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(t.team_name)}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${t.member_count}</td></tr>`).join('')}
          </tbody></table>
        </div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No teams created for this event yet</p></div>'}
      </div>` : ''}
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Upcoming Events</h2></div>
        ${upcomingEvents.length ? `<div class="table-responsive"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Event</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Venue</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Date</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Staff</th></tr></thead><tbody>
          ${upcomingEvents.map(e => `<tr><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(e.event_name)}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(e.venue)}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.event_date}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.staff_count}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No upcoming events</p></div>'}
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Recent Teams</h2></div>
        ${recentTeams.length ? `<div class="table-responsive"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Team</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Event</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Members</th></tr></thead><tbody>
          ${recentTeams.map(t => `<tr><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(t.team_name)}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(t.event_name)}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${t.member_count}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No teams yet</p></div>'}
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5"><h2 class="text-base md:text-lg font-bold text-slate-900">Recent Officials</h2></div>
        ${recentStaff.length ? `<div class="table-responsive"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Email</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Status</th></tr></thead><tbody>
          ${recentStaff.map(s => `<tr><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(s.email)}</td><td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${getStatusBadge(s.status)}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No officials yet</p></div>'}
      </div>
    `;
  }).catch(err => showError(err.message));
}
