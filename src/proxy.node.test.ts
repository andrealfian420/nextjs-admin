import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

const ORIGIN = 'https://admin.example.test';

function request(path: string, refreshToken?: string) {
  const headers = refreshToken ? { cookie: `refreshToken=${refreshToken}` } : undefined;
  return new NextRequest(`${ORIGIN}${path}`, { headers });
}

const location = (res: Response) => res.headers.get('location');

describe('proxy', () => {
  it('redirects an anonymous admin visit to /login', () => {
    expect(location(proxy(request('/admin/users')))).toBe(`${ORIGIN}/login`);
  });

  it('lets an admin visit with a refresh cookie through', () => {
    expect(location(proxy(request('/admin', 'token')))).toBeNull();
  });

  it('redirects a signed-in visit to an auth page back to /admin', () => {
    expect(location(proxy(request('/login', 'token')))).toBe(`${ORIGIN}/admin`);
    expect(location(proxy(request('/forgot-password', 'token')))).toBe(`${ORIGIN}/admin`);
  });

  it('lets an anonymous visitor open the auth pages', () => {
    expect(location(proxy(request('/login')))).toBeNull();
    expect(location(proxy(request('/forgot-password')))).toBeNull();
  });
});
