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
  const cookieHeader = request.headers.get('cookie') ?? '';

  const res = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // logout may not return JSON
  }

  const response = NextResponse.json(data, {
    status: res.ok ? 200 : res.status,
  });
  forwardSetCookies(res, response);

  // Ensure the cookie is cleared on the Next.js domain regardless of backend response
  response.cookies.delete('refreshToken');

  return response;
}
