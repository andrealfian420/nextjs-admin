import { NextResponse, type NextRequest } from 'next/server';

// CSRF guard for the BFF handlers that authenticate with the ambient `refreshToken` cookie
// (/api/auth/login, /refresh, /logout). Every other route is Bearer-only and therefore not
// exposed to CSRF, so do not apply this to every route.

// Methods that cannot change state are never blocked.
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function hostFromUrl(value: string): string | null {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

/**
 * Rejects a state-changing request whose Origin (or Referer, when Origin is absent) host
 * differs from the host the request was sent to. Returns a 403 response to return
 * immediately, or null when the request may proceed.
 *
 * - The expected host is `X-Forwarded-Host`, else `Host`. A reverse proxy in front of the
 *   app must set (or pass through) one of them with the public host, otherwise same-site
 *   requests are rejected. A browser cannot forge either header cross-origin.
 * - `SameSite=Lax` already blocks cross-site requests; this closes the sibling-subdomain gap
 *   that SameSite treats as same-site.
 * - No Origin and no Referer is allowed on purpose: browsers always send Origin on
 *   cross-origin POSTs, while non-browser callers (health checks, curl) send neither.
 * - A present but unparseable value (including `null`) counts as foreign.
 * - Schemes are not compared: TLS-terminating proxies make http/https differ legitimately.
 */
export function rejectForeignOrigin(request: NextRequest): NextResponse | null {
  if (SAFE_METHODS.has(request.method)) {
    return null;
  }

  const expectedHost =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl.host;

  const originHeader =
    request.headers.get('origin') ?? request.headers.get('referer');

  if (!originHeader) {
    return null;
  }

  if (hostFromUrl(originHeader) === expectedHost) {
    return null;
  }

  console.warn(
    `[origin-guard] Blocked ${request.method} ${request.nextUrl.pathname} from origin "${originHeader}" (expected host "${expectedHost}")`,
  );

  return NextResponse.json(
    { message: 'Request origin not allowed' },
    { status: 403 },
  );
}
