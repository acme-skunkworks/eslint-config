import type { Linter } from "eslint";

/**
 * Part of `base` — applied to every `package.json`.
 *
 * Disables `jsonc/sort-keys` so the canonical npm field order is preserved.
 * `sort-package-json` (run via lint-staged) owns that ordering instead — it
 * understands the conventional grouping (name → version → scripts → deps),
 * which a strict alphabetical sort would scramble.
 */
export const packageJson = {
  files: ["**/package.json"],
  rules: {
    // jsonc/sort-keys — enforces alphabetical (or configured) key order in JSON/JSONC files.
    // Off: sort-package-json (lint-staged) owns package.json field order with npm conventions.
    // https://ota.github.io/eslint-plugin-jsonc/rules/sort-keys.html
    "jsonc/sort-keys": "off",
  },
} satisfies Linter.Config;
