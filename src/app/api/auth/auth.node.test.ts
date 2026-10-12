import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as refresh } from '@/app/api/auth/refresh/route';
import { DELETE as clearSession, POST as logout } from '@/app/api/auth/logout/route';

const ORIGIN = 'https://admin.example.test';
const BACKEND = 'https://backend.test/api/v1';

function request(
  path: string,
  { method = 'POST', cookie, origin = ORIGIN, body }: {
    method?: string;
    cookie?: string;
    origin?: string;
    body?: string;
  } = {},
) {
  const headers: Record<string, string> = { host: 'admin.example.test', origin };
  if (cookie) headers.cookie = cookie;
  return new NextRequest(`${ORIGIN}${path}`, { method, headers, body });
}

function backendResponse(status: number, body: unknown, setCookies: string[] = []) {
  const headers = new Headers({ 'content-type': 'application/json' });
  setCookies.forEach((cookie) => headers.append('set-cookie', cookie));
  return new Response(JSON.stringify(body), { status, headers });
}

const ROTATED = 'refreshToken=new; Domain=backend.test; Path=/; HttpOnly; SameSite=Lax';
const CLEARING = 'refreshToken=; Domain=backend.test; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

const setCookies = (res: Response) => res.headers.getSetCookie();
const clearsRefreshCookie = (res: Response) =>
  setCookies(res).some((c) => /^refreshToken=;/.test(c) && /expires=thu, 01 jan 1970/i.test(c));

describe.each([
  ['login', () => login(request('/api/auth/login', { origin: 'https://evil.test', body: '{}' }))],
  ['refresh', () => refresh(request('/api/auth/refresh', { origin: 'https://evil.test', cookie: 'refreshToken=r' }))],
  ['logout POST', () => logout(request('/api/auth/logout', { origin: 'https://evil.test', cookie: 'refreshToken=r' }))],
  ['logout DELETE', () => clearSession(request('/api/auth/logout', { method: 'DELETE', origin: 'https://evil.test', cookie: 'refreshToken=r' }))],
])('%s', (_, call) => {
  it('rejects a foreign origin before calling the backend or touching the cookie', async () => {
    const res = await call();
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(setCookies(res)).toEqual([]);
  });
});

describe('POST /api/auth/login', () => {
  it('forwards the credentials and rebinds the cookie to the app host', async () => {
    fetchMock.mockResolvedValue(backendResponse(200, { data: { accessToken: 'a' } }, [ROTATED]));

    const res = await login(request('/api/auth/login', { body: JSON.stringify({ email: 'a@b.test', password: 'x' }) }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: { accessToken: 'a' } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BACKEND}/auth/login`);
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.test', password: 'x' });
    expect(init.headers.Origin).toBeUndefined();
    expect(setCookies(res)).toEqual(['refreshToken=new; Path=/; HttpOnly; SameSite=Lax']);
  });

  it('passes backend validation errors through with their status', async () => {
    const body = { message: 'Validation failed', errors: [{ field: 'email', message: 'Invalid' }] };
    fetchMock.mockResolvedValue(backendResponse(422, body));

    const res = await login(request('/api/auth/login', { body: '{"email":"x"}' }));

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual(body);
  });

  it('answers 400 for a body that is not JSON, without calling the backend', async () => {
    const res = await login(request('/api/auth/login', { body: 'nope' }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers 503 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const res = await login(request('/api/auth/login', { body: '{}' }));
    expect(res.status).toBe(503);
  });

  it.each([undefined, 'not a url', 'ftp://backend.test'])('answers 500 for API_URL=%j', async (value) => {
    vi.stubEnv('API_URL', value as string);
    const res = await login(request('/api/auth/login', { body: '{}' }));
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/refresh', () => {
  it('sends only the refresh cookie and forwards the rotated cookie on success', async () => {
    fetchMock.mockResolvedValue(backendResponse(200, { data: { accessToken: 'b' } }, [ROTATED]));

    const res = await refresh(request('/api/auth/refresh', { cookie: 'theme=dark; refreshToken=old' }));

    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][1].headers.Cookie).toBe('refreshToken=old');
    expect(setCookies(res)).toEqual(['refreshToken=new; Path=/; HttpOnly; SameSite=Lax']);
  });

  it('never forwards the backend cookie on failure, so a still-valid cookie survives', async () => {
    fetchMock.mockResolvedValue(backendResponse(401, { message: 'Invalid refresh token' }, [CLEARING]));

    const res = await refresh(request('/api/auth/refresh', { cookie: 'refreshToken=old' }));

    expect(res.status).toBe(401);
    expect(setCookies(res)).toEqual([]);
  });

  it('answers 401 without a backend call when there is no refresh cookie', async () => {
    const res = await refresh(request('/api/auth/refresh'));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers 503 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const res = await refresh(request('/api/auth/refresh', { cookie: 'refreshToken=old' }));
    expect(res.status).toBe(503);
    expect(setCookies(res)).toEqual([]);
  });

  it('keeps the status of a backend error that is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));
    const res = await refresh(request('/api/auth/refresh', { cookie: 'refreshToken=old' }));
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toHaveProperty('message');
  });
});

describe('POST /api/auth/logout', () => {
  it('revokes the session on the backend and clears the cookie', async () => {
    fetchMock.mockResolvedValue(backendResponse(200, { message: 'Logged out successfully' }));

    const res = await logout(request('/api/auth/logout', { cookie: 'refreshToken=r' }));

    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BACKEND}/auth/logout`);
    expect(init.headers.Cookie).toBe('refreshToken=r');
    expect(clearsRefreshCookie(res)).toBe(true);
  });

  it('still clears the cookie when the backend fails or is unreachable', async () => {
    fetchMock.mockResolvedValueOnce(backendResponse(500, { message: 'Internal Server Error' }));
    const failed = await logout(request('/api/auth/logout', { cookie: 'refreshToken=r' }));
    expect(failed.status).toBe(500);
    expect(clearsRefreshCookie(failed)).toBe(true);

    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    const unreachable = await logout(request('/api/auth/logout', { cookie: 'refreshToken=r' }));
    expect(unreachable.status).toBe(503);
    expect(clearsRefreshCookie(unreachable)).toBe(true);
  });

  it('treats a token the backend no longer knows (revoked by a password change) as logged out', async () => {
    fetchMock.mockResolvedValue(backendResponse(401, { message: 'Invalid refresh token' }));

    const res = await logout(request('/api/auth/logout', { cookie: 'refreshToken=revoked' }));

    expect(res.status).toBe(200);
    expect(clearsRefreshCookie(res)).toBe(true);
  });

  it('clears the cookie without a backend call when there is no session', async () => {
    const res = await logout(request('/api/auth/logout'));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(clearsRefreshCookie(res)).toBe(true);
  });
});

describe('DELETE /api/auth/logout', () => {
  it('clears the cookie without calling the backend', async () => {
    const res = await clearSession(request('/api/auth/logout', { method: 'DELETE', cookie: 'refreshToken=r' }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(clearsRefreshCookie(res)).toBe(true);
  });
});
