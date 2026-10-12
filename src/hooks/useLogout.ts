'use client';

import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { clearSessionCookie } from '@/lib/force-logout';
import { waitForPendingRefresh } from '@/lib/refresh-token';
import { toast } from 'sonner';
import type { LogoutType } from '@/types/auth';

// POST /api/auth/logout revokes the session on the backend. The BFF clears the cookie on
// every response except an origin rejection (403), so only that and a network failure
// mean the browser may still hold the session.
async function revokeSession(): Promise<void> {
  try {
    await authService.logout();
  } catch (err) {
    if (!isAxiosError(err) || !err.response || err.response.status === 403) {
      throw err;
    }
  }
}

export function useLogout() {
  const router = useRouter();

  // Passed straight to onClick, so anything other than PROFILE_PASSWORD_CHANGED (including
  // a click event) is a regular logout.
  const handleLogout = async (type?: LogoutType) => {
    try {
      // Let a refresh in flight finish, so the cookie it rotates is the one revoked.
      await waitForPendingRefresh();

      if (type === 'PROFILE_PASSWORD_CHANGED') {
        // The backend already ended every session; only the local cookie is left.
        await clearSessionCookie();
      } else {
        await revokeSession();
      }

      useAuthStore.getState().logout();
      router.replace('/login'); // replace: Back must not return to the protected page
    } catch {
      toast.error('Logout failed. Please try again.', {
        position: 'top-center',
      });
    }
  };

  return { handleLogout };
}
