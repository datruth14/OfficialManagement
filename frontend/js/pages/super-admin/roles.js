let superRolesData = [];
let superRolesStaff = [];

function isSuperUser() {
  return Auth.user && Auth.user.role === 'super_user';
}

async function renderSuperAdminRoles() {
  showLoading();
  try {
    const [roles, staff] = await Promise.all([
      apiGet('/roles'),
      apiGet('/staff'),
    ]);
    superRolesData = roles;
    superRolesStaff = staff;

    const isSU = isSuperUser();

    document.getElementById('page-content').innerHTML = `
      <div class="mb-6 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Roles</h1>
        <p class="text-sm text-slate-400 mt-1">${isSU ? 'Manage roles and capabilities' : 'View all roles and capabilities'}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5">
          <h2 class="text-base md:text-lg font-bold text-slate-900">All Roles (${superRolesData.length})</h2>
          ${isSU ? '<button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline" onclick="superRolesOpenCreate()">+ Create Role</button>' : ''}
        </div>
        ${superRolesData.length
          ? `<div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Description</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Staff Count</th>${isSU ? '<th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th>' : ''}</tr></thead><tbody>
            ${superRolesData.map(r => `<tr>
              <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><strong>${escapeHtml(r.name)}</strong></td>
              <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(r.description) || '-'}</td>
              <td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${r.staff_count}</td>
              ${isSU ? `<td class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><div class="flex gap-1 flex-nowrap">
                <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="superRolesOpenEdit(${r.id})">Edit</button>
                <button class="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="superRolesOpenAssign(${r.id})">Assign</button>
                <button class="bg-red-500 hover:bg-red-600 text-white rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="superRolesDelete(${r.id})">Delete</button>
              </div></td>` : ''}
            </tr>`).join('')}
          </tbody></table></div>`
          : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No roles yet</p></div>'}
      </div>
      ${isSU ? superRolesModal() : ''}
      ${isSU ? superRolesAssignModal() : ''}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function superRolesModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="superRolesModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="superRolesModalTitle">Create Role</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('superRolesModal')">&times;</button>
        </div>
        <form id="superRolesForm" onsubmit="return superRolesSave(event)">
          <input type="hidden" id="sr_id">
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Role Name *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="sr_name" required></div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Description</label><textarea class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 resize-vertical min-h-[100px]" id="sr_description"></textarea></div>
          <p id="sr_form_error" class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200" style="display:none"></p>
          <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
            <button type="button" class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('superRolesModal')">Cancel</button>
            <button type="submit" class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function superRolesAssignModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="superRolesAssignModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="superRolesAssignTitle">Assign Officials to Role</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('superRolesAssignModal')">&times;</button>
        </div>
        <div id="superRolesAssignContent"></div>
      </div>
    </div>
  `;
}

function superRolesResetForm() {
  document.getElementById('sr_id').value = '';
  document.getElementById('sr_name').value = '';
  document.getElementById('sr_description').value = '';
  document.getElementById('superRolesModalTitle').textContent = 'Create Role';
  document.getElementById('sr_form_error').textContent = '';
  document.getElementById('sr_form_error').style.display = 'none';
}

function superRolesOpenCreate() {
  superRolesResetForm();
  openModal('superRolesModal');
}

function superRolesOpenEdit(id) {
  const r = superRolesData.find(x => x.id === id);
  if (!r) return;
  document.getElementById('sr_id').value = r.id;
  document.getElementById('sr_name').value = r.name;
  document.getElementById('sr_description').value = r.description || '';
  document.getElementById('superRolesModalTitle').textContent = 'Edit Role';
  document.getElementById('sr_form_error').textContent = '';
  document.getElementById('sr_form_error').style.display = 'none';
  openModal('superRolesModal');
}

async function superRolesSave(e) {
  e.preventDefault();
  const id = document.getElementById('sr_id').value;
  const data = {
    name: document.getElementById('sr_name').value,
    description: document.getElementById('sr_description').value,
  };
  const errDiv = document.getElementById('sr_form_error');
  try {
    if (id) await apiPut('/roles/' + id, data);
    else await apiPost('/roles', data);
    closeModal('superRolesModal');
    renderSuperAdminRoles();
  } catch (err) {
    errDiv.textContent = err.message;
    errDiv.style.display = 'block';
  }
}

async function superRolesDelete(id) {
  if (!confirm('Are you sure you want to delete this role?')) return;
  try {
    await apiDelete('/roles/' + id);
    renderSuperAdminRoles();
  } catch (err) {
    alert(err.message);
  }
}

async function superRolesOpenAssign(roleId) {
  const role = superRolesData.find(r => r.id === roleId);
  if (!role) return;

  openModal('superRolesAssignModal');
  document.getElementById('superRolesAssignTitle').textContent = 'Assign Officials to ' + escapeHtml(role.name);
  const content = document.getElementById('superRolesAssignContent');
  content.innerHTML = '<div class="text-center py-16 md:py-20 text-slate-400"><div class="spinner"></div></div>';

  try {
    const staff = await apiGet('/staff');
    content.innerHTML = `
      <p class="mb-3 text-sm text-slate-400">Select officials to assign to <strong>${escapeHtml(role.name)}</strong></p>
      <div class="max-h-[400px] overflow-y-auto border border-slate-200 rounded-[6px] p-2">
        ${staff.map(s => {
          const hasRole = (s.roles || []).some(r => r.id === roleId);
          return `<label class="flex items-center gap-2 py-1.5 px-1 font-normal text-sm cursor-pointer border-b border-slate-200 last:border-b-0">
            <input type="checkbox" value="${s.id}" class="sr-staff-check" ${hasRole ? 'checked' : ''}>
            ${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)} (${escapeHtml(s.staff_id)})
            ${hasRole ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ml-auto">Assigned</span>' : ''}
          </label>`;
        }).join('')}
      </div>
      <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
        <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('superRolesAssignModal')">Cancel</button>
        <button class="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150" onclick="superRolesSaveAssign(${roleId})">Save Assignments</button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200">${err.message}</div>`;
  }
}

async function superRolesSaveAssign(roleId) {
  const checkboxes = document.querySelectorAll('#superRolesAssignContent input[type="checkbox"]');
  const btn = document.querySelector('#superRolesAssignContent .bg-emerald-500');
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
    closeModal('superRolesAssignModal');
    renderSuperAdminRoles();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Save Assignments';
  }
}
