import api from '@/lib/axios';

// Authentication service for handling login, registration, logout, and token refresh
export const authService = {
  // _retry: true prevents the 401 interceptor from attempting a token refresh
  // on auth endpoints — a 401 here means invalid credentials, not an expired token.
  login: (data) => api.post('/auth/login', data, { _retry: true }),

  register: (data) => api.post('/auth/register', data, { _retry: true }),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh', {}, { _retry: true }),

  profile: () => api.get('/profile'),
};
