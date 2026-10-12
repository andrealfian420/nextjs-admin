import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, PATCH, POST, PUT } from '@/app/api/[...path]/route';

const ORIGIN = 'https://admin.example.test';
const BACKEND = 'https://backend.test/api/v1';

/** In Next 16 the route context's `params` is a Promise. */
const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });

const okResponse = (init?: ResponseInit) =>
  new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' }, ...init });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(okResponse());
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const calledUrl = () => String(fetchMock.mock.calls[0][0]);

describe('allowlist', () => {
  it.each([
    ['users'],
    ['users', 'jane-doe'],
    ['roles', 'access-list'],
    ['activity-logs', '42'],
    ['profile'],
    ['utils', 'role-options'],
  ])('forwards /%s', async (...path) => {
    const res = await GET(new NextRequest(`${ORIGIN}/api/${path.join('/')}`), ctx(...path));
    expect(res.status).toBe(200);
    expect(calledUrl()).toBe(`${BACKEND}/${path.join('/')}`);
  });

  it.each([
    [['evil']],
    [['usersecret']],
    [['email-templates']],
    [['health']],
  ])('404s %j without calling the backend', async (path) => {
    const res = await GET(new NextRequest(`${ORIGIN}/api/${path.join('/')}`), ctx(...path));
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ message: 'Not found' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['auth', 'login'],
    ['auth', 'refresh'],
    ['auth', 'logout'],
    ['auth', 'register'],
    ['auth', 'verify-email'],
    ['auth'],
  ])('404s the auth path /%s through the catch-all', async (...path) => {
    const res = await POST(new NextRequest(`${ORIGIN}/api/${path.join('/')}`, { method: 'POST' }), ctx(...path));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['request-password-reset', 'reset-password'])('forwards POST /auth/%s', async (name) => {
    const res = await POST(
      new NextRequest(`${ORIGIN}/api/auth/${name}`, { method: 'POST', body: '{}' }),
      ctx('auth', name),
    );
    expect(res.status).toBe(200);
    expect(calledUrl()).toBe(`${BACKEND}/auth/${name}`);
  });

  it.each([
    ['GET', GET],
    ['PUT', PUT],
    ['PATCH', PATCH],
    ['DELETE', DELETE],
  ])('404s %s on a public auth path', async (method, handler) => {
    const res = await handler(
      new NextRequest(`${ORIGIN}/api/auth/reset-password`, { method }),
      ctx('auth', 'reset-password'),
    );
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [['users', '..', 'auth', 'refresh']],
    [['users', '.', 'x']],
    [['users', 'a/../../auth/refresh']],
    [['users', 'a\\b']],
    [['users', '']],
  ])('404s the traversal path %j without calling the backend', async (path) => {
    const res = await POST(new NextRequest(`${ORIGIN}/api/users`, { method: 'POST' }), ctx(...path));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('re-encodes decoded segments', async () => {
    await GET(new NextRequest(`${ORIGIN}/api/users/jane%20doe`), ctx('users', 'jane doe'));
    expect(calledUrl()).toBe(`${BACKEND}/users/jane%20doe`);
  });
});

describe('request forwarding', () => {
  it('keeps the query and forwards auth, content type and client IP, but never cookies', async () => {
    await POST(
      new NextRequest(`${ORIGIN}/api/users?page=2&per_page=10&search=a%20b`, {
        method: 'POST',
        headers: {
          authorization: 'Bearer token-123',
          cookie: 'refreshToken=r',
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.7',
        },
        body: JSON.stringify({ name: 'a' }),
      }),
      ctx('users'),
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${BACKEND}/users?page=2&per_page=10&search=a%20b`);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Authorization: 'Bearer token-123',
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.7',
    });
    expect(init.duplex).toBe('half');
  });

  it('sends no body on GET', async () => {
    await GET(new NextRequest(`${ORIGIN}/api/users`), ctx('users'));
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].headers['X-Forwarded-For']).toBe('unknown');
  });

  it('streams a multipart upload with its boundary intact', async () => {
    const form = new FormData();
    form.append('name', 'Jane');
    form.append('avatar', new File(['png-bytes'], 'me.png', { type: 'image/png' }));
    const upload = new Request(`${ORIGIN}/api/users/jane`, { method: 'PUT', body: form });
    const contentType = upload.headers.get('content-type')!;

    await PUT(
      new NextRequest(upload.url, {
        method: 'PUT',
        headers: { 'content-type': contentType },
        body: upload.body,
        duplex: 'half',
      } as ConstructorParameters<typeof NextRequest>[1]),
      ctx('users', 'jane'),
    );

    const init = fetchMock.mock.calls[0][1];
    expect(init.headers['Content-Type']).toBe(contentType);
    const received = await new Request(BACKEND, {
      method: 'PUT',
      headers: { 'content-type': contentType },
      body: init.body,
      duplex: 'half',
    } as RequestInit).formData();
    expect(received.get('name')).toBe('Jane');
    expect((received.get('avatar') as File).name).toBe('me.png');
  });
});

describe('response forwarding', () => {
  it('passes status, body and allowlisted headers, but no cookies or content-length', async () => {
    const headers = new Headers({
      'content-type': 'application/json',
      'content-length': '999',
      'x-total-count': '7',
      'x-internal': 'secret',
    });
    headers.append('set-cookie', 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    fetchMock.mockResolvedValue(new Response('{"message":"Forbidden"}', { status: 403, headers }));

    const res = await DELETE(new NextRequest(`${ORIGIN}/api/users/jane`, { method: 'DELETE' }), ctx('users', 'jane'));

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ message: 'Forbidden' });
    expect(res.headers.get('x-total-count')).toBe('7');
    expect(res.headers.get('x-internal')).toBeNull();
    expect(res.headers.get('content-length')).toBeNull();
    expect(res.headers.getSetCookie()).toEqual([]);
  });
});

describe('failures', () => {
  it('answers 503 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const res = await GET(new NextRequest(`${ORIGIN}/api/users`), ctx('users'));
    expect(res.status).toBe(503);
  });

  it.each([undefined, 'not a url'])('answers 500 for API_URL=%j', async (value) => {
    vi.stubEnv('API_URL', value as string);
    const res = await GET(new NextRequest(`${ORIGIN}/api/users`), ctx('users'));
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
