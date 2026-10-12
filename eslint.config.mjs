import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,

  // Tests, shared test helpers, manual mocks and the runner config.
  {
    files: [
      "**/*.test.{ts,tsx}",
      "src/test/**/*.{ts,tsx}",
      "__mocks__/**/*.{ts,tsx}",
      "vitest.config.mts",
    ],
    rules: {
      // Inline stub components in tests are anonymous by design.
      "react/display-name": "off",
      "@next/next/no-img-element": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test artefacts.
    "coverage/**",
  ]),
]);

export default eslintConfig;
