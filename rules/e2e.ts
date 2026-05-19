/* eslint-disable unicorn/prevent-abbreviations -- "e2e" is the canonical industry term */
import type { Linter } from "eslint";

/**
 * Opt-in. Pull in for projects using Playwright with fixtures under `e2e/**`.
 *
 * ESLint override for Playwright end-to-end fixtures.
 *
 * Playwright's `test.extend()` / `test.use()` pattern involves passing fixture
 * factories that read destructured arguments. Static analysis misreads these
 * callbacks as React hook calls and flags them with `react-hooks/rules-of-hooks`,
 * which is a false positive for e2e test code.
 *
 * Ported from Tempest. The Tempest-specific `**\/fixtures/authenticated*` glob
 * was dropped during the fold-in to keep this preset broadly applicable.
 */
export const e2e = {
  files: ["**/e2e/**/*.{ts,tsx}"],
  rules: {
    // react-hooks/rules-of-hooks — enforces Rules of Hooks (only call hooks at top level).
    // Off in e2e: Playwright `test.extend` fixture factories are misread as hook calls.
    // https://react.dev/reference/eslint-plugin-react-hooks#rules-of-hooks
    "react-hooks/rules-of-hooks": "off",
  },
} satisfies Linter.Config;
