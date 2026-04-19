import api from '@/lib/axios';

// Role service for handling role-related API requests
export const roleService = {
  async getRoles({
    page = 1,
    per_page = 10,
    search = '',
    sort_by,
    sort_dir,
  } = {}) {
    const params = { page, per_page };

    if (search) params.search = search;
    if (sort_by) {
      params.sort_by = sort_by;
      params.sort_dir = sort_dir ?? 'asc';
    }

    const res = await api.get(`/roles`, { params });
    return res.data;
  },

  async getRole(roleId) {
    const res = await api.get(`/roles/${encodeURIComponent(roleId)}`);
    return res.data;
  },

  async createRole(roleData) {
    const res = await api.post('/roles', roleData);
    return res.data;
  },

  async updateRole(roleId, roleData) {
    const res = await api.put(`/roles/${encodeURIComponent(roleId)}`, roleData);
    return res.data;
  },

  async deleteRole(roleId) {
    const res = await api.delete(`/roles/${encodeURIComponent(roleId)}`);
    return res.data;
  },

  async getAccessList() {
    const res = await api.get('/roles/access-list');
    return res.data;
  },
};
