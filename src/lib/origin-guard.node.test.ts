import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { rejectForeignOrigin } from '@/lib/origin-guard';

const HOST = 'admin.example.test';

const req = (init: { method?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(`https://${HOST}/api/auth/login`, {
    method: init.method ?? 'POST',
    headers: { host: HOST, ...init.headers },
  });

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('rejectForeignOrigin — allowed', () => {
  it.each(['GET', 'HEAD', 'OPTIONS'])('never blocks the safe method %s', (method) => {
    expect(rejectForeignOrigin(req({ method, headers: { origin: 'https://evil.test' } }))).toBeNull();
  });

  it('allows a same-origin POST and DELETE', () => {
    expect(rejectForeignOrigin(req({ headers: { origin: `https://${HOST}` } }))).toBeNull();
    expect(rejectForeignOrigin(req({ method: 'DELETE', headers: { origin: `https://${HOST}` } }))).toBeNull();
  });

  it('ignores a scheme mismatch behind a TLS-terminating proxy', () => {
    expect(rejectForeignOrigin(req({ headers: { origin: `http://${HOST}` } }))).toBeNull();
  });

  it('falls back to Referer when Origin is absent', () => {
    expect(rejectForeignOrigin(req({ headers: { referer: `https://${HOST}/login` } }))).toBeNull();
  });

  it('prefers X-Forwarded-Host over Host', () => {
    const res = rejectForeignOrigin(
      req({ headers: { host: 'app:3000', 'x-forwarded-host': HOST, origin: `https://${HOST}` } }),
    );
    expect(res).toBeNull();
  });

  it('allows a non-browser caller that sends neither Origin nor Referer', () => {
    expect(rejectForeignOrigin(req())).toBeNull();
  });
});

describe('rejectForeignOrigin — rejected', () => {
  it('blocks a foreign origin with 403', async () => {
    const res = rejectForeignOrigin(req({ headers: { origin: 'https://evil.test' } }));
    expect(res?.status).toBe(403);
    await expect(res?.json()).resolves.toEqual({ message: 'Request origin not allowed' });
  });

  it('blocks a sibling subdomain (the gap SameSite=Lax leaves open)', () => {
    expect(rejectForeignOrigin(req({ headers: { origin: 'https://other.example.test' } }))?.status).toBe(403);
  });

  it.each(['not-a-url', 'null'])('treats the unparseable Origin %j as foreign', (origin) => {
    expect(rejectForeignOrigin(req({ headers: { origin } }))?.status).toBe(403);
  });

  it('blocks a foreign Referer when Origin is absent', () => {
    expect(rejectForeignOrigin(req({ headers: { referer: 'https://evil.test/x' } }))?.status).toBe(403);
  });

  it('blocks when the proxy forwards a different public host than the origin', () => {
    const res = rejectForeignOrigin(
      req({ headers: { 'x-forwarded-host': 'other.test', origin: `https://${HOST}` } }),
    );
    expect(res?.status).toBe(403);
  });
});
