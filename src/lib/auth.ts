import { useAuthStore } from '@/store/useAuthStore';
import api from './axios';

export async function fetchUser(token: string): Promise<void> {
  try {
    const res = await api.get('/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const user = res.data.data;
    useAuthStore.getState().setUser(user);
  } catch {
    // If fetching the user fails after interceptor retry, do nothing.
    // The interceptor will call forceLogout if refresh also fails.
  }
}

export { forceLogout } from './force-logout';
