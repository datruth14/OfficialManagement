let adminEventsData = [];

async function renderAdminEvents() {
  showLoading();
  try {
    adminEventsData = await apiGet('/events');
    document.getElementById('page-content').innerHTML = `
      <div class="mb-6 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Events</h1>
        <p class="text-sm text-slate-400 mt-1">View all events</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-7 mb-6 transition-all duration-200 hover:shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 mb-5">
          <h2 class="text-base md:text-lg font-bold text-slate-900">All Events (${adminEventsData.length})</h2>
        </div>
        <div class="flex flex-col md:flex-row gap-3 mb-5 items-stretch md:items-center">
          <input type="text" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-[6px] text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all duration-150 max-w-full md:max-w-[340px]" placeholder="Search events..." id="aeSearch" oninput="filterAdminEvents(this.value)">
        </div>
        <div id="aeTableContainer">
          ${renderAdminEventsTable(adminEventsData)}
        </div>
      </div>
      ${adminEventsTeamsModal()}
    `;
  } catch (err) {
    showError(err.message);
  }
}

function renderAdminEventsTable(data) {
  if (!data.length) return '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No events found</p></div>';
  return `<div class="table-responsive"><table class="w-full border-collapse"><thead><tr><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Event Name</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Venue</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Date</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Time</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Teams</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Officials</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Status</th><th class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold px-3 md:px-4 py-3 text-left border-b border-slate-200">Actions</th></tr></thead><tbody>
    ${data.map(e => `<tr>
      <td data-label="Event Name" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle"><strong>${escapeHtml(e.event_name)}</strong></td>
      <td data-label="Venue" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${escapeHtml(e.venue) || '-'}</td>
      <td data-label="Date" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.event_date || '-'}</td>
      <td data-label="Time" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.start_time || ''}${e.start_time && e.end_time ? ' - ' : ''}${e.end_time || ''}</td>
      <td data-label="Teams" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.team_count}</td>
      <td data-label="Officials" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${e.staff_count}</td>
      <td data-label="Status" class="px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">${getStatusBadge(e.status)}</td>
      <td data-label="Actions" class="flex gap-1 flex-nowrap px-3 md:px-4 py-3 text-sm border-b border-slate-200 align-middle">
        <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="viewAdminEventTeams(${e.id})">Teams</button>
      </td>
    </tr>`).join('')}
  </tbody></table></div>`;
}

function filterAdminEvents(search) {
  const filtered = search
    ? adminEventsData.filter(e => e.event_name.toLowerCase().includes(search.toLowerCase()))
    : adminEventsData;
  document.getElementById('aeTableContainer').innerHTML = renderAdminEventsTable(filtered);
}

function adminEventsTeamsModal() {
  return `
    <div class="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] hidden items-center justify-center backdrop-blur-[4px]" id="adminEventsTeamsModal">
      <div class="bg-white rounded-xl shadow-2xl w-[92%] max-w-[580px] max-h-[85vh] overflow-y-auto p-5 md:p-8 animate-[modalIn_0.2s_ease]">
        <div class="flex justify-between items-center mb-5 md:mb-6">
          <h2 class="text-base md:text-lg font-bold" id="adminEventsTeamsTitle">Event Teams</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-slate-400 p-1 px-2.5 rounded-[6px] leading-none transition-all duration-150 hover:bg-surface hover:text-slate-900" onclick="closeModal('adminEventsTeamsModal')">&times;</button>
        </div>
        <div id="adminEventsTeamsContent"></div>
      </div>
    </div>
  `;
}

async function viewAdminEventTeams(eventId) {
  openModal('adminEventsTeamsModal');
  document.getElementById('adminEventsTeamsTitle').textContent = 'Event Teams';
  document.getElementById('adminEventsTeamsContent').innerHTML = '<div class="text-center py-16 md:py-20 text-slate-400"><div class="spinner"></div></div>';
  try {
    const teams = await apiGet('/events/' + eventId + '/teams');
    const event = adminEventsData.find(e => e.id === eventId);
    document.getElementById('adminEventsTeamsTitle').textContent = 'Teams - ' + (event ? escapeHtml(event.event_name) : '');
    document.getElementById('adminEventsTeamsContent').innerHTML = teams.length
      ? `<div style="max-height:400px;overflow-y:auto">
          ${teams.map(t => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <div>
                <strong>${escapeHtml(t.team_name)}</strong>
                <div style="font-size:0.8rem;color:var(--text-light)">${t.member_count} member(s)</div>
              </div>
              <button class="bg-transparent border border-slate-200 text-slate-500 hover:bg-surface rounded-[6px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs cursor-pointer font-semibold transition-all duration-150" onclick="Router.navigate('/admin/teams')">View</button>
            </div>
          `).join('')}
        </div>
        <div class="flex flex-col md:flex-row gap-2.5 justify-end mt-6 md:mt-7" style="margin-top:16px">
          <button class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold rounded-[6px] px-4 md:px-5 py-2 md:py-2.5 inline-flex items-center gap-1.5 text-xs md:text-sm cursor-pointer border-none transition-all duration-150 no-underline" onclick="closeModal('adminEventsTeamsModal')">Close</button>
        </div>`
      : '<div class="text-center py-12 md:py-16 text-slate-400"><p class="mb-4 text-sm">No teams assigned to this event</p></div>';
  } catch (err) {
    document.getElementById('adminEventsTeamsContent').innerHTML = `<div class="p-3.5 md:p-4 rounded-[6px] mb-4 text-sm bg-red-50 text-red-700 border border-red-200">${err.message}</div>`;
  }
}
