const API_BASE = '/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    const data = await response.json();

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan');
    return data;
  },

  login: (username, password) => api.request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getProfile: () => api.request('/auth/profile'),

  getSurat: (params) => { const q = new URLSearchParams(params).toString(); return api.request(`/surat?${q}`); },
  getSuratById: (id) => api.request(`/surat/${id}`),
  createSurat: (formData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_BASE}/surat`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData })
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.message || 'Gagal menyimpan surat'); return data; });
  },
  getStats: () => api.request('/surat/stats'),
  getPosisiAll: () => api.request('/surat/posisi'),
  downloadSuratFile: (id) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_BASE}/surat/${id}/download`, { headers: { Authorization: `Bearer ${token}` } });
  },

  getKomentar: (suratId) => api.request(`/surat/${suratId}/komentar`),
  addKomentar: (suratId, isi) => api.request(`/surat/${suratId}/komentar`, { method: 'POST', body: JSON.stringify({ isi }) }),
  deleteKomentar: (id) => api.request(`/surat/0/komentar/${id}`, { method: 'DELETE' }),

  getDisposisi: (params) => { const q = new URLSearchParams(params).toString(); return api.request(`/disposisi?${q}`); },
  getDisposisiById: (id) => api.request(`/disposisi/${id}`),
  createDisposisi: (data) => api.request('/disposisi', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (data) => api.request('/status', { method: 'POST', body: JSON.stringify(data) }),

  getNotifikasi: (params) => { const q = new URLSearchParams(params).toString(); return api.request(`/notifikasi?${q}`); },
  getUnreadCount: () => api.request('/notifikasi/unread-count'),
  markAsRead: (id) => api.request(`/notifikasi/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => api.request('/notifikasi/read-all', { method: 'PUT' }),

  generateLaporan: (data) => api.request('/laporan/generate', { method: 'POST', body: JSON.stringify(data) }),
  exportLaporanPDF: (params) => {
    const q = new URLSearchParams(params).toString();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_BASE}/laporan/pdf?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },

  getPengguna: () => api.request('/pengguna'),
  getPenggunaById: (id) => api.request(`/pengguna/${id}`),
  createPengguna: (data) => api.request('/pengguna', { method: 'POST', body: JSON.stringify(data) }),
  updatePengguna: (id, data) => api.request(`/pengguna/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (id, password) => api.request(`/pengguna/${id}/password`, { method: 'PUT', body: JSON.stringify({ password }) }),
  deletePengguna: (id) => api.request(`/pengguna/${id}`, { method: 'DELETE' }),
  getGuruStaf: () => api.request('/pengguna/guru-staf'),

  trackSurat: (nomorSurat) => api.request(`/public/lacak?nomorSurat=${encodeURIComponent(nomorSurat)}`),
};

export default api;
