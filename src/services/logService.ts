import api from '@/lib/axios';
import { toListParams } from './listParams';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type { ActivityLog, ActivityLogRow } from '@/types/log';

export const logService = {
  async getActivityLogs(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<ActivityLogRow>> {
    const res = await api.get('/activity-logs', { params: toListParams(params) });
    return res.data;
  },

  async getActivityLog(id: string | number): Promise<ApiResponse<ActivityLog>> {
    const res = await api.get(`/activity-logs/${encodeURIComponent(id)}`);
    return res.data;
  },
};
