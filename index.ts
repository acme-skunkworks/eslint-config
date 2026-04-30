/* eslint-disable canonical/filename-match-exported */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { astro } from "./rules/astro";
import { commonjs } from "./rules/commonjs";
import { frameworkRouting as frameworkRoutingRule } from "./rules/frameworkRouting";
import { ignoredFileAndFolders } from "./rules/ignoredFileAndFolders";
import { packageJson } from "./rules/packageJson";
import { preferences } from "./rules/preferences";
import { reactRouterExceptions } from "./rules/reactRouterExceptions";
import { sanity } from "./rules/sanity";
import { storybook } from "./rules/storybook";
import { testFiles } from "./rules/testFiles";
import { typescriptOverrides } from "./rules/typescriptOverrides";
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

export { astro } from "./rules/astro";
export { complexity } from "./rules/complexity";
export { e2e } from "./rules/e2e";
export { sanity } from "./rules/sanity";
export { storybook } from "./rules/storybook";
export { tableComponents } from "./rules/tableComponents";

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
