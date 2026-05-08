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
    "canonical/filename-match-exported": "off",
    // Disable type-aware linting for Storybook files excluded from tsconfig
    // This keeps syntax-based rules active while avoiding project reference errors
    ...tseslint.configs.disableTypeChecked.rules,
  },
} satisfies Linter.Config;
