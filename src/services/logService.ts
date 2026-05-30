import api from '@/lib/axios';
import type { FetchParams } from '@/types';

export const logService = {
  async getActivityLogs({
    page = 1,
    per_page = 10,
    search = '',
    sort_by,
    sort_dir,
  }: FetchParams = {}) {
    const params: Record<string, string | number> = { page, per_page };

    if (search) params.search = search;
    if (sort_by) {
      params.sort_by = sort_by;
      params.sort_dir = sort_dir ?? 'asc';
    }

    const res = await api.get(`/activity-logs`, { params });
    return res.data;
  },

  async getActivityLog(id: string | number) {
    const res = await api.get(`/activity-logs/${encodeURIComponent(id)}`);
    return res.data;
  },
};
