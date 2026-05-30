import api from '@/lib/axios';

export const utilService = {
  async getRoleOptions() {
    const res = await api.get(`/utils/role-options`);
    return res.data;
  },
};
