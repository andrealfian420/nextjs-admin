import { NextResponse, type NextRequest } from 'next/server';
import { backendUrl, clientIp, configError, serviceUnavailable } from '@/lib/bff';

// BFF catch-all: forwards Bearer-authenticated API calls to the backend. It never forwards
// cookies in either direction — the refresh cookie only travels through /api/auth/*.

// Backend modules the browser may reach. Add a prefix when a new module ships.
const ALLOWED_PREFIXES = ['/users', '/roles', '/activity-logs', '/profile', '/utils'];

// Anonymous auth endpoints, POST only. Cookie endpoints (login/refresh/logout) have their own
// handlers; every other /auth path is not found.
const PUBLIC_AUTH_PATHS = new Set([
  '/auth/request-password-reset',
  '/auth/reset-password',
]);

// Response headers passed back to the browser. Content-Length is left out: fetch decodes a
// compressed body, so the backend's length no longer matches.
const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-disposition',
  'cache-control',
  'x-total-count',
  'x-page',
  'x-per-page',
  'x-total-pages',
];

// Params arrive decoded, so a segment may hold '..' or an encoded '/' that would make the
// backend URL resolve outside the allowlisted prefix.
const isSafeSegment = (segment: string) =>
  segment !== '' && segment !== '.' && segment !== '..' && !/[/\\]/.test(segment);

function isAllowed(method: string, path: string): boolean {
  if (PUBLIC_AUTH_PATHS.has(path)) return method === 'POST';
  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

const notFound = () => NextResponse.json({ message: 'Not found' }, { status: 404 });

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path.every(isSafeSegment)) return notFound();

  const targetPath = `/${path.join('/')}`;
  if (!isAllowed(request.method, targetPath)) return notFound();

  const base = backendUrl(`/${path.map(encodeURIComponent).join('/')}`);
  if (!base) return configError();

  const url = new URL(base);
  url.search = request.nextUrl.search;

  const headers: Record<string, string> = {
    'X-Forwarded-For': clientIp(request),
  };

  const authHeader = request.headers.get('authorization');
  if (authHeader) headers.Authorization = authHeader;

  // Forwarded as-is so multipart keeps its boundary.
  const contentType = request.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  try {
    const res = await fetch(url, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required by Node's fetch to stream a request body.
      ...(hasBody && { duplex: 'half' }),
    } as RequestInit);

    const responseHeaders = new Headers();
    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = res.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new NextResponse(res.body, { status: res.status, headers: responseHeaders });
  } catch (err) {
    console.error(`[/api${targetPath}]`, err);
    return serviceUnavailable();
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
