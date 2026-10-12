import { NextResponse, type NextRequest } from 'next/server';
import { rejectForeignOrigin } from '@/lib/origin-guard';
import {
  backendUrl,
  clientIp,
  configError,
  forwardSetCookies,
  readJson,
  refreshCookieHeader,
  serviceUnavailable,
} from '@/lib/bff';

// Cookie proxy for access-token refresh (rotating refresh token).
export async function POST(request: NextRequest) {
  const rejected = rejectForeignOrigin(request);
  if (rejected) return rejected;

  const url = backendUrl('/auth/refresh');
  if (!url) return configError();

  // Anonymous visitor: nothing to refresh, so skip the backend round trip.
  const cookie = refreshCookieHeader(request);
  if (!cookie) {
    return NextResponse.json({ message: 'No active session' }, { status: 401 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        'X-Forwarded-For': clientIp(request),
      },
    });

    const response = NextResponse.json(await readJson(res), { status: res.status });

    // Only a successful refresh may touch the cookie. A failed one (e.g. a token another tab
    // already rotated) can carry a clearing Set-Cookie that would delete a still-valid
    // cookie; ending the session is logout's job.
    if (res.ok) forwardSetCookies(res, response);

    return response;
  } catch (err) {
    console.error('[/api/auth/refresh]', err);
    return serviceUnavailable('Auth service unavailable');
  }
}
