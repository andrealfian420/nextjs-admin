import { beforeEach, describe, expect, it, vi } from 'vitest';
import { matchRemotePattern } from 'next/dist/shared/lib/match-remote-pattern';
import { buildRemotePatterns, type ImageRemotePattern } from '@/lib/remote-patterns';

const pattern = (url: string, pathname: string): ImageRemotePattern => {
  const { protocol, hostname, port } = new URL(url);
  return { protocol: protocol === 'https:' ? 'https' : 'http', hostname, port, pathname, search: '' };
};

/** Whether next/image would serve `src` with these patterns (Next's own matcher). */
const allowed = (patterns: ImageRemotePattern[], src: string) =>
  patterns.some((p) => matchRemotePattern(p, new URL(src)));

describe('buildRemotePatterns', () => {
  it('allows only uploads on the API host', () => {
    const { patterns } = buildRemotePatterns('http://express-core-api:3001/api/v1', undefined);

    expect(patterns).toEqual([pattern('http://express-core-api:3001', '/storage/uploads/**')]);
    expect(allowed(patterns, 'http://express-core-api:3001/storage/uploads/avatars/a.png')).toBe(true);
    expect(allowed(patterns, 'http://express-core-api:3001/api/v1/users')).toBe(false);
    expect(allowed(patterns, 'http://express-core-api:3001/storage/uploads/a.png?w=1')).toBe(false);
    expect(allowed(patterns, 'http://other:3001/storage/uploads/a.png')).toBe(false);
  });

  it('adds separate media hosts, scoped to their path prefix', () => {
    const { patterns, rejected } = buildRemotePatterns(
      'https://api.example.com/api/v1',
      ' https://images.example.com/photos/ , https://cdn.example.net , ',
    );

    expect(patterns).toEqual([
      pattern('https://api.example.com', '/storage/uploads/**'),
      pattern('https://images.example.com', '/photos/**'),
      pattern('https://cdn.example.net', '/**'),
    ]);
    expect(rejected).toEqual([]);
    expect(allowed(patterns, 'https://images.example.com/photos/a.jpg')).toBe(true);
    expect(allowed(patterns, 'https://images.example.com/private/a.jpg')).toBe(false);
    expect(allowed(patterns, 'https://cdn.example.net/any/path.png')).toBe(true);
  });

  it('never widens the API host to every path, but accepts a prefix on it', () => {
    const { patterns } = buildRemotePatterns(
      'https://api.example.com/api/v1',
      'https://api.example.com,https://api.example.com/storage',
    );

    expect(patterns).toEqual([
      pattern('https://api.example.com', '/storage/uploads/**'),
      pattern('https://api.example.com', '/storage/**'),
    ]);
    // express-core 3.0.0 builds avatar URLs with a double slash; a /storage prefix covers it.
    expect(allowed(patterns, 'https://api.example.com/storage//uploads/avatars/a.png')).toBe(true);
    expect(allowed(patterns, 'https://api.example.com/api/v1/profile')).toBe(false);
  });

  it('deduplicates and rejects malformed, credentialed, query, non-http and wildcard URLs', () => {
    const { patterns, rejected } = buildRemotePatterns(
      'http://localhost:3001/api/v1',
      [
        'https://cdn.example.net/assets',
        'https://cdn.example.net/assets/',
        'not-a-url',
        'https://user:pass@private.example.com',
        'https://images.example.com/photos?token=x',
        'https://images.example.com/photos#x',
        'ftp://files.example.com',
        'https://*.example.com',
        'https://other.example.com/*',
      ].join(','),
    );

    expect(patterns).toEqual([
      pattern('http://localhost:3001', '/storage/uploads/**'),
      pattern('https://cdn.example.net', '/assets/**'),
    ]);
    expect(rejected).toHaveLength(7);
  });

  it('returns nothing without configuration', () => {
    expect(buildRemotePatterns(undefined, undefined)).toEqual({ patterns: [], rejected: [] });
    expect(buildRemotePatterns('', ' , ')).toEqual({ patterns: [], rejected: [] });
  });
});

describe('next.config images', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const load = async (env: Record<string, string>) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    return (await import('../../next.config')).default.images!;
  };

  it('optimizes in production and serves images directly in development', async () => {
    expect(await load({ NODE_ENV: 'production', API_URL: 'https://api.example.com/api/v1' })).toMatchObject({
      unoptimized: false,
      remotePatterns: [pattern('https://api.example.com', '/storage/uploads/**')],
    });
    vi.resetModules();
    expect(await load({ NODE_ENV: 'development' })).toMatchObject({ unoptimized: true });
  });

  it('warns about ignored entries at build time', async () => {
    await load({ NODE_ENV: 'production', MEDIA_URL: 'https://user:pass@x.example.com' });
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('https://user:pass@x.example.com'));
  });
});
