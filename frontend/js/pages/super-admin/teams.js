let superTeamsData = [];
let superTeamsEvents = [];
let superTeamsStaff = [];

function canCreateTeam() {
  return Auth.user && Auth.user.role === 'super_user';
}

function canManageTeams() {
  return Auth.user && (Auth.user.role === 'super_user' || Auth.user.role === 'super_admin');
}

async function renderSuperAdminTeams() {
  showLoading();
  try {
    const [teams, events, staff] = await Promise.all([
      apiGet('/teams'),
      apiGet('/events'),
      apiGet('/staff'),
    ]);
    superTeamsData = teams;
    superTeamsEvents = events;
    superTeamsStaff = staff;

    const canCreate = canCreateTeam();
    const canModify = canManageTeams();

    document.getElementById('page-content').innerHTML = `
      <div class="main-header">
        <h1>Teams</h1>
        <p>${canModify ? 'Manage all teams across the system' : 'View all teams across the system'}</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h2>All Teams (${superTeamsData.length})</h2>
          <div>
            ${canCreate ? '<button class="btn btn-primary btn-sm" onclick="openModal(\'superTeamsModal\')">+ Add Team</button>' : ''}
            ${canModify ? '<button class="btn btn-sm btn-secondary" onclick="exportAllTeams()">Export All CSV</button>' : ''}
          </div>
        </div>
        ${superTeamsData.length
          ? `<div class="table-responsive"><table><thead><tr><th>Team Name</th><th>Event</th><th>Members</th>${canModify ? '<th>Actions</th>' : ''}</tr></thead><tbody>
            ${superTeamsData.map(t => `<tr>
              <td><strong>${escapeHtml(t.team_name)}</strong></td>
              <td>${escapeHtml(t.event_name)}</td>
              <td>${t.member_count}</td>
              ${canModify ? `<td class="actions">
                <button class="btn btn-sm btn-ghost" onclick="viewSuperTeamMembers(${t.id})">Members</button>
                <button class="btn btn-sm btn-ghost" onclick="editSuperTeam(${t.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSuperTeam(${t.id})">Delete</button>
                <button class="btn btn-sm btn-success" onclick="exportSuperTeam(${t.id})">Export</button>
              </td>` : ''}
            </tr>`).join('')}
          </tbody></table></div>`
          : '<div class="empty-state"><p>No teams yet</p></div>'}
      </div>
      ${canCreate || canModify ? superTeamsModal() : ''}
      ${canModify ? superTeamsMembersModal() : ''}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function superTeamsModal() {
  return `
    <div class="modal-overlay" id="superTeamsModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="superTeamsModalTitle">Add Team</h2>
          <button class="modal-close" onclick="closeModal('superTeamsModal')">&times;</button>
        </div>
        <form id="superTeamsForm" onsubmit="return saveSuperTeam(event)">
          <input type="hidden" id="st_id">
          <div class="form-group"><label>Team Name *</label><input class="form-control" id="st_name" required></div>
          <div class="form-group"><label>Event *</label><select class="form-control" id="st_event_id" required>
            <option value="">Select Event</option>
            ${superTeamsEvents.map(e => `<option value="${e.id}">${escapeHtml(e.event_name)}</option>`).join('')}
          </select></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('superTeamsModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function superTeamsMembersModal() {
  return `
    <div class="modal-overlay" id="superTeamsMembersModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="superTeamsMembersTitle">Team Members</h2>
          <button class="modal-close" onclick="closeModal('superTeamsMembersModal')">&times;</button>
        </div>
        <div id="superTeamsMembersContent"></div>
      </div>
    </div>
  `;
}

async function saveSuperTeam(e) {
  e.preventDefault();
  const id = document.getElementById('st_id').value;
  const data = {
    team_name: document.getElementById('st_name').value,
    event_id: parseInt(document.getElementById('st_event_id').value),
  };
  try {
    if (id) await apiPut('/teams/' + id, data);
    else await apiPost('/teams', data);
    closeModal('superTeamsModal');
    renderSuperAdminTeams();
  } catch (err) {
    alert(err.message);
  }
}

function editSuperTeam(id) {
  const t = superTeamsData.find(x => x.id === id);
  if (!t) return;
  document.getElementById('st_id').value = t.id;
  document.getElementById('st_name').value = t.team_name;
  document.getElementById('st_event_id').value = t.event_id;
  document.getElementById('superTeamsModalTitle').textContent = 'Edit Team';
  openModal('superTeamsModal');
}

async function deleteSuperTeam(id) {
  if (!confirm('Delete this team?')) return;
  try {
    await apiDelete('/teams/' + id);
    renderSuperAdminTeams();
  } catch (err) {
    alert(err.message);
  }
}

async function viewSuperTeamMembers(teamId) {
  openModal('superTeamsMembersModal');
  document.getElementById('superTeamsMembersTitle').textContent = 'Team Members';
  document.getElementById('superTeamsMembersContent').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const res = await apiGet('/teams/' + teamId + '/members');
    const members = res.members || [];
    const availableStaff = superTeamsStaff.filter(s => !members.find(m => m.id === s.id));
    document.getElementById('superTeamsMembersContent').innerHTML = `
      <div style="margin-bottom:16px">
        <label><strong>Add Members</strong></label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <select class="form-control" id="addSuperMemberSelect" style="max-width:300px">
            <option value="">Select officials...</option>
            ${availableStaff.map(s => `<option value="${s.id}">${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)} (${s.staff_id})</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-primary" onclick="addSuperTeamMember(${teamId})">Add</button>
        </div>
      </div>
      <h3 style="margin-bottom:8px">Members (${members.length})</h3>
      ${members.length ? `<div class="table-responsive"><table><thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Actions</th></tr></thead><tbody>
        ${members.map(m => `<tr>
          <td>${escapeHtml(m.firstname)} ${escapeHtml(m.lastname)}</td>
          <td>${escapeHtml(m.email) || '-'}</td>
          <td>${(m.roles || []).map(r => `<span class="badge badge-active">${escapeHtml(r.name)}</span>`).join(' ') || '-'}</td>
          <td><button class="btn btn-sm btn-danger" onclick="removeSuperTeamMember(${teamId}, ${m.id})">Remove</button></td>
        </tr>`).join('')}
      </tbody></table></div>` : '<div class="empty-state"><p>No members in this team</p></div>'}
    `;
  } catch (err) {
    document.getElementById('superTeamsMembersContent').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function addSuperTeamMember(teamId) {
  const select = document.getElementById('addSuperMemberSelect');
  const staffId = parseInt(select.value);
  if (!staffId) return;
  try {
    await apiPost('/teams/' + teamId + '/members', { staff_ids: [staffId] });
    viewSuperTeamMembers(teamId);
  } catch (err) {
    alert(err.message);
  }
}

async function removeSuperTeamMember(teamId, staffId) {
  if (!confirm('Remove this member?')) return;
  try {
    await apiDelete(`/teams/${teamId}/members/${staffId}`);
    viewSuperTeamMembers(teamId);
  } catch (err) {
    alert(err.message);
  }
}

async function exportSuperTeam(teamId) {
  try {
    await apiGet('/export/teams/' + teamId + '?format=csv');
  } catch (err) {
    alert(err.message);
  }
}

async function exportAllTeams() {
  try {
    await apiGet('/export/teams?format=csv');
  } catch (err) {
    alert(err.message);
  }
}
