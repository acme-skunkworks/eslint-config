import type { Linter } from "eslint";

/**
 * Re-exported as `typescript`. Pull in for any TypeScript consumer.
 *
 * Disables `react/prop-types` and `react/no-unused-prop-types` for `.ts` /
 * `.tsx` files. TypeScript's type system already enforces prop shape; the
 * runtime prop-type rules are redundant noise under TS.
 */
export const typescriptOverrides = {
  files: ["**/*.{ts,tsx}"],
  rules: {
    "react/no-unused-prop-types": "off",
    "react/prop-types": "off",
  },
} satisfies Linter.Config;
