import api from '@/lib/axios';
import axios from 'axios';

// Authentication service for handling login, registration, logout, and token refresh
export const authService = {
  // login/logout/refreshToken go through Next.js API routes so the refreshToken
  // cookie is set on the Next.js domain (making it readable by middleware).

  login: (data: { email: string; password: string }) =>
    axios.post('/api/auth/login', data),

  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data, { _retry: true } as object),

  logout: () => axios.post('/api/auth/logout'),

  refreshToken: () => axios.post('/api/auth/refresh'),

  forgotPassword: (data: { email: string }) =>
    axios.post('/api/auth/forgot-password', data),

  profile: () => api.get('/profile'),

  updateProfile: (data: FormData | Record<string, unknown>) =>
    api.put('/profile', data),
};
