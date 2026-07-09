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
      <div class="main-header">
        <h1>Roles</h1>
        <p>${isSU ? 'Manage roles and capabilities' : 'View all roles and capabilities'}</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h2>All Roles (${superRolesData.length})</h2>
          ${isSU ? '<button class="btn btn-primary btn-sm" onclick="superRolesOpenCreate()">+ Create Role</button>' : ''}
        </div>
        ${superRolesData.length
          ? `<div class="table-responsive"><table><thead><tr><th>Name</th><th>Description</th><th>Staff Count</th>${isSU ? '<th>Actions</th>' : ''}</tr></thead><tbody>
            ${superRolesData.map(r => `<tr>
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>${escapeHtml(r.description) || '-'}</td>
              <td>${r.staff_count}</td>
              ${isSU ? `<td class="actions">
                <button class="btn btn-sm btn-ghost" onclick="superRolesOpenEdit(${r.id})">Edit</button>
                <button class="btn btn-sm btn-success" onclick="superRolesOpenAssign(${r.id})">Assign</button>
                <button class="btn btn-sm btn-danger" onclick="superRolesDelete(${r.id})">Delete</button>
              </td>` : ''}
            </tr>`).join('')}
          </tbody></table></div>`
          : '<div class="empty-state"><p>No roles yet</p></div>'}
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
    <div class="modal-overlay" id="superRolesModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="superRolesModalTitle">Create Role</h2>
          <button class="modal-close" onclick="closeModal('superRolesModal')">&times;</button>
        </div>
        <form id="superRolesForm" onsubmit="return superRolesSave(event)">
          <input type="hidden" id="sr_id">
          <div class="form-group"><label>Role Name *</label><input class="form-control" id="sr_name" required></div>
          <div class="form-group"><label>Description</label><textarea class="form-control" id="sr_description"></textarea></div>
          <p id="sr_form_error" class="alert alert-error" style="display:none"></p>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('superRolesModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function superRolesAssignModal() {
  return `
    <div class="modal-overlay" id="superRolesAssignModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="superRolesAssignTitle">Assign Officials to Role</h2>
          <button class="modal-close" onclick="closeModal('superRolesAssignModal')">&times;</button>
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
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const staff = await apiGet('/staff');
    content.innerHTML = `
      <p style="margin-bottom:12px;color:var(--text-light)">Select officials to assign to <strong>${escapeHtml(role.name)}</strong></p>
      <div style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:8px">
        ${staff.map(s => {
          const hasRole = (s.roles || []).some(r => r.id === roleId);
          return `<label style="display:flex;align-items:center;gap:8px;padding:6px 4px;font-weight:400;font-size:0.9rem;cursor:pointer;border-bottom:1px solid var(--border)">
            <input type="checkbox" value="${s.id}" class="sr-staff-check" ${hasRole ? 'checked' : ''}>
            ${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)} (${escapeHtml(s.staff_id)})
            ${hasRole ? '<span class="badge badge-active" style="margin-left:auto">Assigned</span>' : ''}
          </label>`;
        }).join('')}
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal('superRolesAssignModal')">Cancel</button>
        <button class="btn btn-success" onclick="superRolesSaveAssign(${roleId})">Save Assignments</button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function superRolesSaveAssign(roleId) {
  const checkboxes = document.querySelectorAll('#superRolesAssignContent input[type="checkbox"]');
  const btn = document.querySelector('#superRolesAssignContent .btn-success');
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
