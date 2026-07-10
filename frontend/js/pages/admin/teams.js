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
      <div class="mb-6 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Teams</h1>
        <p class="text-sm text-slate-400 mt-1">Manage your teams</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5">
          <h2 class="text-base md:text-lg font-bold text-slate-900">All Teams (${adminTeamsData.length})</h2>
          <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer border-none transition-all duration-150 no-underline w-full md:w-auto justify-center" onclick="openModal('adminTeamsModal')">+ Add Team</button>
            <button class="bg-slate-500 hover:bg-slate-600 text-white rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150 w-full md:w-auto justify-center" onclick="exportAllTeamsAdmin()">Export All CSV</button>
          </div>
        </div>
        ${adminTeamsData.length ? `<div class="table-responsive"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Team Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Event</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Members</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th></tr></thead><tbody>
          ${adminTeamsData.map(t => `<tr>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><strong>${escapeHtml(t.team_name)}</strong></td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(t.event_name)}</td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${t.member_count}</td>
            <td class="flex gap-1 flex-nowrap px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">
              <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="viewAdminTeamMembers(${t.id})">Members</button>
              <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="editAdminTeam(${t.id})">Edit</button>
              <button class="bg-red-500 hover:bg-red-600 text-white rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="deleteAdminTeam(${t.id})">Delete</button>
              <button class="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="exportAdminTeam(${t.id})">Export</button>
            </td>
          </tr>`).join('')}
        </tbody></table></div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No teams yet</p></div>'}
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
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="adminTeamsModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="adminTeamsModalTitle">Add Team</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('adminTeamsModal')">&times;</button>
        </div>
        <form id="adminTeamsForm" onsubmit="return saveAdminTeam(event)">
          <input type="hidden" id="at_id">
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Team Name *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="at_name" required></div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Event *</label><select class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 appearance-none cursor-pointer" id="at_event_id" required>
            <option value="">Select Event</option>
            ${adminTeamsEvents.map(e => `<option value="${e.id}">${escapeHtml(e.event_name)}</option>`).join('')}
          </select></div>
          <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
            <button type="button" class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('adminTeamsModal')">Cancel</button>
            <button type="submit" class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function adminTeamsMembersModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="adminTeamsMembersModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="adminTeamsMembersTitle">Team Members</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('adminTeamsMembersModal')">&times;</button>
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
  document.getElementById('adminTeamsMembersContent').innerHTML = '<div class="text-center py-16 md:py-20 text-slate-400"><div class="spinner"></div></div>';
  try {
    const res = await apiGet('/teams/' + teamId + '/members');
    const members = res.members || [];
    const availableStaff = adminTeamsStaff.filter(s => !members.find(m => m.id === s.id));
    document.getElementById('adminTeamsMembersContent').innerHTML = `
      <div style="margin-bottom:16px">
        <label><strong>Add Members</strong></label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <select class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 appearance-none cursor-pointer" id="addMemberSelect" style="max-width:300px">
            <option value="">Select officials...</option>
            ${availableStaff.map(s => `<option value="${s.id}">${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)} (${s.staff_id})</option>`).join('')}
          </select>
          <button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer border-none transition-all duration-150 no-underline" onclick="addAdminTeamMember(${teamId})">Add</button>
        </div>
      </div>
      <h3 style="margin-bottom:8px">Members (${members.length})</h3>
      ${members.length ? `<div class="table-responsive"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Email</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Roles</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th></tr></thead><tbody>
        ${members.map(m => `<tr>
          <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(m.firstname)} ${escapeHtml(m.lastname)}</td>
          <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(m.email) || '-'}</td>
          <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${(m.roles || []).map(r => `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${escapeHtml(r.name)}</span>`).join(' ') || '-'}</td>
          <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><button class="bg-red-500 hover:bg-red-600 text-white rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="removeAdminTeamMember(${teamId}, ${m.id})">Remove</button></td>
        </tr>`).join('')}
      </tbody></table></div>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No members in this team</p></div>'}
    `;
  } catch (err) {
    document.getElementById('adminTeamsMembersContent').innerHTML = `<div class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200">${err.message}</div>`;
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
