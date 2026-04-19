import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function fetchUser(token) {
  try {
    const res = await axios.get(`${apiUrl}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    const user = res.data.data;
    useAuthStore.getState().setUser(user);
  } catch (error) {
    // If fetching the user fails (e.g., token is invalid), log out the user
    if (error.response?.status === 401 || error.response?.status === 403) {
      await forceLogout();
    }
  }
}

export async function forceLogout() {
  useAuthStore.getState().logout();

  try {
    await axios.post(`${apiUrl}/logout`, null, {
      withCredentials: true,
    });
  } catch {
    // token might already be invalid, ignore errors during logout
    // keep redirecting the user to the login page to avoid confusion
  }

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
