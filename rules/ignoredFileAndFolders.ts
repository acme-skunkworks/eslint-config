import type { Linter } from "eslint";

/**
 * Part of `base` — applied to every consumer.
 *
 * Global ignore list: build artifacts (`dist`, `build`, `storybook-static`,
 * `coverage`), tooling state directories (`.turbo`, `.vercel`, `.astro`,
 * `.react-router`, `.wrangler`, `.vscode`, `.claude`), `node_modules`, and
 * the lock file. Also ignores `tsconfig.json` and the consumer's own
 * `eslint.config.{ts,mjs}` — those are tooling input, not source to lint.
 */
export const ignoredFileAndFolders = {
  ignores: [
    "**/.react-router/**",
    "**/node_modules/**",
    "pnpm-lock.yaml",
    "**/.vscode/**",
    "**/.claude/**",
    "**/.vercel/**",
    "**/.astro/**",
    "**/.turbo/**",
    "**/build/**",
    "**/tsconfig.json",
    "**/dist/**",
    "**/storybook-static/**",
    "**/coverage/**",
    "**/eslint.config.ts",
    "**/eslint.config.mjs",
    "**/.wrangler/**",
  ],
} satisfies Linter.Config;
