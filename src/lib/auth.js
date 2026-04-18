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
    // logout user if fetching profile fails (e.g., token is invalid)
    forceLogout();
  }
}

export function forceLogout() {
  useAuthStore.getState().logout();

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
