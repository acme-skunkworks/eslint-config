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
    // react/no-unused-prop-types — flags PropTypes declared but never used in the component.
    // Off under TS: prop types are checked by TypeScript, not runtime PropTypes.
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
    "react/no-unused-prop-types": "off",
    // react/prop-types — requires React components to declare PropTypes for props.
    // Off under TS: interfaces/types replace PropTypes for compile-time checking.
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md
    "react/prop-types": "off",
  },
} satisfies Linter.Config;
