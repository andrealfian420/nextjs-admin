import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import type { ApiResponse } from '@/types/api';
import type { AccessTokenData } from '@/types/auth';

/** A logout happened while the request was in flight; its result must be dropped. */
export class SessionEndedError extends Error {
  constructor() {
    super('The session ended while the request was in flight');
    this.name = 'SessionEndedError';
  }
}

/**
 * True when the failure says nothing about the session itself: no response (network) or a
 * 5xx. Callers keep the session and let the user retry instead of logging out.
 */
export function isTransientError(err: unknown): boolean {
  return isAxiosError(err) && (!err.response || err.response.status >= 500);
}

// The refresh in flight, shared by every caller until it settles.
let pending: Promise<string> | null = null;

/**
 * Single-flight access-token refresh. Concurrent callers (AuthProvider, StrictMode's double
 * effect, parallel 401s in the axios interceptor) share one POST /api/auth/refresh, so a
 * rotating refresh token is never presented twice. Raw axios keeps this out of the api
 * instance's 401 interceptor. Only one page context is covered: two tabs can still refresh
 * at the same time (the backend tolerates that within its grace window).
 */
export function refreshAccessToken(): Promise<string> {
  if (pending) return pending;

  const version = useAuthStore.getState().sessionVersion;

  pending = axios
    .post<ApiResponse<AccessTokenData>>('/api/auth/refresh')
    .then((res) => {
      const token = res.data?.data?.accessToken;
      if (typeof token !== 'string' || token.trim() === '') {
        throw new Error('Refresh response carried no access token');
      }
      if (useAuthStore.getState().sessionVersion !== version) {
        throw new SessionEndedError();
      }
      useAuthStore.getState().setAccessToken(token);
      return token;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

/**
 * Resolves once the refresh in flight (if any) settles, whatever its outcome. Logout waits
 * on it so it revokes the cookie the refresh just rotated, not the one it replaced.
 */
export function waitForPendingRefresh(): Promise<void> {
  return pending ? pending.then(noop, noop) : Promise.resolve();
}

function noop() {}
