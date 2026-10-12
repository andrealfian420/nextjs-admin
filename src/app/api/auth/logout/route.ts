import { NextResponse, type NextRequest } from 'next/server';
import { rejectForeignOrigin } from '@/lib/origin-guard';
import {
  backendUrl,
  clearRefreshCookie,
  configError,
  readJson,
  refreshCookieHeader,
  serviceUnavailable,
} from '@/lib/bff';

// POST: revoke the session on the backend, then clear the cookie. The cookie is cleared
// even when the backend fails, so the browser never stays half logged in.
export async function POST(request: NextRequest) {
  const rejected = rejectForeignOrigin(request);
  if (rejected) return rejected;

  const cookie = refreshCookieHeader(request);
  if (!cookie) {
    return clearRefreshCookie(NextResponse.json({ message: 'Logged out' }));
  }

  const url = backendUrl('/auth/logout');
  if (!url) return clearRefreshCookie(configError());

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
    });

    // 401 means the backend no longer knows the token (e.g. revoked by a password change):
    // the session is already over, which is what logout asked for.
    if (res.status === 401) {
      return clearRefreshCookie(NextResponse.json({ message: 'Logged out' }));
    }

    return clearRefreshCookie(
      NextResponse.json(await readJson(res), { status: res.status }),
    );
  } catch (err) {
    console.error('[/api/auth/logout]', err);
    return clearRefreshCookie(serviceUnavailable('Auth service unavailable'));
  }
}

// DELETE: clear the cookie only, without a backend call. Used when the backend already
// ended every session (password change) or when a failed refresh leaves a dead cookie.
export async function DELETE(request: NextRequest) {
  const rejected = rejectForeignOrigin(request);
  if (rejected) return rejected;

  return clearRefreshCookie(NextResponse.json({ message: 'Session cleared' }));
}
