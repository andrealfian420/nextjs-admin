import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Two projects split by runtime: `jsdom` for components, hooks, stores and DOM-touching
// lib code; `node` (files named *.node.test.ts) for route handlers, src/proxy.ts and
// config that runs on the server.

// Mirrors `reactCompiler: true` in next.config.ts so tests exercise the same output that
// ships. Set VITEST_NO_COMPILER=1 to bisect a suspected compiler interaction.
const compilerPlugins =
  process.env.VITEST_NO_COMPILER === '1' ? [] : ['babel-plugin-react-compiler'];

// `globals: false` — every test imports { describe, it, expect, vi } explicitly.
const shared = {
  clearMocks: true,
  restoreMocks: true,
  unstubEnvs: true,
  unstubGlobals: true,
  globals: false as const,
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          tsconfigPaths(),
          react({ babel: { plugins: [...compilerPlugins] } }),
        ],
        test: {
          ...shared,
          name: 'jsdom',
          environment: 'jsdom',
          // Absolute origin so `new URL('/x', location.href)` and document.cookie work.
          environmentOptions: { jsdom: { url: 'https://admin.example.test/' } },
          setupFiles: ['./src/test/setup.jsdom.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.node.test.ts'],
          css: false,
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
          ...shared,
          name: 'node',
          environment: 'node',
          setupFiles: ['./src/test/setup.node.ts'],
          include: ['src/**/*.node.test.ts'],
          env: { API_URL: 'https://backend.test/api/v1' },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/lib/**',
        'src/services/**',
        'src/hooks/**',
        'src/store/**',
        'src/components/**',
        'src/app/api/**',
        'src/proxy.ts',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        '__mocks__/**',
        'src/types/**',
      ],
    },
  },
});
