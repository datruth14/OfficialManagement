let adminEventsData = [];

async function renderAdminEvents() {
  showLoading();
  try {
    adminEventsData = await apiGet('/events');
    document.getElementById('page-content').innerHTML = `
      <div class="main-header">
        <h1>Events</h1>
        <p>View all events</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h2>All Events (${adminEventsData.length})</h2>
        </div>
        <div class="search-bar">
          <input type="text" class="form-control" placeholder="Search events..." id="aeSearch" oninput="filterAdminEvents(this.value)">
        </div>
        <div id="aeTableContainer">
          ${renderAdminEventsTable(adminEventsData)}
        </div>
      </div>
      ${adminEventsTeamsModal()}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function renderAdminEventsTable(data) {
  if (!data.length) return '<div class="empty-state"><p>No events found</p></div>';
  return `<div class="table-responsive"><table><thead><tr><th>Event Name</th><th>Venue</th><th>Date</th><th>Time</th><th>Teams</th><th>Officials</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${data.map(e => `<tr>
      <td><strong>${escapeHtml(e.event_name)}</strong></td>
      <td>${escapeHtml(e.venue) || '-'}</td>
      <td>${e.event_date || '-'}</td>
      <td>${e.start_time || ''}${e.start_time && e.end_time ? ' - ' : ''}${e.end_time || ''}</td>
      <td>${e.team_count}</td>
      <td>${e.staff_count}</td>
      <td>${getStatusBadge(e.status)}</td>
      <td class="actions">
        <button class="btn btn-sm btn-ghost" onclick="viewAdminEventTeams(${e.id})">Teams</button>
      </td>
    </tr>`).join('')}
  </tbody></table></div>`;
}

function filterAdminEvents(search) {
  const filtered = search
    ? adminEventsData.filter(e => e.event_name.toLowerCase().includes(search.toLowerCase()))
    : adminEventsData;
  document.getElementById('aeTableContainer').innerHTML = renderAdminEventsTable(filtered);
}

function adminEventsTeamsModal() {
  return `
    <div class="modal-overlay" id="adminEventsTeamsModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="adminEventsTeamsTitle">Event Teams</h2>
          <button class="modal-close" onclick="closeModal('adminEventsTeamsModal')">&times;</button>
        </div>
        <div id="adminEventsTeamsContent"></div>
      </div>
    </div>
  `;
}

async function viewAdminEventTeams(eventId) {
  openModal('adminEventsTeamsModal');
  document.getElementById('adminEventsTeamsTitle').textContent = 'Event Teams';
  document.getElementById('adminEventsTeamsContent').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const teams = await apiGet('/events/' + eventId + '/teams');
    const event = adminEventsData.find(e => e.id === eventId);
    document.getElementById('adminEventsTeamsTitle').textContent = 'Teams - ' + (event ? escapeHtml(event.event_name) : '');
    document.getElementById('adminEventsTeamsContent').innerHTML = teams.length
      ? `<div style="max-height:400px;overflow-y:auto">
          ${teams.map(t => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <div>
                <strong>${escapeHtml(t.team_name)}</strong>
                <div style="font-size:0.8rem;color:var(--text-light)">${t.member_count} member(s)</div>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="Router.navigate('/admin/teams')">View</button>
            </div>
          `).join('')}
        </div>
        <div class="form-actions" style="margin-top:16px">
          <button class="btn btn-primary" onclick="closeModal('adminEventsTeamsModal')">Close</button>
        </div>`
      : '<div class="empty-state"><p>No teams assigned to this event</p></div>';
  } catch (err) {
    document.getElementById('adminEventsTeamsContent').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}
