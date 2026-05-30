import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

export async function fetchUser(token: string): Promise<void> {
  try {
    const res = await axios.get('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    const user = res.data.data;
    useAuthStore.getState().setUser(user);
  } catch (error: unknown) {
    // If fetching the user fails (e.g., token is invalid), log out the user
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      await forceLogout();
    }
  }
}

export async function forceLogout(): Promise<void> {
  useAuthStore.getState().logout();

  try {
    await axios.post('/api/auth/logout');
  } catch {
    // token might already be invalid, ignore errors during logout
  }

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
