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
      <div class="main-header">
        <h1>Role Management</h1>
        <p>Manage official roles and capabilities</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h2>All Roles (${adminRolesData.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="adminRolesOpenCreate()">+ Create Role</button>
        </div>
        <div class="table-responsive">
          ${adminRolesData.length ? `<table><thead><tr><th>Name</th><th>Description</th><th>Staff Count</th><th>Actions</th></tr></thead><tbody>
            ${adminRolesData.map(r => `<tr>
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>${escapeHtml(r.description) || '-'}</td>
              <td>${r.staff_count}</td>
              <td class="actions">
                <button class="btn btn-sm btn-ghost" onclick="adminRolesOpenEdit(${r.id})">Edit</button>
                <button class="btn btn-sm btn-success" onclick="adminRolesOpenAssign(${r.id})">Assign</button>
                <button class="btn btn-sm btn-danger" onclick="adminRolesDelete(${r.id})">Delete</button>
              </td>
            </tr>`).join('')}
          </tbody></table>` : '<div class="empty-state"><p>No roles yet</p></div>'}
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
    <div class="modal-overlay" id="adminRolesModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="adminRolesModalTitle">Create Role</h2>
          <button class="modal-close" onclick="closeModal('adminRolesModal')">&times;</button>
        </div>
        <form id="adminRolesForm" onsubmit="return adminRolesSave(event)">
          <input type="hidden" id="ar_id">
          <div class="form-group"><label>Role Name *</label><input class="form-control" id="ar_name" required></div>
          <div class="form-group"><label>Description</label><textarea class="form-control" id="ar_description"></textarea></div>
          <p id="ar_form_error" class="alert alert-error" style="display:none"></p>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('adminRolesModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function adminRolesAssignModal() {
  return `
    <div class="modal-overlay" id="adminRolesAssignModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="adminRolesAssignTitle">Assign Officials to Role</h2>
          <button class="modal-close" onclick="closeModal('adminRolesAssignModal')">&times;</button>
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
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

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
            ${hasRole ? '<span class="badge badge-active" style="margin-left:auto">Assigned</span>' : ''}
          </label>`;
        }).join('')}
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal('adminRolesAssignModal')">Cancel</button>
        <button class="btn btn-success" onclick="adminRolesSaveAssign(${roleId})">Save Assignments</button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function adminRolesSaveAssign(roleId) {
  const checkboxes = document.querySelectorAll('#adminRolesAssignContent input[type="checkbox"]');
  const btn = document.querySelector('#adminRolesAssignContent .btn-success');
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
