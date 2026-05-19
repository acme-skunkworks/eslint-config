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
    "**/{vitest,jest,playwright,test}.setup.{ts,js}",
    "**/__tests__/**/*.setup.{ts,js}",
    "**/tests/**/*.setup.{ts,js}",
  ],
  rules: {
    // @typescript-eslint/no-explicit-any — disallows the `any` type.
    // Warn in tests: fixtures and error-path tests often need `any` for edge-case coverage.
    // https://typescript-eslint.io/rules/no-explicit-any
    "@typescript-eslint/no-explicit-any": "warn",
    // @typescript-eslint/no-non-null-assertion — disallows postfix `!` non-null assertions.
    // Warn in tests: preconditions are often asserted; failure surfaces as a test failure anyway.
    // https://typescript-eslint.io/rules/no-non-null-assertion
    "@typescript-eslint/no-non-null-assertion": "warn",
    // @typescript-eslint/triple-slash-reference — disallows `/// <reference … />` directives.
    // Off in setup files: Vitest/Jest setups use triple-slash to augment global types.
    // https://typescript-eslint.io/rules/triple-slash-reference
    "@typescript-eslint/triple-slash-reference": "off",
    // import/no-extraneous-dependencies — forbids importing packages not listed in package.json.
    // Error + devDependencies true: test-only packages belong in devDependencies, not dependencies.
    // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-extraneous-dependencies.md
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
      },
    ],
  },
} satisfies Linter.Config;
