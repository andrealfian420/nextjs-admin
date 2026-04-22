import { NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Forward Set-Cookie headers from the backend response, stripping the domain
// attribute so cookies are bound to the Next.js app domain instead.
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
    const body = await request.json();

    const clientIp =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIp,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    forwardSetCookies(res, response);

    return response;
  } catch (err) {
    console.error('[/api/auth/login]', err);
    return NextResponse.json(
      { message: 'Auth service unavailable' },
      { status: 503 },
    );
  }
}
