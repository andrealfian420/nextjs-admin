import { apiFetch } from '@/lib/api';

// Authentication service for handling login, registration, logout, and token refresh
export const authService = {
  login: (data) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch('/auth/logout', {
      method: 'POST',
    }),

  refreshToken: () =>
    apiFetch('/auth/refresh-token', {
      method: 'POST',
    }),
};
