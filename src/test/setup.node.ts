// Global setup for the `node` test project (route handlers, src/proxy.ts, server config).

import { afterEach, vi } from 'vitest';

// Fail loudly rather than mysteriously if the runtime lacks the Web APIs handlers use.
for (const name of ['fetch', 'Request', 'Response', 'Headers', 'ReadableStream'] as const) {
  if (typeof globalThis[name] === 'undefined') {
    throw new Error(`[test] global ${name} is missing — use the Node version in package.json engines.`);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});
