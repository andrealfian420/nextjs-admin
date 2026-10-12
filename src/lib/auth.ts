import { useAuthStore } from '@/store/useAuthStore';
import type { ApiResponse } from '@/types/api';
import type { UserProfile } from '@/types/user';
import api from './axios';
import {
  isTransientError,
  refreshAccessToken,
  SessionEndedError,
} from './refresh-token';

/**
 * GET /profile into the store. `skipAuthRefresh` turns a 401 into a plain failure, which is
 * what session restore needs right after a refresh. Drops the result if a logout happened
 * meanwhile.
 */
async function loadProfile(skipAuthRefresh: boolean): Promise<void> {
  const version = useAuthStore.getState().sessionVersion;
  const res = await api.get<ApiResponse<UserProfile>>('/profile', {
    skipAuthRefresh,
  });

  if (useAuthStore.getState().sessionVersion !== version) {
    throw new SessionEndedError();
  }
  useAuthStore.getState().setUser(res.data.data);
}

/**
 * Re-reads the profile (e.g. on navigation) so permission changes apply without a reload.
 * Failures keep the current user; an expired token is refreshed by the interceptor.
 */
export async function refreshProfile(): Promise<void> {
  try {
    await loadProfile(false);
  } catch {
    // Keep the last known profile.
  }
}

export type RestoreResult = 'authenticated' | 'anonymous' | 'unreachable';

let restoring: Promise<RestoreResult> | null = null;

/**
 * Restores the session from the refresh cookie: refresh, then load the profile.
 * - authenticated: token and user are in the store
 * - anonymous: no usable session (no cookie, rejected token, malformed response)
 * - unreachable: the backend could not answer; the session may still be valid
 * Concurrent calls (StrictMode runs effects twice) share one attempt.
 */
export function restoreSession(): Promise<RestoreResult> {
  restoring ??= (async (): Promise<RestoreResult> => {
    try {
      await refreshAccessToken();
      await loadProfile(true);
      return 'authenticated';
    } catch (err) {
      return isTransientError(err) ? 'unreachable' : 'anonymous';
    }
  })().finally(() => {
    restoring = null;
  });

  return restoring;
}
