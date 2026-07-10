let superAdminAdminsData = [];

function isSuperUser() {
  return Auth.isSuperAdmin();
}

async function renderSuperAdminAdmins() {
  showLoading();
  try {
    superAdminAdminsData = await apiGet('/admins');
    document.getElementById('page-content').innerHTML = `
      <div>
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Team Leaders</h1>
        <p class="text-sm text-slate-400 mt-1">${isSuperUser() ? 'Manage all team leaders' : 'View all team leaders'}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5">
          <h2 class="text-base md:text-lg font-bold text-slate-900">All Team Leaders (${superAdminAdminsData.length})</h2>
          <div class="flex gap-2">
            ${isSuperUser() ? '<button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline text-xs px-3 py-1.5 w-full md:w-auto justify-center" onclick="openModal(\'saAdminsModal\')">+ Add Team Leader</button>' : ''}
            <button class="bg-slate-500 hover:bg-slate-600 text-white rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer font-semibold border-none transition-all duration-150 text-xs px-3 py-1.5 w-full md:w-auto justify-center" onclick="exportAdminsCSV()">Export CSV</button>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-3 mb-5 items-stretch md:items-center">
          <input type="text" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 max-w-full md:max-w-[340px]" placeholder="Search team leaders..." id="saSearch" oninput="filterSuperAdminAdmins(this.value)">
        </div>
        <div id="saTableContainer">
          ${renderAdminsTable(superAdminAdminsData)}
        </div>
      </div>
      ${isSuperUser() ? superAdminAdminsModal() : ''}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function renderTeamListBadge(a) {
  if (a.has_teams) {
    return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
      Teams (${a.team_count})
    </span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
    No Team
  </span>`;
}

function renderAdminsTable(data) {
  if (!data.length) return '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No team leaders found</p></div>';
  const cols = isSuperUser() ? '<th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th>' : '';
  return `<div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Fullname</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Username</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Email</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Phone</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Department</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Status</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Team List</th>${cols}</tr></thead><tbody>
    ${data.map(a => `<tr>
      <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Fullname"><strong>${escapeHtml(a.fullname)}</strong></td>
      <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Username">${escapeHtml(a.username)}</td>
      <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Email">${escapeHtml(a.email) || '-'}</td>
      <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Phone">${escapeHtml(a.phone) || '-'}</td>
      <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Department">${escapeHtml(a.department) || '-'}</td>
      <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Status">${getStatusBadge(a.status)}</td>
      <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Team List">${renderTeamListBadge(a)}</td>
      ${isSuperUser() ? `<td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle" data-label="Actions">
        <div class="flex gap-1 flex-nowrap">
          <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150 text-xs px-3 py-1.5" onclick="editSuperAdminAdmin(${a.id})">Edit</button>
          <button class="bg-red-500 hover:bg-red-600 text-white rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150 text-xs px-3 py-1.5" onclick="deleteSuperAdminAdmin(${a.id})">Delete</button>
        </div>
      </td>` : ''}
    </tr>`).join('')}
  </tbody></table></div>`;
}

function filterSuperAdminAdmins(search) {
  const filtered = search
    ? superAdminAdminsData.filter(a =>
        a.fullname.toLowerCase().includes(search.toLowerCase()) ||
        a.username.toLowerCase().includes(search.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : superAdminAdminsData;
  document.getElementById('saTableContainer').innerHTML = renderAdminsTable(filtered);
}

function superAdminAdminsModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="saAdminsModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="saAdminsModalTitle">Add Team Leader</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('saAdminsModal')">&times;</button>
        </div>
        <form id="saAdminsForm" onsubmit="return saveSuperAdminAdmin(event)">
          <input type="hidden" id="sa_admin_id">
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Fullname *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="sa_admin_fullname" required></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Username *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="sa_admin_username" required></div>
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Password</label><input type="password" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="sa_admin_password" placeholder="Leave blank to keep current"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Email</label><input type="email" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="sa_admin_email"></div>
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Phone</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="sa_admin_phone"></div>
          </div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Department</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="sa_admin_department"></div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Status</label><select class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 appearance-none cursor-pointer" id="sa_admin_status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
            <button type="button" class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('saAdminsModal')">Cancel</button>
            <button type="submit" class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function resetSaAdminsForm() {
  document.getElementById('sa_admin_id').value = '';
  document.getElementById('sa_admin_fullname').value = '';
  document.getElementById('sa_admin_username').value = '';
  document.getElementById('sa_admin_password').value = '';
  document.getElementById('sa_admin_email').value = '';
  document.getElementById('sa_admin_phone').value = '';
  document.getElementById('sa_admin_department').value = '';
  document.getElementById('sa_admin_status').value = 'active';
  document.getElementById('saAdminsModalTitle').textContent = 'Add Team Leader';
}

async function saveSuperAdminAdmin(e) {
  e.preventDefault();
  const id = document.getElementById('sa_admin_id').value;
  const data = {
    fullname: document.getElementById('sa_admin_fullname').value,
    username: document.getElementById('sa_admin_username').value,
    password: document.getElementById('sa_admin_password').value,
    email: document.getElementById('sa_admin_email').value,
    phone: document.getElementById('sa_admin_phone').value,
    department: document.getElementById('sa_admin_department').value,
    status: document.getElementById('sa_admin_status').value,
  };
  try {
    if (id) await apiPut('/admins/' + id, data);
    else await apiPost('/admins', data);
    closeModal('saAdminsModal');
    renderSuperAdminAdmins();
  } catch (err) {
    alert(err.message);
  }
}

function editSuperAdminAdmin(id) {
  const a = superAdminAdminsData.find(x => x.id === id);
  if (!a) return;
  document.getElementById('sa_admin_id').value = a.id;
  document.getElementById('sa_admin_fullname').value = a.fullname;
  document.getElementById('sa_admin_username').value = a.username;
  document.getElementById('sa_admin_password').value = '';
  document.getElementById('sa_admin_email').value = a.email || '';
  document.getElementById('sa_admin_phone').value = a.phone || '';
  document.getElementById('sa_admin_department').value = a.department || '';
  document.getElementById('sa_admin_status').value = a.status;
  document.getElementById('saAdminsModalTitle').textContent = 'Edit Team Leader';
  openModal('saAdminsModal');
}

async function deleteSuperAdminAdmin(id) {
  if (!confirm('Delete this team leader?')) return;
  try {
    await apiDelete('/admins/' + id);
    renderSuperAdminAdmins();
  } catch (err) {
    alert(err.message);
  }
}

async function exportAdminsCSV() {
  try {
    await apiGet('/export/admins?format=csv');
  } catch (err) {
    alert(err.message);
  }
}
