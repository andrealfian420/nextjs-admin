import { NextResponse, type NextRequest } from 'next/server';

const API_URL = process.env.API_URL;

// Allowed path prefixes to prevent open-proxy abuse
const ALLOWED_PREFIXES = [
  '/users',
  '/roles',
  '/activity-logs',
  '/profile',
  '/utils',
  '/auth',
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function forwardSetCookies(backendRes: Response, nextRes: NextResponse) {
  const cookies =
    typeof backendRes.headers.getSetCookie === 'function'
      ? backendRes.headers.getSetCookie()
      : ([backendRes.headers.get('set-cookie')].filter(Boolean) as string[]);

  cookies.forEach((cookie) => {
    const cleaned = cookie.replace(/;\s*domain=[^;,]*/gi, '');
    nextRes.headers.append('set-cookie', cleaned);
  });
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!API_URL) {
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 },
    );
  }

  const { path } = await params;
  const targetPath = `/${path.join('/')}`;

  if (!isAllowedPath(targetPath)) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  // Build the full backend URL including query parameters
  // API_URL may include a base path (e.g. http://host/api/v1), so we append rather than replace
  const baseUrl = API_URL.replace(/\/+$/, '');
  const url = new URL(`${baseUrl}${targetPath}`);
  url.search = request.nextUrl.search;

  const clientIp =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    'unknown';

  // Build headers to forward
  const headers: HeadersInit = {
    'X-Forwarded-For': clientIp,
  };

  // Forward Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  // Forward cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  // Forward Content-Type only if present (let fetch set it for FormData/streams)
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  try {
    const res = await fetch(url.toString(), {
      method: request.method,
      headers,
      // Stream the body directly without buffering for all methods except GET/HEAD
      body:
        request.method !== 'GET' && request.method !== 'HEAD'
          ? request.body
          : undefined,
      // @ts-expect-error -- Node.js fetch supports duplex for streaming request bodies
      duplex: 'half',
    });

    // Stream the response back to the client without buffering
    const responseHeaders = new Headers();

    // Forward relevant response headers
    const headersToForward = [
      'content-type',
      'content-disposition',
      'content-length',
      'cache-control',
      'x-total-count',
      'x-page',
      'x-per-page',
      'x-total-pages',
    ];

    headersToForward.forEach((header) => {
      const value = res.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    });

    const response = new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    });

    forwardSetCookies(res, response);

    return response;
  } catch (err) {
    console.error(`[/api${targetPath}]`, err);
    return NextResponse.json(
      { message: 'Service unavailable' },
      { status: 503 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
