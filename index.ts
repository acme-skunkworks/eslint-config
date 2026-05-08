/* eslint-disable canonical/filename-match-exported */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { astro } from "./rules/astro.js";
import { commonjs } from "./rules/commonjs.js";
import { frameworkRouting as frameworkRoutingRule } from "./rules/frameworkRouting.js";
import { ignoredFileAndFolders } from "./rules/ignoredFileAndFolders.js";
import { packageJson } from "./rules/packageJson.js";
import { preferences } from "./rules/preferences.js";
import { reactRouterExceptions } from "./rules/reactRouterExceptions.js";
import { sanity } from "./rules/sanity.js";
import { storybook } from "./rules/storybook.js";
import { testFiles } from "./rules/testFiles.js";
import { typescriptOverrides } from "./rules/typescriptOverrides.js";
import type { Linter } from "eslint";
import eslintConfigCanonicalAuto from "eslint-config-canonical/auto";
import pluginImportX from "eslint-plugin-import-x";

// Plugin aliasing for eslint-config-canonical compatibility.
// Canonical references "import" but the package is "eslint-plugin-import-x".
// Register under both names so canonical's rules resolve and modern code works.
// See: https://github.com/RobEasthope/protomolecule/issues/259
const importXAlias: any = {
  plugins: {
    import: pluginImportX,
    "import-x": pluginImportX,
  },
};

/**
 * Base preset — the "you almost always want this" stack:
 * plugin-alias hack, global ignores, the canonical baseline, packageJson
 * lint config, commonjs file overrides, and the big preferences block
 * (top-level type imports, func-style, prettier, import resolver, etc.).
 */
export const base: Linter.Config[] = [
  importXAlias,
  ignoredFileAndFolders,
  ...(eslintConfigCanonicalAuto as Linter.Config[]),
  packageJson,
  commonjs,
  preferences,
];

/**
 * TypeScript-specific overrides for `**\/*.{ts,tsx}` files.
 */
export const typescript: Linter.Config = typescriptOverrides;

/**
 * Framework-routing preset for file-routed frameworks (Next.js, React Router 7,
 * Remix, SvelteKit, Astro, Nuxt). Disables `canonical/filename-match-exported`
 * for routing directories and re-allows arrow functions on `root.tsx` /
 * `*.route.tsx` for typed-export patterns.
 *
 * Order matters: `reactRouterExceptions` MUST come after `preferences` (which
 * `base` already includes) so its `func-style` override wins.
 */
export const frameworkRouting: Linter.Config[] = [
  frameworkRoutingRule,
  reactRouterExceptions,
];

/**
 * Test-file overrides for `*.test.*`, `*.spec.*`, `__tests__/**`, setup files.
 */
export const testing: Linter.Config = testFiles;

/**
 * Opt-in. Astro framework support — pull in for projects with `*.astro` files.
 */
export { astro } from "./rules/astro.js";
/**
 * Opt-in. Cyclomatic-complexity exemption for orchestration scripts under `scripts/**`.
 */
export { complexity } from "./rules/complexity.js";
/**
 * Opt-in. Playwright fixture exception — pull in for projects with end-to-end tests under `e2e/**`.
 */
export { e2e } from "./rules/e2e.js";
/**
 * Opt-in. Sanity Studio schema ordering and structure-file exceptions — pull in for projects using Sanity.
 */
export { sanity } from "./rules/sanity.js";
/**
 * Opt-in. Storybook story-file overrides — pull in for projects with `*.stories.{ts,tsx}` files.
 */
export { storybook } from "./rules/storybook.js";
/**
 * Opt-in. TanStack Table / Refine cell-renderer exception — pull in for projects with `*Table.tsx` files.
 */
export { tableComponents } from "./rules/tableComponents.js";

/**
 * Back-compat default export — preserves the v6.x composition exactly so
 * existing consumers can `import config from "@acme-skunkworks/eslint-config"`
 * during their migration window.
 *
 * **Deprecated**: prefer named imports per the README's "Migrating from
 * `@robeasthope/eslint-config`" section. The default export will be removed
 * in a future major.
 */
const defaultConfig: Linter.Config[] = [
  ...base,
  ...astro,
  testFiles,
  storybook,
  typescriptOverrides,
  reactRouterExceptions,
  frameworkRoutingRule,
  ...sanity,
];

export default defaultConfig;
