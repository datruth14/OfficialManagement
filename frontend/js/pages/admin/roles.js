let adminRolesData = [];
let adminRolesStaff = [];

async function renderAdminRoles() {
  showLoading();
  try {
    const [roles, staff] = await Promise.all([
      apiGet('/roles'),
      apiGet('/staff'),
    ]);
    adminRolesData = roles;
    adminRolesStaff = staff;
    document.getElementById('page-content').innerHTML = `
      <div class="mb-6 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Role Management</h1>
        <p class="text-sm text-slate-400 mt-1">Manage official roles and capabilities</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5">
          <h2 class="text-base md:text-lg font-bold text-slate-900">All Roles (${adminRolesData.length})</h2>
          <button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer border-none transition-all duration-150 no-underline w-full md:w-auto justify-center" onclick="adminRolesOpenCreate()">+ Create Role</button>
        </div>
        <div class="table-responsive">
          ${adminRolesData.length ? `<table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Description</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Staff Count</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th></tr></thead><tbody>
            ${adminRolesData.map(r => `<tr>
              <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><strong>${escapeHtml(r.name)}</strong></td>
              <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(r.description) || '-'}</td>
              <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${r.staff_count}</td>
              <td class="flex gap-1 flex-nowrap px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">
                <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="adminRolesOpenEdit(${r.id})">Edit</button>
                <button class="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="adminRolesOpenAssign(${r.id})">Assign</button>
                <button class="bg-red-500 hover:bg-red-600 text-white rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="adminRolesDelete(${r.id})">Delete</button>
              </td>
            </tr>`).join('')}
          </tbody></table>` : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No roles yet</p></div>'}
        </div>
      </div>
      ${adminRolesModal()}
      ${adminRolesAssignModal()}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function adminRolesResetForm() {
  document.getElementById('ar_id').value = '';
  document.getElementById('ar_name').value = '';
  document.getElementById('ar_description').value = '';
  document.getElementById('adminRolesModalTitle').textContent = 'Create Role';
  document.getElementById('ar_form_error').textContent = '';
  document.getElementById('ar_form_error').style.display = 'none';
}

function adminRolesOpenCreate() {
  adminRolesResetForm();
  openModal('adminRolesModal');
}

function adminRolesOpenEdit(id) {
  const r = adminRolesData.find(x => x.id === id);
  if (!r) return;
  document.getElementById('ar_id').value = r.id;
  document.getElementById('ar_name').value = r.name;
  document.getElementById('ar_description').value = r.description || '';
  document.getElementById('adminRolesModalTitle').textContent = 'Edit Role';
  document.getElementById('ar_form_error').textContent = '';
  document.getElementById('ar_form_error').style.display = 'none';
  openModal('adminRolesModal');
}

function adminRolesModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="adminRolesModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="adminRolesModalTitle">Create Role</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('adminRolesModal')">&times;</button>
        </div>
        <form id="adminRolesForm" onsubmit="return adminRolesSave(event)">
          <input type="hidden" id="ar_id">
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Role Name *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="ar_name" required></div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Description</label><textarea class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 resize-vertical min-h-[100px]" id="ar_description"></textarea></div>
          <p id="ar_form_error" class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200" style="display:none"></p>
          <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
            <button type="button" class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('adminRolesModal')">Cancel</button>
            <button type="submit" class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function adminRolesAssignModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="adminRolesAssignModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="adminRolesAssignTitle">Assign Officials to Role</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('adminRolesAssignModal')">&times;</button>
        </div>
        <div id="adminRolesAssignContent"></div>
      </div>
    </div>
  `;
}

async function adminRolesOpenAssign(roleId) {
  const role = adminRolesData.find(r => r.id === roleId);
  if (!role) return;

  openModal('adminRolesAssignModal');
  document.getElementById('adminRolesAssignTitle').textContent = 'Assign Officials to ' + escapeHtml(role.name);
  const content = document.getElementById('adminRolesAssignContent');
  content.innerHTML = '<div class="text-center py-16 md:py-20 text-slate-400"><div class="spinner"></div></div>';

  try {
    const staff = await apiGet('/staff');
    content.innerHTML = `
      <p style="margin-bottom:12px;color:var(--text-light)">Select officials to assign to <strong>${escapeHtml(role.name)}</strong></p>
      <div style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:8px">
        ${staff.map(s => {
          const hasRole = (s.roles || []).some(r => r.id === roleId);
          return `<label style="display:flex;align-items:center;gap:8px;padding:6px 4px;font-weight:400;font-size:0.9rem;cursor:pointer;border-bottom:1px solid var(--border)">
            <input type="checkbox" value="${s.id}" class="ar-staff-check" ${hasRole ? 'checked' : ''}>
            ${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)} (${escapeHtml(s.staff_id)})
            ${hasRole ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700" style="margin-left:auto">Assigned</span>' : ''}
          </label>`;
        }).join('')}
      </div>
      <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
        <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('adminRolesAssignModal')">Cancel</button>
        <button class="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="adminRolesSaveAssign(${roleId})">Save Assignments</button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200">${err.message}</div>`;
  }
}

async function adminRolesSaveAssign(roleId) {
  const checkboxes = document.querySelectorAll('#adminRolesAssignContent input[type="checkbox"]');
  const btn = document.querySelector('#adminRolesAssignContent .bg-emerald-500');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    for (const cb of checkboxes) {
      const staffId = parseInt(cb.value);
      if (cb.checked) {
        await apiPost('/staff/' + staffId + '/roles', { role_ids: [roleId] });
      } else {
        await apiDelete('/staff/' + staffId + '/roles/' + roleId);
      }
    }
    closeModal('adminRolesAssignModal');
    renderAdminRoles();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Save Assignments';
  }
}

async function adminRolesSave(e) {
  e.preventDefault();
  const id = document.getElementById('ar_id').value;
  const data = {
    name: document.getElementById('ar_name').value,
    description: document.getElementById('ar_description').value,
  };
  const errDiv = document.getElementById('ar_form_error');
  try {
    if (id) await apiPut('/roles/' + id, data);
    else await apiPost('/roles', data);
    closeModal('adminRolesModal');
    renderAdminRoles();
  } catch (err) {
    errDiv.textContent = err.message;
    errDiv.style.display = 'block';
  }
}

async function adminRolesDelete(id) {
  if (!confirm('Are you sure you want to delete this role?')) return;
  try {
    await apiDelete('/roles/' + id);
    renderAdminRoles();
  } catch (err) {
    alert(err.message);
  }
}
