import { useAuthStore } from '@/store/useAuthStore';

/**
 * Clears the refreshToken cookie on this app's domain without calling the backend
 * (DELETE /api/auth/logout). Throws when the cookie may still be there.
 */
export async function clearSessionCookie(): Promise<void> {
  const res = await fetch('/api/auth/logout', { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Session cookie was not cleared (HTTP ${res.status})`);
  }
}

let leaving = false;

/**
 * Ends a session the backend has already rejected (refresh answered 4xx): clears local state
 * and the cookie, then reloads on /login so no in-memory state survives. Runs once even when
 * several failing requests call it. If the cookie survives, the proxy sends the browser back
 * to /admin and AuthProvider offers a retry.
 */
export async function forceLogout(
  navigate: (path: string) => void = (path) => window.location.replace(path),
): Promise<void> {
  if (leaving) return;
  leaving = true;

  useAuthStore.getState().logout();

  try {
    await clearSessionCookie();
  } catch {
    // Handled after navigation, see above.
  }

  navigate('/login');
}
