let adminStaffData = [];
let adminStaffRoles = [];

async function renderAdminStaff() {
  showLoading();
  try {
    const [roles, staff] = await Promise.all([
      apiGet('/roles'),
      apiGet('/staff'),
    ]);
    adminStaffRoles = roles;
    adminStaffData = staff;
    renderAdminStaffTable();
  } catch (err) {
    showError(err.message);
  }
}

function renderAdminStaffTable(search) {
  const filtered = search
    ? adminStaffData.filter(s =>
        (s.firstname + ' ' + s.lastname).toLowerCase().includes(search.toLowerCase()) ||
        (s.staff_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : adminStaffData;

  document.getElementById('page-content').innerHTML = `
    <div class="main-header">
      <h1>Officials Management</h1>
      <p>Manage your officials</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>All Officials (${filtered.length})</h2>
        <button class="btn btn-primary btn-sm" onclick="adminStaffOpenCreate()">+ Add Official</button>
      </div>
      <div class="search-bar">
        <input type="text" class="form-control" placeholder="Search by name, email, phone..." id="staffSearchInput" oninput="renderAdminStaffTable(this.value)">
      </div>
      <div class="table-responsive">
        ${filtered.length ? `<table><thead><tr>          <th>Official ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Roles</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          ${filtered.map(s => `<tr>
            <td>${escapeHtml(s.staff_id)}</td>
            <td>${escapeHtml(s.firstname)} ${escapeHtml(s.lastname)}</td>
            <td>${escapeHtml(s.email) || '-'}</td>
            <td>${escapeHtml(s.phone) || '-'}</td>
            <td>${escapeHtml(s.gender) || '-'}</td>
            <td>${(s.roles || []).map(r => `<span class="badge badge-active">${escapeHtml(r.name)}</span>`).join(' ') || '-'}</td>
            <td>${getStatusBadge(s.status)}</td>
            <td class="actions">
              <button class="btn btn-sm btn-ghost" onclick="adminStaffViewProfile(${s.id})">Profile</button>
              <button class="btn btn-sm btn-ghost" onclick="adminStaffOpenEdit(${s.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="adminStaffDelete(${s.id})">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>No officials found</p></div>'}
      </div>
    </div>
    ${adminStaffModal()}
    ${adminStaffProfileModal()}
  `;
}

function adminStaffResetForm() {
  document.getElementById('as_id').value = '';
  document.getElementById('as_firstname').value = '';
  document.getElementById('as_lastname').value = '';
  document.getElementById('as_email').value = '';
  document.getElementById('as_phone').value = '';
  document.getElementById('as_gender').value = '';
  document.getElementById('as_status').value = 'active';
  document.getElementById('as_address').value = '';
  document.querySelectorAll('#as_roles_list input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('adminStaffModalTitle').textContent = 'Add Official';
  document.getElementById('as_form_error').textContent = '';
  document.getElementById('as_form_error').style.display = 'none';
}

function adminStaffOpenCreate() {
  adminStaffResetForm();
  openModal('adminStaffModal');
}

function adminStaffOpenEdit(id) {
  const s = adminStaffData.find(x => x.id === id);
  if (!s) return;
  document.getElementById('as_id').value = s.id;
  document.getElementById('as_firstname').value = s.firstname;
  document.getElementById('as_lastname').value = s.lastname;
  document.getElementById('as_email').value = s.email || '';
  document.getElementById('as_phone').value = s.phone || '';
  document.getElementById('as_gender').value = s.gender || '';
  document.getElementById('as_status').value = s.status;
  document.getElementById('as_address').value = s.address || '';
  document.getElementById('adminStaffModalTitle').textContent = 'Edit Official';
  document.getElementById('as_form_error').textContent = '';
  document.getElementById('as_form_error').style.display = 'none';
  const roles = s.roles || [];
  document.querySelectorAll('#as_roles_list input[type="checkbox"]').forEach(cb => {
    cb.checked = roles.some(r => r.id === parseInt(cb.value));
  });
  openModal('adminStaffModal');
}

function adminStaffModal() {
  return `
    <div class="modal-overlay" id="adminStaffModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="adminStaffModalTitle">Add Official</h2>
          <button class="modal-close" onclick="closeModal('adminStaffModal')">&times;</button>
        </div>
        <form id="adminStaffForm" onsubmit="return adminStaffSave(event)">
          <input type="hidden" id="as_id">
          <div class="form-row">
            <div class="form-group"><label>Firstname *</label><input class="form-control" id="as_firstname" required></div>
            <div class="form-group"><label>Lastname *</label><input class="form-control" id="as_lastname" required></div>
          </div>
          <div class="form-group"><label>Official ID (auto-generated if empty)</label><input class="form-control" id="as_staff_id" placeholder="Leave empty for auto-generate"></div>
          <div class="form-row">
            <div class="form-group"><label>Email</label><input type="email" class="form-control" id="as_email"></div>
            <div class="form-group"><label>Phone</label><input class="form-control" id="as_phone"></div>
          </div>
          <div class="form-group"><label>Address</label><textarea class="form-control" id="as_address"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label>Gender</label><select class="form-control" id="as_gender"><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
            <div class="form-group"><label>Status</label><select class="form-control" id="as_status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div class="form-group">
            <label style="margin-bottom:8px;display:block">Assign Roles</label>
            <div id="as_roles_list" style="display:flex;flex-wrap:wrap;gap:8px;padding:8px;border:1px solid var(--border);border-radius:var(--radius)">
              ${adminStaffRoles.map(r => `<label style="display:flex;align-items:center;gap:4px;font-weight:400;font-size:0.85rem;cursor:pointer"><input type="checkbox" value="${r.id}"> ${escapeHtml(r.name)}</label>`).join('')}
            </div>
          </div>
          <p id="as_form_error" class="alert alert-error" style="display:none"></p>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('adminStaffModal')">Cancel</button>
            <button type="submit" class="btn btn-primary" id="as_submit_btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function adminStaffProfileModal() {
  return `
    <div class="modal-overlay" id="adminStaffProfileModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Official Profile</h2>
          <button class="modal-close" onclick="closeModal('adminStaffProfileModal')">&times;</button>
        </div>
        <div id="adminStaffProfileContent"></div>
      </div>
    </div>
  `;
}

async function adminStaffViewProfile(id) {
  openModal('adminStaffProfileModal');
  document.getElementById('adminStaffProfileContent').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const s = await apiGet('/staff/' + id);
    document.getElementById('adminStaffProfileContent').innerHTML = `
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
            ${(s.roles || []).length ? (s.roles || []).map(r => `<span class="badge badge-active">${escapeHtml(r.name)}</span>`).join(' ') : '<span class="text-light">None assigned</span>'}
          </div>
          <div style="grid-column:1/-1">
            <strong>Teams:</strong>
            ${(s.teams || []).length ? (s.teams || []).map(t => `<span class="badge badge-admin">${escapeHtml(t.team_name)}</span>`).join(' ') : '<span class="text-light">Not assigned to any team</span>'}
          </div>
        </div>
        <div style="margin-top:16px;text-align:right">
          <button class="btn btn-ghost" onclick="closeModal('adminStaffProfileModal')">Close</button>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('adminStaffProfileContent').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function adminStaffSave(e) {
  e.preventDefault();
  const id = document.getElementById('as_id').value;
  const data = {
    firstname: document.getElementById('as_firstname').value,
    lastname: document.getElementById('as_lastname').value,
    staff_id: document.getElementById('as_staff_id').value,
    email: document.getElementById('as_email').value,
    phone: document.getElementById('as_phone').value,
    gender: document.getElementById('as_gender').value,
    status: document.getElementById('as_status').value,
    address: document.getElementById('as_address').value,
  };

  const roleCheckboxes = document.querySelectorAll('#as_roles_list input[type="checkbox"]:checked');
  data.role_ids = Array.from(roleCheckboxes).map(cb => parseInt(cb.value));

  const btn = document.getElementById('as_submit_btn');
  const errDiv = document.getElementById('as_form_error');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (id) {
      await apiPut('/staff/' + id, data);
    } else {
      await apiPost('/staff', data);
    }
    closeModal('adminStaffModal');
    renderAdminStaff();
  } catch (err) {
    errDiv.textContent = err.message;
    errDiv.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Save';
  }
}

async function adminStaffDelete(id) {
  if (!confirm('Are you sure you want to delete this official?')) return;
  try {
    await apiDelete('/staff/' + id);
    renderAdminStaff();
  } catch (err) {
    alert(err.message);
  }
}
