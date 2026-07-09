function renderAdminDashboard() {
  showLoading();
  apiGet('/dashboard/admin').then(data => {
    const { cards, upcomingEvents, recentTeams, recentStaff, recentEvent } = data;
    document.getElementById('page-content').innerHTML = `
      <div class="main-header">
        <h1>Team Leader Dashboard</h1>
        <p>Welcome back, ${Auth.user.fullname}</p>
      </div>
      <div class="card-grid">
        <div class="stat-card" onclick="Router.navigate('/admin/events')"><div class="stat-top"><div class="icon purple">📅</div><div class="value">${cards.myEvents}</div></div><div class="label">Active Events</div></div>
        <div class="stat-card" onclick="Router.navigate('/admin/staff')"><div class="stat-top"><div class="icon green">👤</div><div class="value">${cards.myStaff}</div></div><div class="label">My Officials</div></div>
        <div class="stat-card" onclick="Router.navigate('/admin/teams')"><div class="stat-top"><div class="icon blue">👥</div><div class="value">${cards.myTeams}</div></div><div class="label">My Teams</div></div>
        <div class="stat-card" onclick="Router.navigate('/admin/roles')"><div class="stat-top"><div class="icon amber">🔖</div><div class="value">${cards.myRoles}</div></div><div class="label">Roles</div></div>
      </div>
      ${recentEvent ? `
      <div class="card">
        <div class="card-header"><h2>Current Event: ${escapeHtml(recentEvent.event_name)}</h2></div>
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
      <div class="card">
        <div class="card-header"><h2>Upcoming Events</h2></div>
        ${upcomingEvents.length ? `<div class="table-responsive"><table><thead><tr><th>Event</th><th>Venue</th><th>Date</th><th>Staff</th></tr></thead><tbody>
          ${upcomingEvents.map(e => `<tr><td>${escapeHtml(e.event_name)}</td><td>${escapeHtml(e.venue)}</td><td>${e.event_date}</td><td>${e.staff_count}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="empty-state"><p>No upcoming events</p></div>'}
      </div>
      <div class="card">
        <div class="card-header"><h2>Recent Teams</h2></div>
        ${recentTeams.length ? `<div class="table-responsive"><table><thead><tr><th>Team</th><th>Event</th><th>Members</th></tr></thead><tbody>
          ${recentTeams.map(t => `<tr><td>${escapeHtml(t.team_name)}</td><td>${escapeHtml(t.event_name)}</td><td>${t.member_count}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="empty-state"><p>No teams yet</p></div>'}
      </div>
      <div class="card">
        <div class="card-header"><h2>Recent Officials</h2></div>
        ${recentStaff.length ? `<div class="table-responsive"><table><thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead><tbody>
          ${recentStaff.map(s => `<tr><td>${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)}</td><td>${escapeHtml(s.email)}</td><td>${getStatusBadge(s.status)}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="empty-state"><p>No officials yet</p></div>'}
      </div>
    `;
  }).catch(err => showError(err.message));
}
