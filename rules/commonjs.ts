import type { Linter } from "eslint";
import globals from "globals";

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
