import type { Linter } from "eslint";
import globals from "globals";

/**
 * Part of `base` — applied to every consumer.
 *
 * `.mjs` parser shim: the ESM counterpart to `commonjs`. Standalone ES-module
 * scripts (`.mjs`) — build/maintenance tooling, skill helpers — run in Node but
 * are not members of any tsconfig project, so the flat config gives them no
 * environment globals and `console` / `process` trip `no-undef`. This sets
 * `sourceType: "module"` plus Node + ES2021 globals so they parse cleanly. No
 * rules — only `languageOptions`.
 * @see https://eslint.org/docs/latest/use/configure/language-options
 */
export const esm = {
  files: ["**/*.mjs"],
  // Exclude node_modules
  ignores: ["**/node_modules/**"],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.es2021,
    },
    parserOptions: {
      ecmaVersion: "latest",
    },
    sourceType: "module",
  },
} satisfies Linter.Config;
