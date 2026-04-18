import api from '@/lib/axios';

export const logService = {
  async getActivityLogs() {
    const res = await api.get(`/activity-logs`);
    return res.data;
  },

  async getActivityLog(id) {
    const res = await api.get(`/activity-logs/${id}`);
    return res.data;
  },
};
