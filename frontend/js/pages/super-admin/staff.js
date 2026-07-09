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
  const actionsTh = canModify ? '<th>Actions</th>' : '';

  document.getElementById('page-content').innerHTML = `
    <div class="main-header">
      <h1>Officials Management</h1>
      <p>${canModify ? 'Manage all officials across the system' : 'View all officials across the system'}</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>All Officials (${filtered.length})</h2>
        ${canCreate ? '<button class="btn btn-primary btn-sm" onclick="superStaffOpenCreate()">+ Add Official</button>' : ''}
      </div>
      <div class="search-bar">
        <input type="text" class="form-control" placeholder="Search by name, official ID, email..." id="ssSearch" oninput="renderSuperStaffTable(this.value)">
      </div>
      <div class="table-responsive">
        ${filtered.length ? `<table><thead><tr><th>Official ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Roles</th><th>Status</th>${actionsTh}</tr></thead><tbody>
          ${filtered.map(s => `<tr>
            <td>${escapeHtml(s.staff_id)}</td>
            <td>${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)}</td>
            <td>${escapeHtml(s.email) || '-'}</td>
            <td>${escapeHtml(s.phone) || '-'}</td>
            <td>${escapeHtml(s.gender) || '-'}</td>
            <td>${(s.roles || []).map(r => `<span class="badge badge-active">${escapeHtml(r.name)}</span>`).join(' ') || '-'}</td>
            <td>${getStatusBadge(s.status)}</td>
            ${canModify ? `<td class="actions">
              <button class="btn btn-sm btn-ghost" onclick="superStaffViewProfile(${s.id})">Profile</button>
              <button class="btn btn-sm btn-ghost" onclick="superStaffOpenEdit(${s.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="superStaffDelete(${s.id})">Delete</button>
            </td>` : `<td class="actions"><button class="btn btn-sm btn-ghost" onclick="superStaffViewProfile(${s.id})">Profile</button></td>`}
          </tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>No officials found</p></div>'}
      </div>
    </div>
    ${canCreate || canModify ? superStaffModal() : ''}
    ${superStaffProfileModal()}
  `;
}

function superStaffProfileModal() {
  return `
    <div class="modal-overlay" id="superStaffProfileModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Official Profile</h2>
          <button class="modal-close" onclick="closeModal('superStaffProfileModal')">&times;</button>
        </div>
        <div id="superStaffProfileContent"></div>
      </div>
    </div>
  `;
}

async function superStaffViewProfile(id) {
  openModal('superStaffProfileModal');
  document.getElementById('superStaffProfileContent').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
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
            ${(s.roles || []).length ? (s.roles || []).map(r => `<span class="badge badge-active">${escapeHtml(r.name)}</span>`).join(' ') : '<span style="color:var(--text-light)">None assigned</span>'}
          </div>
          <div style="grid-column:1/-1">
            <strong>Teams:</strong>
            ${(s.teams || []).length ? (s.teams || []).map(t => `<span class="badge badge-admin">${escapeHtml(t.team_name)}</span>`).join(' ') : '<span style="color:var(--text-light)">Not assigned to any team</span>'}
          </div>
        </div>
        <div style="margin-top:16px;text-align:right">
          <button class="btn btn-ghost" onclick="closeModal('superStaffProfileModal')">Close</button>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('superStaffProfileContent').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function superStaffModal() {
  return `
    <div class="modal-overlay" id="superStaffModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="superStaffModalTitle">Add Official</h2>
          <button class="modal-close" onclick="closeModal('superStaffModal')">&times;</button>
        </div>
        <form id="superStaffForm" onsubmit="return superStaffSave(event)">
          <input type="hidden" id="ss_id">
          <div class="form-row">
            <div class="form-group"><label>Firstname *</label><input class="form-control" id="ss_firstname" required></div>
            <div class="form-group"><label>Lastname *</label><input class="form-control" id="ss_lastname" required></div>
          </div>
          <div class="form-group"><label>Official ID (auto-generated if empty)</label><input class="form-control" id="ss_staff_id" placeholder="Leave empty for auto-generate"></div>
          <div class="form-row">
            <div class="form-group"><label>Email</label><input type="email" class="form-control" id="ss_email"></div>
            <div class="form-group"><label>Phone</label><input class="form-control" id="ss_phone"></div>
          </div>
          <div class="form-group"><label>Address</label><textarea class="form-control" id="ss_address"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label>Gender</label><select class="form-control" id="ss_gender"><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
            <div class="form-group"><label>Status</label><select class="form-control" id="ss_status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div class="form-group">
            <label style="margin-bottom:8px;display:block">Assign Roles</label>
            <div id="ss_roles_list" style="display:flex;flex-wrap:wrap;gap:8px;padding:8px;border:1px solid var(--border);border-radius:var(--radius)">
              ${superStaffRoles.map(r => `<label style="display:flex;align-items:center;gap:4px;font-weight:400;font-size:0.85rem;cursor:pointer"><input type="checkbox" value="${r.id}"> ${escapeHtml(r.name)}</label>`).join('')}
            </div>
          </div>
          <p id="ss_form_error" class="alert alert-error" style="display:none"></p>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('superStaffModal')">Cancel</button>
            <button type="submit" class="btn btn-primary" id="ss_submit_btn">Save</button>
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
