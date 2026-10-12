import api from '@/lib/axios';
import { toListParams } from './listParams';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type { PermissionModule, Role, RoleInput, RoleRow } from '@/types/role';

// Role service. Permissions travel as `access: string[]`.
export const roleService = {
  async getRoles(params?: PaginationParams): Promise<PaginatedResponse<RoleRow>> {
    const res = await api.get('/roles', { params: toListParams(params) });
    return res.data;
  },

  async getRole(slug: string): Promise<ApiResponse<Role>> {
    const res = await api.get(`/roles/${encodeURIComponent(slug)}`);
    return res.data;
  },

  async createRole(data: RoleInput): Promise<ApiResponse<Role>> {
    const res = await api.post('/roles', data);
    return res.data;
  },

  async updateRole(slug: string, data: RoleInput): Promise<ApiResponse<Role>> {
    const res = await api.put(`/roles/${encodeURIComponent(slug)}`, data);
    return res.data;
  },

  async deleteRole(slug: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/roles/${encodeURIComponent(slug)}`);
    return res.data;
  },

  async getAccessList(): Promise<ApiResponse<PermissionModule[]>> {
    const res = await api.get('/roles/access-list');
    return res.data;
  },

  // User types a role may carry (e.g. Administrator, Member).
  async getUserTypes(): Promise<ApiResponse<string[]>> {
    const res = await api.get('/roles/user-types');
    return res.data;
  },
};
