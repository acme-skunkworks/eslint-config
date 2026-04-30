import type { Linter } from "eslint";

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
