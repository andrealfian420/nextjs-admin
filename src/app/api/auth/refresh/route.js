import { NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function forwardSetCookies(backendRes, nextRes) {
  const cookies =
    typeof backendRes.headers.getSetCookie === 'function'
      ? backendRes.headers.getSetCookie()
      : [backendRes.headers.get('set-cookie')].filter(Boolean);

  cookies.forEach((cookie) => {
    const cleaned = cookie.replace(/;\s*domain=[^;,]*/gi, '');
    nextRes.headers.append('set-cookie', cleaned);
  });
}

export async function POST(request) {
  try {
    // Forward the browser's cookies (including refreshToken) to the backend
    const cookieHeader = request.headers.get('cookie') ?? '';

    const clientIp =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-Forwarded-For': clientIp,
      },
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    forwardSetCookies(res, response);

    return response;
  } catch (err) {
    console.error('[/api/auth/refresh]', err);
    return NextResponse.json(
      { message: 'Auth service unavailable' },
      { status: 503 },
    );
  }
}
