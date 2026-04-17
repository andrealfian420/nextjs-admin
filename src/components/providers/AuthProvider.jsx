'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthProvider({ children }) {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  // On component mount, attempt to refresh the authentication token to maintain user session. If the refresh fails (e.g., user is not logged in), it silently fails without disrupting the user experience.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const token = res.data.data.accessToken;
        setAccessToken(token);
      } catch (err) {
        // If the refresh fails, we simply do nothing. The user will be treated as unauthenticated until they log in.
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
