'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUser } from '@/lib/auth';

export default function AuthProvider({ children }) {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const accessToken = useAuthStore((state) => state.accessToken);
  const pathname = usePathname();

  // On component mount, attempt to refresh the authentication token to maintain user session.
  // If the refresh fails (e.g., user is not logged in), it silently fails without disrupting the user experience.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authService.refreshToken();

        const token = res.data.data.accessToken;
        setAccessToken(token);

        // fetch user profile after setting the new access token
        await fetchUser(token);
      } catch (err) {
        // If the refresh fails, we simply do nothing. The user will be treated as unauthenticated until they log in.
      }
    };

    initAuth();
  }, []);

  // Re-fetch user profile on every route change to keep permissions in sync.
  // The profile API uses caching, so this won't cause excessive load.
  useEffect(() => {
    if (accessToken) {
      fetchUser(accessToken);
    }
  }, [pathname, accessToken]);

  return <>{children}</>;
}
