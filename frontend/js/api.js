const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('text/csv')) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?(.+?)"?$/);
    a.download = match ? match[1] : ('export.csv');
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

function apiGet(endpoint) {
  return apiRequest(endpoint);
}

function apiPost(endpoint, body) {
  return apiRequest(endpoint, { method: 'POST', body });
}

function apiPut(endpoint, body) {
  return apiRequest(endpoint, { method: 'PUT', body });
}

function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}
