import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchUser, forceLogout } from './auth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

// Process the queue of failed requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${apiUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = response.data.data.accessToken;

        useAuthStore.getState().setAccessToken(newToken);

        await fetchUser(newToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);

        forceLogout();

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
