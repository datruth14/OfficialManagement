function renderSuperAdminDashboard() {
  showLoading();
  apiGet('/dashboard/super-admin').then(data => {
    const { cards, charts, recentAdmins, recentEvent } = data;
    document.getElementById('page-content').innerHTML = `
      <div class="main-header">
        <h1>${Auth.user && Auth.user.role === 'super_user' ? 'Super User Dashboard' : 'Program Manager Dashboard'}</h1>
        <p>System overview and analytics</p>
      </div>
      <div class="card-grid">
        <div class="stat-card" onclick="Router.navigate('/super-admin/events')"><div class="stat-top"><div class="icon purple">📅</div><div class="value">${cards.totalEvents}</div></div><div class="label">Total Events</div></div>
        <div class="stat-card" onclick="Router.navigate('/super-admin/staff')"><div class="stat-top"><div class="icon green">👤</div><div class="value">${cards.totalStaff}</div></div><div class="label">Total Officials</div></div>
        <div class="stat-card" onclick="Router.navigate('/super-admin/admins')"><div class="stat-top"><div class="icon blue">👥</div><div class="value">${cards.totalAdmins}</div></div><div class="label">Total Team Leaders</div></div>
        <div class="stat-card" onclick="Router.navigate('/super-admin/teams')"><div class="stat-top"><div class="icon blue">👥</div><div class="value">${cards.activeTeams}</div></div><div class="label">Active Teams</div></div>
        <div class="stat-card" onclick="Router.navigate('/super-admin/roles')"><div class="stat-top"><div class="icon amber">🔖</div><div class="value">${cards.totalRoles}</div></div><div class="label">Total Roles</div></div>
      </div>
      ${recentEvent ? `
      <div class="card">
        <div class="card-header"><h2>Recent Event: ${escapeHtml(recentEvent.event_name)}</h2></div>
        <div style="padding:0 16px 16px;font-size:0.9rem;color:var(--text-light)">
          ${recentEvent.venue ? 'Venue: ' + escapeHtml(recentEvent.venue) + ' &middot; ' : ''}
          ${recentEvent.event_date ? 'Date: ' + recentEvent.event_date : ''}
          ${recentEvent.start_time ? ' &middot; ' + recentEvent.start_time + (recentEvent.end_time ? ' - ' + recentEvent.end_time : '') : ''}
        </div>
        ${recentEvent.teams && recentEvent.teams.length ? `
        <div class="table-responsive">
          <table><thead><tr><th>Team</th><th>Members</th></tr></thead><tbody>
            ${recentEvent.teams.map(t => `<tr><td>${escapeHtml(t.team_name)}</td><td>${t.member_count}</td></tr>`).join('')}
          </tbody></table>
        </div>` : '<div class="empty-state"><p>No teams created for this event yet</p></div>'}
      </div>` : ''}
      <div class="chart-grid">
        <div class="card">
          <div class="card-header"><h3>Officials Per Event</h3></div>
          <div class="chart-container">${renderSimpleBarChart(charts.staffPerEvent, 'event_name', 'count')}</div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Officials Per Role</h3></div>
          <div class="chart-container">${renderSimpleBarChart(charts.staffPerRole, 'name', 'count')}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Recent Team Leaders</h2></div>
        ${recentAdmins.length ? `<div class="table-responsive"><table><thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Status</th><th>Created</th></tr></thead><tbody>
          ${recentAdmins.map(a => `<tr><td>${escapeHtml(a.fullname)}</td><td>${escapeHtml(a.username)}</td><td>${escapeHtml(a.email)}</td><td>${getStatusBadge(a.status)}</td><td>${a.created_at}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="empty-state"><p>No team leaders yet</p></div>'}
      </div>
    `;
  }).catch(err => showError(err.message));
}

function renderSimpleBarChart(data, labelKey, valueKey) {
  if (!data || !data.length) return '<div class="empty-state"><p>No data</p></div>';
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
