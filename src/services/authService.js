import api from '@/lib/axios';

// Authentication service for handling login, registration, logout, and token refresh
export const authService = {
  // _retry: true prevents the 401 interceptor from attempting a token refresh
  // on auth endpoints — a 401 here means invalid credentials, not an expired token.

  async login(credentials) {
    const res = await api.post('/auth/login', credentials, { _retry: true });
    return res.data;
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData, { _retry: true });
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async refreshToken() {
    const res = await api.post('/auth/refresh', {}, { _retry: true });
    return res.data;
  },

  async profile() {
    const res = await api.get('/profile');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/profile', profileData);
    return res.data;
  },
};
