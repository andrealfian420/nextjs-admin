import { NextResponse, type NextRequest } from 'next/server';
import { rejectForeignOrigin } from '@/lib/origin-guard';
import {
  backendUrl,
  clientIp,
  configError,
  forwardSetCookies,
  readJson,
  serviceUnavailable,
} from '@/lib/bff';

// Cookie proxy for login: forwards the credentials and rebinds the backend's refreshToken
// cookie to this app's host.
export async function POST(request: NextRequest) {
  const rejected = rejectForeignOrigin(request);
  if (rejected) return rejected;

  const url = backendUrl('/auth/login');
  if (!url) return configError();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIp(request),
      },
      body: JSON.stringify(body),
    });

    const response = NextResponse.json(await readJson(res), { status: res.status });
    if (res.ok) forwardSetCookies(res, response);

    return response;
  } catch (err) {
    console.error('[/api/auth/login]', err);
    return serviceUnavailable('Auth service unavailable');
  }
}
