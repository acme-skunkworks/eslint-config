import type { Linter } from "eslint";
import globals from "globals";

/**
 * Part of `base` — applied to every consumer.
 *
 * `.cjs` parser shim: sets `sourceType: "script"` plus Node + ES2021 globals
 * so CommonJS files (legacy config files, certain tooling shims) parse
 * cleanly under the otherwise-ESM-default flat config.
 */
export const commonjs = {
  files: ["**/*.cjs"],
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
    sourceType: "script",
  },
} satisfies Linter.Config;
