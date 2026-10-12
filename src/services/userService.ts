import api from '@/lib/axios';
import { toListParams } from './listParams';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type { UserDetail, UserInput, UserRow } from '@/types/user';

// Builds the multipart body of user create/update. Axios sets the multipart boundary. An
// empty password is not sent, so an update keeps the current one.
export function toUserFormData(input: UserInput): FormData {
  const payload = new FormData();
  payload.append('name', input.name);
  payload.append('email', input.email);
  payload.append('roleId', input.roleId);
  if (input.password) payload.append('password', input.password);
  if (input.avatar) payload.append('avatar', input.avatar);
  return payload;
}

// FormData is accepted until every caller passes UserInput.
const toBody = (data: UserInput | FormData) =>
  data instanceof FormData ? data : toUserFormData(data);

export const userService = {
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<UserRow>> {
    const res = await api.get('/users', { params: toListParams(params) });
    return res.data;
  },

  async getUser(slug: string): Promise<ApiResponse<UserDetail>> {
    const res = await api.get(`/users/${encodeURIComponent(slug)}`);
    return res.data;
  },

  async createUser(data: UserInput | FormData): Promise<ApiResponse<UserDetail>> {
    const res = await api.post('/users', toBody(data));
    return res.data;
  },

  async updateUser(
    slug: string,
    data: UserInput | FormData,
  ): Promise<ApiResponse<UserDetail>> {
    const res = await api.put(`/users/${encodeURIComponent(slug)}`, toBody(data));
    return res.data;
  },

  async deleteUser(slug: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/users/${encodeURIComponent(slug)}`);
    return res.data;
  },
};
