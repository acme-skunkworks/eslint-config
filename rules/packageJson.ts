import type { Linter } from "eslint";

export const packageJson = {
  files: ["**/package.json"],
  rules: {
    "jsonc/sort-keys": "off",
  },
} satisfies Linter.Config;
