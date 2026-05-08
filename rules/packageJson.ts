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
    "jsonc/sort-keys": "off",
  },
} satisfies Linter.Config;
