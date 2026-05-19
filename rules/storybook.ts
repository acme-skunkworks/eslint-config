import type { Linter } from "eslint";
import tseslint from "typescript-eslint";

/**
 * Opt-in. Pull in for projects using Storybook (`*.stories.{ts,tsx}` files).
 *
 * Disables `canonical/filename-match-exported` (Storybook stories typically
 * sit alongside their component with the same basename, e.g. `Button.tsx`
 * and `Button.stories.tsx`) and turns off type-aware lint rules. The latter
 * is needed because Storybook files are usually excluded from `tsconfig`
 * project references — leaving type-aware rules on would produce
 * "file not in project" errors. Syntax-based rules stay active.
 */
export const storybook: Linter.Config = {
  files: ["**/*.stories.ts", "**/*.stories.tsx"],
  ignores: ["**/storybook-static/**/*"],
  rules: {
    // canonical/filename-match-exported — requires default export name to match the filename.
    // Off: stories are named `Component.stories.tsx`, not after the default export symbol.
    // https://github.com/gajus/eslint-plugin-canonical#rules
    "canonical/filename-match-exported": "off",
    // typescript-eslint disableTypeChecked — turns off rules that need type information.
    // Spread: story files are often excluded from tsconfig; avoids "not in project" errors.
    // https://typescript-eslint.io/users/configs#disable-type-checked
    ...tseslint.configs.disableTypeChecked.rules,
  },
} satisfies Linter.Config;
