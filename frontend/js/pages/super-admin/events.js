let superAdminEventsData = [];

async function renderSuperAdminEvents() {
  showLoading();
  try {
    superAdminEventsData = await apiGet('/events');
    document.getElementById('page-content').innerHTML = `
      <div class="main-header">
        <h1>Events</h1>
        <p>Manage all events</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h2>All Events (${superAdminEventsData.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="openModal('superEventsModal')">+ Add Event</button>
        </div>
        <div class="search-bar">
          <input type="text" class="form-control" placeholder="Search events..." id="seSearch" oninput="filterSuperAdminEvents(this.value)">
        </div>
        <div id="seTableContainer">
          ${renderEventsTable(superAdminEventsData)}
        </div>
      </div>
      ${superAdminEventsModal()}
      ${superAdminEventsTeamsModal()}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function renderEventsTable(data) {
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
        <button class="btn btn-sm btn-ghost" onclick="viewSuperEventTeams(${e.id})">Teams</button>
        <button class="btn btn-sm btn-ghost" onclick="editSuperAdminEvent(${e.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSuperAdminEvent(${e.id})">Delete</button>
      </td>
    </tr>`).join('')}
  </tbody></table></div>`;
}

function filterSuperAdminEvents(search) {
  const filtered = search
    ? superAdminEventsData.filter(e => e.event_name.toLowerCase().includes(search.toLowerCase()))
    : superAdminEventsData;
  document.getElementById('seTableContainer').innerHTML = renderEventsTable(filtered);
}

function superAdminEventsModal() {
  return `
    <div class="modal-overlay" id="superEventsModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="superEventsModalTitle">Add Event</h2>
          <button class="modal-close" onclick="closeModal('superEventsModal')">&times;</button>
        </div>
        <form id="superEventsForm" onsubmit="return saveSuperAdminEvent(event)">
          <input type="hidden" id="se_id">
          <div class="form-group"><label>Event Name *</label><input class="form-control" id="se_name" required></div>
          <div class="form-group"><label>Description</label><textarea class="form-control" id="se_description"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label>Venue</label><input class="form-control" id="se_venue"></div>
            <div class="form-group"><label>Date</label><input type="date" class="form-control" id="se_date"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Start Time</label><input type="time" class="form-control" id="se_start"></div>
            <div class="form-group"><label>End Time</label><input type="time" class="form-control" id="se_end"></div>
          </div>
          <div class="form-group"><label>Status</label><select class="form-control" id="se_status"><option value="active">Active</option><option value="archived">Archived</option></select></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('superEventsModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function superAdminEventsTeamsModal() {
  return `
    <div class="modal-overlay" id="superEventsTeamsModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="superEventsTeamsTitle">Event Teams</h2>
          <button class="modal-close" onclick="closeModal('superEventsTeamsModal')">&times;</button>
        </div>
        <div id="superEventsTeamsContent"></div>
      </div>
    </div>
  `;
}

async function saveSuperAdminEvent(e) {
  e.preventDefault();
  const id = document.getElementById('se_id').value;
  const data = {
    event_name: document.getElementById('se_name').value,
    description: document.getElementById('se_description').value,
    venue: document.getElementById('se_venue').value,
    event_date: document.getElementById('se_date').value,
    start_time: document.getElementById('se_start').value,
    end_time: document.getElementById('se_end').value,
    status: document.getElementById('se_status').value,
  };
  try {
    if (id) await apiPut('/events/' + id, data);
    else await apiPost('/events', data);
    closeModal('superEventsModal');
    renderSuperAdminEvents();
  } catch (err) {
    alert(err.message);
  }
}

function editSuperAdminEvent(id) {
  const e = superAdminEventsData.find(x => x.id === id);
  if (!e) return;
  document.getElementById('se_id').value = e.id;
  document.getElementById('se_name').value = e.event_name;
  document.getElementById('se_description').value = e.description || '';
  document.getElementById('se_venue').value = e.venue || '';
  document.getElementById('se_date').value = e.event_date || '';
  document.getElementById('se_start').value = e.start_time || '';
  document.getElementById('se_end').value = e.end_time || '';
  document.getElementById('se_status').value = e.status;
  document.getElementById('superEventsModalTitle').textContent = 'Edit Event';
  openModal('superEventsModal');
}

async function deleteSuperAdminEvent(id) {
  if (!confirm('Delete this event?')) return;
  try {
    await apiDelete('/events/' + id);
    renderSuperAdminEvents();
  } catch (err) {
    alert(err.message);
  }
}

async function viewSuperEventTeams(eventId) {
  openModal('superEventsTeamsModal');
  document.getElementById('superEventsTeamsContent').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const teams = await apiGet('/events/' + eventId + '/teams');
    const event = superAdminEventsData.find(e => e.id === eventId);
    document.getElementById('superEventsTeamsTitle').textContent = 'Teams - ' + (event ? escapeHtml(event.event_name) : '');
    document.getElementById('superEventsTeamsContent').innerHTML = teams.length
      ? `<div style="max-height:400px;overflow-y:auto">
          ${teams.map(t => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <div>
                <strong>${escapeHtml(t.team_name)}</strong>
                <div style="font-size:0.8rem;color:var(--text-light)">${t.member_count} member(s)</div>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="Router.navigate('/super-admin/teams')">View</button>
            </div>
          `).join('')}
        </div>
        <div class="form-actions" style="margin-top:16px">
          <button class="btn btn-primary" onclick="closeModal('superEventsTeamsModal')">Close</button>
        </div>`
      : '<div class="empty-state"><p>No teams assigned to this event</p></div>';
  } catch (err) {
    document.getElementById('superEventsTeamsContent').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}
