// Builds `images.remotePatterns` for next.config.ts from API_URL and MEDIA_URL. Both are read
// at build time: changing them needs a rebuild.

export interface ImageRemotePattern {
  protocol: 'http' | 'https';
  hostname: string;
  port: string;
  pathname: string;
  /** No query string allowed. */
  search: '';
}

/** An http(s) URL without credentials, query, hash or wildcards; null otherwise. */
function parseUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    const safe =
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      !url.hostname.includes('*') &&
      !url.pathname.includes('*');
    return safe ? url : null;
  } catch {
    return null;
  }
}

/**
 * - API_URL allows only its uploads: `/storage/uploads/**` on the API host.
 * - Each comma-separated MEDIA_URL entry allows one exact host, limited to its path prefix
 *   (an origin alone allows every path on that host). An origin alone equal to the API
 *   origin is skipped, so it cannot widen the uploads-only rule.
 * Entries that are not safe URLs are returned in `rejected` instead of being used.
 */
export function buildRemotePatterns(
  apiUrl: string | undefined,
  mediaUrl: string | undefined,
): { patterns: ImageRemotePattern[]; rejected: string[] } {
  const patterns: ImageRemotePattern[] = [];
  const rejected: string[] = [];

  const add = (url: URL, pathname: string) => {
    const pattern: ImageRemotePattern = {
      protocol: url.protocol === 'https:' ? 'https' : 'http',
      hostname: url.hostname,
      port: url.port,
      pathname,
      search: '',
    };
    const duplicate = patterns.some(
      (p) =>
        p.protocol === pattern.protocol &&
        p.hostname === pattern.hostname &&
        p.port === pattern.port &&
        p.pathname === pattern.pathname,
    );
    if (!duplicate) patterns.push(pattern);
  };

  const parse = (value: string | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    const url = parseUrl(trimmed);
    if (!url) rejected.push(trimmed);
    return url;
  };

  const api = parse(apiUrl);
  if (api) add(api, '/storage/uploads/**');

  for (const entry of (mediaUrl ?? '').split(',')) {
    const media = parse(entry);
    if (!media) continue;

    const prefix = media.pathname.replace(/\/+$/, '');
    if (!prefix && api && media.origin === api.origin) continue;
    add(media, prefix ? `${prefix}/**` : '/**');
  }

  return { patterns, rejected };
}
