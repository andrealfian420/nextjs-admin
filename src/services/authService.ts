import api from '@/lib/axios';
import axios from 'axios';
import type { ApiResponse } from '@/types/api';
import type {
  AccessTokenData,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from '@/types/auth';
import type { ProfileInput, UserProfile } from '@/types/user';

// Builds the multipart body of PUT /profile. An empty password is not sent, so it stays
// unchanged.
export function toProfileFormData(input: ProfileInput): FormData {
  const payload = new FormData();
  payload.append('name', input.name);
  if (input.password) payload.append('password', input.password);
  if (input.avatar) payload.append('avatar', input.avatar);
  return payload;
}

// Authentication service. Methods resolve with the full AxiosResponse; read `.data.data`.
export const authService = {
  // login/logout/refreshToken go through Next.js API routes so the refreshToken
  // cookie is set on the Next.js domain (making it readable by the proxy).
  login: (data: LoginInput) =>
    axios.post<ApiResponse<AccessTokenData>>('/api/auth/login', data),

  logout: () => axios.post<ApiResponse<null>>('/api/auth/logout'),

  refreshToken: () =>
    axios.post<ApiResponse<AccessTokenData>>('/api/auth/refresh'),

  // Anonymous endpoints: raw axios so a 4xx never triggers the session refresh interceptor.
  forgotPassword: (data: ForgotPasswordInput) =>
    axios.post<ApiResponse<null>>('/api/auth/request-password-reset', data),

  resetPassword: (data: ResetPasswordInput) =>
    axios.post<ApiResponse<null>>('/api/auth/reset-password', data),

  profile: () => api.get<ApiResponse<UserProfile>>('/profile'),

  // FormData is accepted until every caller passes ProfileInput.
  updateProfile: (data: ProfileInput | FormData) =>
    api.put<ApiResponse<UserProfile>>(
      '/profile',
      data instanceof FormData ? data : toProfileFormData(data),
    ),
};
