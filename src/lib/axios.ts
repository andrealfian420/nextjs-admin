import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { forceLogout } from './force-logout';
import {
  isTransientError,
  refreshAccessToken,
  SessionEndedError,
} from './refresh-token';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Reject a 401 as is, without refreshing the session. */
    skipAuthRefresh?: boolean;
    /** Set once a request was retried after a refresh; a second 401 is final. */
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach the in-memory access token.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// On 401: refresh once (shared with every concurrent caller), then retry the request once.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = isAxiosError(error) ? error.config : undefined;

    if (
      !config ||
      error.response?.status !== 401 ||
      config.skipAuthRefresh ||
      config._retry
    ) {
      return Promise.reject(error);
    }

    config._retry = true;

    let token: string;
    try {
      token = await refreshAccessToken();
    } catch (refreshError) {
      // A rejected session ends here. An unreachable backend or a logout that already
      // happened leaves the session alone; the caller just sees the failure.
      if (
        !isTransientError(refreshError) &&
        !(refreshError instanceof SessionEndedError)
      ) {
        await forceLogout();
      }
      return Promise.reject(refreshError);
    }

    config.headers.Authorization = `Bearer ${token}`;
    return api(config);
  },
);

export default api;
