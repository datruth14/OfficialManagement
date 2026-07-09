let superAdminAdminsData = [];

function isSuperUser() {
  return Auth.user && Auth.user.role === 'super_user';
}

async function renderSuperAdminAdmins() {
  showLoading();
  try {
    superAdminAdminsData = await apiGet('/admins');
    document.getElementById('page-content').innerHTML = `
      <div class="main-header">
        <h1>Team Leaders</h1>
        <p>${isSuperUser() ? 'Manage all team leaders' : 'View all team leaders'}</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h2>All Team Leaders (${superAdminAdminsData.length})</h2>
          <div>
            ${isSuperUser() ? '<button class="btn btn-primary btn-sm" onclick="openModal(\'saAdminsModal\')">+ Add Team Leader</button>' : ''}
            <button class="btn btn-sm btn-secondary" onclick="exportAdminsCSV()">Export CSV</button>
          </div>
        </div>
        <div class="search-bar">
          <input type="text" class="form-control" placeholder="Search team leaders..." id="saSearch" oninput="filterSuperAdminAdmins(this.value)">
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

function renderAdminsTable(data) {
  if (!data.length) return '<div class="empty-state"><p>No team leaders found</p></div>';
  const cols = isSuperUser() ? '<th>Actions</th>' : '';
  return `<div class="table-responsive"><table><thead><tr><th>Fullname</th><th>Username</th><th>Email</th><th>Phone</th><th>Department</th><th>Status</th>${cols}</tr></thead><tbody>
    ${data.map(a => `<tr>
      <td><strong>${escapeHtml(a.fullname)}</strong></td>
      <td>${escapeHtml(a.username)}</td>
      <td>${escapeHtml(a.email) || '-'}</td>
      <td>${escapeHtml(a.phone) || '-'}</td>
      <td>${escapeHtml(a.department) || '-'}</td>
      <td>${getStatusBadge(a.status)}</td>
      ${isSuperUser() ? `<td class="actions">
        <button class="btn btn-sm btn-ghost" onclick="editSuperAdminAdmin(${a.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSuperAdminAdmin(${a.id})">Delete</button>
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
    <div class="modal-overlay" id="saAdminsModal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="saAdminsModalTitle">Add Team Leader</h2>
          <button class="modal-close" onclick="closeModal('saAdminsModal')">&times;</button>
        </div>
        <form id="saAdminsForm" onsubmit="return saveSuperAdminAdmin(event)">
          <input type="hidden" id="sa_admin_id">
          <div class="form-group"><label>Fullname *</label><input class="form-control" id="sa_admin_fullname" required></div>
          <div class="form-row">
            <div class="form-group"><label>Username *</label><input class="form-control" id="sa_admin_username" required></div>
            <div class="form-group"><label>Password</label><input type="password" class="form-control" id="sa_admin_password" placeholder="Leave blank to keep current"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Email</label><input type="email" class="form-control" id="sa_admin_email"></div>
            <div class="form-group"><label>Phone</label><input class="form-control" id="sa_admin_phone"></div>
          </div>
          <div class="form-group"><label>Department</label><input class="form-control" id="sa_admin_department"></div>
          <div class="form-group"><label>Status</label><select class="form-control" id="sa_admin_status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('saAdminsModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
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
