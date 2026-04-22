import api from '@/lib/axios';
import axios from 'axios';

// Authentication service for handling login, registration, logout, and token refresh
export const authService = {
  // login/logout/refreshToken go through Next.js API routes so the refreshToken
  // cookie is set on the Next.js domain (making it readable by middleware).

  login: (data) => axios.post('/api/auth/login', data),

  register: (data) => api.post('/auth/register', data, { _retry: true }),

  logout: () => axios.post('/api/auth/logout'),

  refreshToken: () => axios.post('/api/auth/refresh'),

  profile: () => api.get('/profile'),

  updateProfile: (data) => api.put('/profile', data),
};
