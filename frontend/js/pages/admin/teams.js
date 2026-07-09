let adminTeamsData = [];
let adminTeamsEvents = [];
let adminTeamsStaff = [];

async function renderAdminTeams() {
  showLoading();
  try {
    const [teams, events, staff] = await Promise.all([
      apiGet('/teams'),
      apiGet('/events'),
      apiGet('/staff'),
    ]);
    adminTeamsData = teams;
    adminTeamsEvents = events;
    adminTeamsStaff = staff;
    document.getElementById('page-content').innerHTML = `
      <div class="main-header">
        <h1>Teams</h1>
        <p>Manage your teams</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h2>All Teams (${adminTeamsData.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="openModal('adminTeamsModal')">+ Add Team</button>
          <button class="btn btn-sm btn-secondary" onclick="exportAllTeamsAdmin()">Export All CSV</button>
        </div>
        ${adminTeamsData.length ? `<div class="table-responsive"><table><thead><tr><th>Team Name</th><th>Event</th><th>Members</th><th>Actions</th></tr></thead><tbody>
          ${adminTeamsData.map(t => `<tr>
            <td><strong>${escapeHtml(t.team_name)}</strong></td>
            <td>${escapeHtml(t.event_name)}</td>
            <td>${t.member_count}</td>
            <td class="actions">
              <button class="btn btn-sm btn-ghost" onclick="viewAdminTeamMembers(${t.id})">Members</button>
              <button class="btn btn-sm btn-ghost" onclick="editAdminTeam(${t.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteAdminTeam(${t.id})">Delete</button>
              <button class="btn btn-sm btn-success" onclick="exportAdminTeam(${t.id})">Export</button>
            </td>
          </tr>`).join('')}
        </tbody></table></div>` : '<div class="empty-state"><p>No teams yet</p></div>'}
      </div>
      ${adminTeamsModal()}
      ${adminTeamsMembersModal()}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function adminTeamsModal() {
  return `
    <div class="modal-overlay" id="adminTeamsModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="adminTeamsModalTitle">Add Team</h2>
          <button class="modal-close" onclick="closeModal('adminTeamsModal')">&times;</button>
        </div>
        <form id="adminTeamsForm" onsubmit="return saveAdminTeam(event)">
          <input type="hidden" id="at_id">
          <div class="form-group"><label>Team Name *</label><input class="form-control" id="at_name" required></div>
          <div class="form-group"><label>Event *</label><select class="form-control" id="at_event_id" required>
            <option value="">Select Event</option>
            ${adminTeamsEvents.map(e => `<option value="${e.id}">${escapeHtml(e.event_name)}</option>`).join('')}
          </select></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('adminTeamsModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function adminTeamsMembersModal() {
  return `
    <div class="modal-overlay" id="adminTeamsMembersModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="adminTeamsMembersTitle">Team Members</h2>
          <button class="modal-close" onclick="closeModal('adminTeamsMembersModal')">&times;</button>
        </div>
        <div id="adminTeamsMembersContent"></div>
      </div>
    </div>
  `;
}

async function saveAdminTeam(e) {
  e.preventDefault();
  const id = document.getElementById('at_id').value;
  const data = {
    team_name: document.getElementById('at_name').value,
    event_id: parseInt(document.getElementById('at_event_id').value),
  };
  try {
    if (id) await apiPut('/teams/' + id, data);
    else await apiPost('/teams', data);
    closeModal('adminTeamsModal');
    renderAdminTeams();
  } catch (err) {
    alert(err.message);
  }
}

function editAdminTeam(id) {
  const t = adminTeamsData.find(x => x.id === id);
  if (!t) return;
  document.getElementById('at_id').value = t.id;
  document.getElementById('at_name').value = t.team_name;
  document.getElementById('at_event_id').value = t.event_id;
  document.getElementById('adminTeamsModalTitle').textContent = 'Edit Team';
  openModal('adminTeamsModal');
}

async function deleteAdminTeam(id) {
  if (!confirm('Delete this team?')) return;
  try {
    await apiDelete('/teams/' + id);
    renderAdminTeams();
  } catch (err) {
    alert(err.message);
  }
}

async function viewAdminTeamMembers(teamId) {
  openModal('adminTeamsMembersModal');
  document.getElementById('adminTeamsMembersTitle').textContent = 'Team Members';
  document.getElementById('adminTeamsMembersContent').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const res = await apiGet('/teams/' + teamId + '/members');
    const members = res.members || [];
    const availableStaff = adminTeamsStaff.filter(s => !members.find(m => m.id === s.id));
    document.getElementById('adminTeamsMembersContent').innerHTML = `
      <div style="margin-bottom:16px">
        <label><strong>Add Members</strong></label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <select class="form-control" id="addMemberSelect" style="max-width:300px">
            <option value="">Select officials...</option>
            ${availableStaff.map(s => `<option value="${s.id}">${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)} (${s.staff_id})</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-primary" onclick="addAdminTeamMember(${teamId})">Add</button>
        </div>
      </div>
      <h3 style="margin-bottom:8px">Members (${members.length})</h3>
      ${members.length ? `<div class="table-responsive"><table><thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Actions</th></tr></thead><tbody>
        ${members.map(m => `<tr>
          <td>${escapeHtml(m.firstname)} ${escapeHtml(m.lastname)}</td>
          <td>${escapeHtml(m.email) || '-'}</td>
          <td>${(m.roles || []).map(r => `<span class="badge badge-active">${escapeHtml(r.name)}</span>`).join(' ') || '-'}</td>
          <td><button class="btn btn-sm btn-danger" onclick="removeAdminTeamMember(${teamId}, ${m.id})">Remove</button></td>
        </tr>`).join('')}
      </tbody></table></div>` : '<div class="empty-state"><p>No members in this team</p></div>'}
    `;
  } catch (err) {
    document.getElementById('adminTeamsMembersContent').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function addAdminTeamMember(teamId) {
  const select = document.getElementById('addMemberSelect');
  const staffId = parseInt(select.value);
  if (!staffId) return;
  try {
    await apiPost('/teams/' + teamId + '/members', { staff_ids: [staffId] });
    viewAdminTeamMembers(teamId);
  } catch (err) {
    alert(err.message);
  }
}

async function removeAdminTeamMember(teamId, staffId) {
  if (!confirm('Remove this member?')) return;
  try {
    await apiDelete(`/teams/${teamId}/members/${staffId}`);
    viewAdminTeamMembers(teamId);
  } catch (err) {
    alert(err.message);
  }
}

async function exportAdminTeam(teamId) {
  try {
    await apiGet('/export/teams/' + teamId + '?format=csv');
  } catch (err) {
    alert(err.message);
  }
}

async function exportAllTeamsAdmin() {
  try {
    await apiGet('/export/teams?format=csv');
  } catch (err) {
    alert(err.message);
  }
}
