let superStaffData = [];
let superStaffRoles = [];

function canCreateStaff() {
  return Auth.user && Auth.user.role === 'super_user';
}

function canModifyStaff() {
  return Auth.user && (Auth.user.role === 'super_user' || Auth.user.role === 'super_admin');
}

async function renderSuperAdminStaff() {
  showLoading();
  try {
    superStaffRoles = await apiGet('/roles');
    superStaffData = await apiGet('/staff');
    renderSuperStaffTable();
  } catch (err) {
    showError(err.message);
  }
}

function renderSuperStaffTable(search) {
  const filtered = search
    ? superStaffData.filter(s =>
        (s.firstname + ' ' + s.lastname).toLowerCase().includes(search.toLowerCase()) ||
        (s.staff_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : superStaffData;

  const canCreate = canCreateStaff();
  const canModify = canModifyStaff();
  const actionsTh = canModify ? '<th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th>' : '';

  document.getElementById('page-content').innerHTML = `
    <div>
      <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Officials Management</h1>
      <p class="text-sm text-slate-400 mt-1">${canModify ? 'Manage all officials across the system' : 'View all officials across the system'}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5">
        <h2 class="text-base md:text-lg font-bold text-slate-900">All Officials (${filtered.length})</h2>
        ${canCreate ? '<button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline text-xs px-3 py-1.5 w-full md:w-auto justify-center" onclick="superStaffOpenCreate()">+ Add Official</button>' : ''}
      </div>
      <div class="flex flex-col md:flex-row gap-3 mb-5 items-stretch md:items-center">
        <input type="text" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 max-w-full md:max-w-[340px]" placeholder="Search by name, official ID, email..." id="ssSearch" oninput="renderSuperStaffTable(this.value)">
      </div>
      <div class="overflow-x-auto">
        ${filtered.length ? `<table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Official ID</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Email</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Phone</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Gender</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Roles</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Status</th>${actionsTh}</tr></thead><tbody>
          ${filtered.map(s => `<tr>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(s.staff_id)}</td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)}</td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(s.email) || '-'}</td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(s.phone) || '-'}</td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(s.gender) || '-'}</td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${(s.roles || []).map(r => `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${escapeHtml(r.name)}</span>`).join(' ') || '-'}</td>
            <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${getStatusBadge(s.status)}</td>
            ${canModify ? `<td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">
              <div class="flex gap-1 flex-nowrap">
                <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150 text-xs px-3 py-1.5" onclick="superStaffViewProfile(${s.id})">Profile</button>
                <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150 text-xs px-3 py-1.5" onclick="superStaffOpenEdit(${s.id})">Edit</button>
                <button class="bg-red-500 hover:bg-red-600 text-white rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150 text-xs px-3 py-1.5" onclick="superStaffDelete(${s.id})">Delete</button>
              </div>
            </td>` : `<td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><div class="flex gap-1 flex-nowrap"><button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150 text-xs px-3 py-1.5" onclick="superStaffViewProfile(${s.id})">Profile</button></div></td>`}
          </tr>`).join('')}
        </tbody></table>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No officials found</p></div>'}
      </div>
    </div>
    ${canCreate || canModify ? superStaffModal() : ''}
    ${superStaffProfileModal()}
  `;
}

function superStaffProfileModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="superStaffProfileModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold">Official Profile</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('superStaffProfileModal')">&times;</button>
        </div>
        <div id="superStaffProfileContent"></div>
      </div>
    </div>
  `;
}

async function superStaffViewProfile(id) {
  openModal('superStaffProfileModal');
  document.getElementById('superStaffProfileContent').innerHTML = '<div class="text-center py-16 md:py-20 text-slate-400"><div class="spinner"></div></div>';
  try {
    const s = await apiGet('/staff/' + id);
    document.getElementById('superStaffProfileContent').innerHTML = `
      <div style="padding:8px 0">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.9rem">
          <div><strong>Name:</strong> ${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)}</div>
          <div><strong>Official ID:</strong> ${escapeHtml(s.staff_id)}</div>
          <div><strong>Email:</strong> ${escapeHtml(s.email) || '-'}</div>
          <div><strong>Phone:</strong> ${escapeHtml(s.phone) || '-'}</div>
          <div><strong>Gender:</strong> ${escapeHtml(s.gender) || '-'}</div>
          <div><strong>Status:</strong> ${getStatusBadge(s.status)}</div>
          <div style="grid-column:1/-1"><strong>Address:</strong> ${escapeHtml(s.address) || '-'}</div>
          <div style="grid-column:1/-1">
            <strong>Roles:</strong>
            ${(s.roles || []).length ? (s.roles || []).map(r => `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${escapeHtml(r.name)}</span>`).join(' ') : '<span style="color:var(--text-light)">None assigned</span>'}
          </div>
          <div style="grid-column:1/-1">
            <strong>Teams:</strong>
            ${(s.teams || []).length ? (s.teams || []).map(t => `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">${escapeHtml(t.team_name)}</span>`).join(' ') : '<span style="color:var(--text-light)">Not assigned to any team</span>'}
          </div>
        </div>
        <div style="margin-top:16px;text-align:right">
          <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('superStaffProfileModal')">Close</button>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('superStaffProfileContent').innerHTML = `<div class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200">${err.message}</div>`;
  }
}

function superStaffModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="superStaffModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="superStaffModalTitle">Add Official</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('superStaffModal')">&times;</button>
        </div>
        <form id="superStaffForm" onsubmit="return superStaffSave(event)">
          <input type="hidden" id="ss_id">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Firstname *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="ss_firstname" required></div>
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Lastname *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="ss_lastname" required></div>
          </div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Official ID (auto-generated if empty)</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="ss_staff_id" placeholder="Leave empty for auto-generate"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Email</label><input type="email" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="ss_email"></div>
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Phone</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="ss_phone"></div>
          </div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Address</label><textarea class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="ss_address"></textarea></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Gender</label><select class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 appearance-none cursor-pointer" id="ss_gender"><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Status</label><select class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 appearance-none cursor-pointer" id="ss_status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div class="mb-4 md:mb-5">
            <label class="block text-xs font-semibold mb-1.5 text-slate-900">Assign Roles</label>
            <div id="ss_roles_list" style="display:flex;flex-wrap:wrap;gap:8px;padding:8px;border:1px solid var(--border);border-radius:var(--radius)">
              ${superStaffRoles.map(r => `<label style="display:flex;align-items:center;gap:4px;font-weight:400;font-size:0.85rem;cursor:pointer"><input type="checkbox" value="${r.id}"> ${escapeHtml(r.name)}</label>`).join('')}
            </div>
          </div>
          <p id="ss_form_error" class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200" style="display:none"></p>
          <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
            <button type="button" class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('superStaffModal')">Cancel</button>
            <button type="submit" class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline" id="ss_submit_btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function superStaffResetForm() {
  document.getElementById('ss_id').value = '';
  document.getElementById('ss_firstname').value = '';
  document.getElementById('ss_lastname').value = '';
  document.getElementById('ss_staff_id').value = '';
  document.getElementById('ss_email').value = '';
  document.getElementById('ss_phone').value = '';
  document.getElementById('ss_gender').value = '';
  document.getElementById('ss_status').value = 'active';
  document.getElementById('ss_address').value = '';
  document.querySelectorAll('#ss_roles_list input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('superStaffModalTitle').textContent = 'Add Official';
  document.getElementById('ss_form_error').textContent = '';
  document.getElementById('ss_form_error').style.display = 'none';
}

function superStaffOpenCreate() {
  superStaffResetForm();
  openModal('superStaffModal');
}

function superStaffOpenEdit(id) {
  const s = superStaffData.find(x => x.id === id);
  if (!s) return;
  document.getElementById('ss_id').value = s.id;
  document.getElementById('ss_firstname').value = s.firstname;
  document.getElementById('ss_lastname').value = s.lastname;
  document.getElementById('ss_staff_id').value = s.staff_id || '';
  document.getElementById('ss_email').value = s.email || '';
  document.getElementById('ss_phone').value = s.phone || '';
  document.getElementById('ss_gender').value = s.gender || '';
  document.getElementById('ss_status').value = s.status;
  document.getElementById('ss_address').value = s.address || '';
  document.getElementById('superStaffModalTitle').textContent = 'Edit Official';
  document.getElementById('ss_form_error').textContent = '';
  document.getElementById('ss_form_error').style.display = 'none';
  const roles = s.roles || [];
  document.querySelectorAll('#ss_roles_list input[type="checkbox"]').forEach(cb => {
    cb.checked = roles.some(r => r.id === parseInt(cb.value));
  });
  openModal('superStaffModal');
}

async function superStaffSave(e) {
  e.preventDefault();
  const id = document.getElementById('ss_id').value;
  const data = {
    firstname: document.getElementById('ss_firstname').value,
    lastname: document.getElementById('ss_lastname').value,
    staff_id: document.getElementById('ss_staff_id').value,
    email: document.getElementById('ss_email').value,
    phone: document.getElementById('ss_phone').value,
    gender: document.getElementById('ss_gender').value,
    status: document.getElementById('ss_status').value,
    address: document.getElementById('ss_address').value,
  };

  const roleCheckboxes = document.querySelectorAll('#ss_roles_list input[type="checkbox"]:checked');
  data.role_ids = Array.from(roleCheckboxes).map(cb => parseInt(cb.value));

  const btn = document.getElementById('ss_submit_btn');
  const errDiv = document.getElementById('ss_form_error');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (id) {
      await apiPut('/staff/' + id, data);
    } else {
      await apiPost('/staff', data);
    }
    closeModal('superStaffModal');
    renderSuperAdminStaff();
  } catch (err) {
    errDiv.textContent = err.message;
    errDiv.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Save';
  }
}

async function superStaffDelete(id) {
  if (!confirm('Are you sure you want to delete this official?')) return;
  try {
    await apiDelete('/staff/' + id);
    renderSuperAdminStaff();
  } catch (err) {
    alert(err.message);
  }
}
