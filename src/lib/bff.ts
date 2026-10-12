import { NextResponse, type NextRequest } from 'next/server';

// Shared plumbing for the BFF route handlers under src/app/api.

export const REFRESH_COOKIE = 'refreshToken';

/**
 * Backend URL for `path` (starting with '/'), built from API_URL, which may carry a base
 * path (e.g. http://api:3001/api/v1). Read per request, so the runtime environment applies.
 * Null when API_URL is missing or not an http(s) URL.
 */
export function backendUrl(path: string): string | null {
  const raw = process.env.API_URL;
  if (!raw) return null;

  try {
    const base = new URL(raw);
    if (base.protocol !== 'http:' && base.protocol !== 'https:') return null;
    return `${base.origin}${base.pathname.replace(/\/+$/, '')}${path}`;
  } catch {
    return null;
  }
}

export const configError = () =>
  NextResponse.json({ message: 'Server configuration error' }, { status: 500 });

export const serviceUnavailable = (message = 'Service unavailable') =>
  NextResponse.json({ message }, { status: 503 });

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** `Cookie` header carrying only the refresh token, or null when the browser has none. */
export function refreshCookieHeader(request: NextRequest): string | null {
  const token = request.cookies.get(REFRESH_COOKIE)?.value;
  return token ? `${REFRESH_COOKIE}=${encodeURIComponent(token)}` : null;
}

/** JSON body of a backend response, or a generic message when it is not JSON. */
export async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return { message: 'Unexpected response from the backend' };
  }
}

/**
 * Copies the backend's Set-Cookie headers onto the response, dropping the Domain attribute
 * so the cookie binds to this app's host.
 */
export function forwardSetCookies(backendRes: Response, nextRes: NextResponse) {
  for (const cookie of backendRes.headers.getSetCookie()) {
    nextRes.headers.append('set-cookie', cookie.replace(/;\s*domain=[^;]*/gi, ''));
  }
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
