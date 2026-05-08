import type { Linter } from "eslint";

/**
 * Re-exported as `testing`. Pull in for any project with a test suite.
 *
 * Targets `*.test.*`, `*.spec.*`, `__tests__/**`, and recognised setup-file
 * patterns (`vitest.setup.ts`, `jest.setup.ts`, `playwright.setup.ts`,
 * `test.setup.ts`, plus any `*.setup.{ts,js}` under `__tests__` or `tests`).
 *
 * Relaxes a handful of strictness rules where test code legitimately needs
 * more latitude than production code: `any` and non-null assertions
 * downgraded to warn (test fixtures often exercise edge cases that need
 * them); triple-slash references off (Vitest setup files use them to
 * augment global types from `@testing-library/jest-dom` etc.); and
 * `import/no-extraneous-dependencies` switched to `devDependencies: true`,
 * complementing the explicit allowlist `preferences` uses for non-test files.
 */
export const testFiles = {
  files: [
    "**/*.test.{ts,tsx,js,jsx}",
    "**/*.spec.{ts,tsx,js,jsx}",
    "**/__tests__/**/*.{ts,tsx,js,jsx}",
    // Test setup files - specific framework names to avoid false positives
    "**/{vitest,jest,playwright,test}.setup.{ts,js}",
    // Setup files in test directories
    "**/__tests__/**/*.setup.{ts,js}",
    "**/tests/**/*.setup.{ts,js}",
  ],
  rules: {
    // Relax TypeScript strict rules for test files where `any` is acceptable
    // for testing type validation and error handling
    "@typescript-eslint/no-explicit-any": "warn",

    // Allow non-null assertions in test files where preconditions are asserted
    // and the test would fail anyway if the assumption is wrong
    "@typescript-eslint/no-non-null-assertion": "warn",

    // Vitest setup files use `/// <reference types="..." />` to augment global
    // types (e.g. `@testing-library/jest-dom`); the rule is a false positive there.
    "@typescript-eslint/triple-slash-reference": "off",

    // Allow devDependencies in test files and setup files
    // Test dependencies should be in devDependencies, not dependencies
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
      },
    ],
  },
} satisfies Linter.Config;
