import api from '@/lib/axios';

export const userService = {
  async getUsers({
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

    const res = await api.get(`/users`, { params });
    return res.data;
  },

  async getUser(slug) {
    const res = await api.get(`/users/${encodeURIComponent(slug)}`);
    return res.data;
  },

  async createUser(data) {
    const res = await api.post(`/users`, data);
    return res.data;
  },

  async updateUser(slug, data) {
    const res = await api.put(`/users/${encodeURIComponent(slug)}`, data);
    return res.data;
  },

  async deleteUser(slug) {
    const res = await api.delete(`/users/${encodeURIComponent(slug)}`);
    return res.data;
  },
};
