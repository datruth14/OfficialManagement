let superAdminEventsData = [];

async function renderSuperAdminEvents() {
  showLoading();
  try {
    superAdminEventsData = await apiGet('/events');
    document.getElementById('page-content').innerHTML = `
      <div>
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Events</h1>
        <p class="text-sm text-slate-400 mt-1">Manage all events</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5">
          <h2 class="text-base md:text-lg font-bold text-slate-900">All Events (${superAdminEventsData.length})</h2>
          <button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline text-xs px-3 py-1.5 w-full md:w-auto justify-center" onclick="openModal('superEventsModal')">+ Add Event</button>
        </div>
        <div class="flex flex-col md:flex-row gap-3 mb-5 items-stretch md:items-center">
          <input type="text" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 max-w-full md:max-w-[340px]" placeholder="Search events..." id="seSearch" oninput="filterSuperAdminEvents(this.value)">
        </div>
        <div id="seTableContainer">
          ${renderEventsTable(superAdminEventsData)}
        </div>
      </div>
      ${superAdminEventsModal()}
      ${superAdminEventsTeamsModal()}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function renderEventsTable(data) {
  if (!data.length) return '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No events found</p></div>';
  return `<div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Event Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Venue</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Date</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Time</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Teams</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Officials</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Status</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th></tr></thead><tbody>
    ${data.map(e => `<tr>
      <td data-label="Event Name" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><strong>${escapeHtml(e.event_name)}</strong></td>
      <td data-label="Venue" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(e.venue) || '-'}</td>
      <td data-label="Date" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.event_date || '-'}</td>
      <td data-label="Time" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.start_time || ''}${e.start_time && e.end_time ? ' - ' : ''}${e.end_time || ''}</td>
      <td data-label="Teams" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.team_count}</td>
      <td data-label="Officials" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.staff_count}</td>
      <td data-label="Status" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${getStatusBadge(e.status)}</td>
      <td data-label="Actions" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">
        <div class="flex gap-1 flex-nowrap">
          <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150 text-xs px-3 py-1.5" onclick="viewSuperEventTeams(${e.id})">Teams</button>
          <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150 text-xs px-3 py-1.5" onclick="editSuperAdminEvent(${e.id})">Edit</button>
          <button class="bg-red-500 hover:bg-red-600 text-white rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold border-none transition-all duration-150 text-xs px-3 py-1.5" onclick="deleteSuperAdminEvent(${e.id})">Delete</button>
        </div>
      </td>
    </tr>`).join('')}
  </tbody></table></div>`;
}

function filterSuperAdminEvents(search) {
  const filtered = search
    ? superAdminEventsData.filter(e => e.event_name.toLowerCase().includes(search.toLowerCase()))
    : superAdminEventsData;
  document.getElementById('seTableContainer').innerHTML = renderEventsTable(filtered);
}

function superAdminEventsModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="superEventsModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="superEventsModalTitle">Add Event</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('superEventsModal')">&times;</button>
        </div>
        <form id="superEventsForm" onsubmit="return saveSuperAdminEvent(event)">
          <input type="hidden" id="se_id">
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Event Name *</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="se_name" required></div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Description</label><textarea class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="se_description"></textarea></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Venue</label><input class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="se_venue"></div>
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Date</label><input type="date" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="se_date"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Start Time</label><input type="time" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="se_start"></div>
            <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">End Time</label><input type="time" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150" id="se_end"></div>
          </div>
          <div class="mb-4 md:mb-5"><label class="block text-xs font-semibold mb-1.5 text-slate-900">Status</label><select class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 appearance-none cursor-pointer" id="se_status"><option value="active">Active</option><option value="archived">Archived</option></select></div>
          <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7">
            <button type="button" class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="closeModal('superEventsModal')">Cancel</button>
            <button type="submit" class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function superAdminEventsTeamsModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="superEventsTeamsModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="superEventsTeamsTitle">Event Teams</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('superEventsTeamsModal')">&times;</button>
        </div>
        <div id="superEventsTeamsContent"></div>
      </div>
    </div>
  `;
}

async function saveSuperAdminEvent(e) {
  e.preventDefault();
  const id = document.getElementById('se_id').value;
  const data = {
    event_name: document.getElementById('se_name').value,
    description: document.getElementById('se_description').value,
    venue: document.getElementById('se_venue').value,
    event_date: document.getElementById('se_date').value,
    start_time: document.getElementById('se_start').value,
    end_time: document.getElementById('se_end').value,
    status: document.getElementById('se_status').value,
  };
  try {
    if (id) await apiPut('/events/' + id, data);
    else await apiPost('/events', data);
    closeModal('superEventsModal');
    renderSuperAdminEvents();
  } catch (err) {
    alert(err.message);
  }
}

function editSuperAdminEvent(id) {
  const e = superAdminEventsData.find(x => x.id === id);
  if (!e) return;
  document.getElementById('se_id').value = e.id;
  document.getElementById('se_name').value = e.event_name;
  document.getElementById('se_description').value = e.description || '';
  document.getElementById('se_venue').value = e.venue || '';
  document.getElementById('se_date').value = e.event_date || '';
  document.getElementById('se_start').value = e.start_time || '';
  document.getElementById('se_end').value = e.end_time || '';
  document.getElementById('se_status').value = e.status;
  document.getElementById('superEventsModalTitle').textContent = 'Edit Event';
  openModal('superEventsModal');
}

async function deleteSuperAdminEvent(id) {
  if (!confirm('Delete this event?')) return;
  try {
    await apiDelete('/events/' + id);
    renderSuperAdminEvents();
  } catch (err) {
    alert(err.message);
  }
}

async function viewSuperEventTeams(eventId) {
  openModal('superEventsTeamsModal');
  document.getElementById('superEventsTeamsContent').innerHTML = '<div class="text-center py-16 md:py-20 text-slate-400"><div class="spinner"></div></div>';
  try {
    const teams = await apiGet('/events/' + eventId + '/teams');
    const event = superAdminEventsData.find(e => e.id === eventId);
    document.getElementById('superEventsTeamsTitle').textContent = 'Teams - ' + (event ? escapeHtml(event.event_name) : '');
    document.getElementById('superEventsTeamsContent').innerHTML = teams.length
      ? `<div style="max-height:400px;overflow-y:auto">
          ${teams.map(t => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <div>
                <strong>${escapeHtml(t.team_name)}</strong>
                <div style="font-size:0.8rem;color:var(--text-light)">${t.member_count} member(s)</div>
              </div>
              <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-4 py-2 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150 text-xs px-3 py-1.5" onclick="Router.navigate('/super-admin/teams')">View</button>
            </div>
          `).join('')}
        </div>
        <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7" style="margin-top:16px">
          <button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline" onclick="closeModal('superEventsTeamsModal')">Close</button>
        </div>`
      : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No teams assigned to this event</p></div>';
  } catch (err) {
    document.getElementById('superEventsTeamsContent').innerHTML = `<div class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200">${err.message}</div>`;
  }
}
