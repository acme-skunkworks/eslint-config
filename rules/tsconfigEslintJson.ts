import type { Linter } from "eslint";

/**
 * Part of `base` — applied to every `tsconfig.eslint.json`.
 *
 * Disables jsonc formatting rules that conflict with Prettier output. Canonical's
 * `json` config requires multi-line arrays and strict object layout, but Prettier
 * collapses short arrays (e.g. `include`) onto one line — consumers were forced
 * to `.prettierignore` each file. Prettier owns JSON formatting for this path;
 * semantic jsonc/no-* rules from canonical still apply.
 *
 * See: https://linear.app/acme-skunkworks/issue/A-378
 */
export const tsconfigEslintJson = {
  files: ["**/tsconfig.eslint.json"],
  rules: {
    // jsonc/array-bracket-newline — requires line breaks after '[' and before ']'.
    // Off: Prettier keeps short include arrays on one line.
    // https://ota.github.io/eslint-plugin-jsonc/rules/array-bracket-newline.html
    "jsonc/array-bracket-newline": "off",
    // jsonc/array-element-newline — requires line breaks between array elements.
    // Off: Prettier keeps short include arrays on one line.
    // https://ota.github.io/eslint-plugin-jsonc/rules/array-element-newline.html
    "jsonc/array-element-newline": "off",
    // jsonc/object-curly-spacing — enforces spacing inside object braces.
    // Off: Prettier adds spaces inside '{' and '}' for JSON.
    // https://ota.github.io/eslint-plugin-jsonc/rules/object-curly-spacing.html
    "jsonc/object-curly-spacing": "off",
    // jsonc/object-property-newline — requires each object property on its own line.
    // Off: Prettier keeps short objects on one line.
    // https://ota.github.io/eslint-plugin-jsonc/rules/object-property-newline.html
    "jsonc/object-property-newline": "off",
  },
} satisfies Linter.Config;
