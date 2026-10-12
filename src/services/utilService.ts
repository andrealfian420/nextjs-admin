import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Option } from '@/types/util';

export const utilService = {
  // Role options: `value` is the role id the user form sends back as `roleId`.
  async getRoleOptions(): Promise<ApiResponse<Option[]>> {
    const res = await api.get('/utils/role-options');
    return res.data;
  },
};
