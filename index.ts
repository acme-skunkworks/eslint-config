/* eslint-disable canonical/filename-match-exported */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { astro } from "./rules/astro";
import { commonjs } from "./rules/commonjs";
import { frameworkRouting } from "./rules/frameworkRouting";
import { ignoredFileAndFolders } from "./rules/ignoredFileAndFolders";
import { packageJson } from "./rules/packageJson";
import { preferences } from "./rules/preferences";
import { reactRouterExceptions } from "./rules/reactRouterExceptions";
import { sanity } from "./rules/sanity";
import { storybook } from "./rules/storybook";
import { testFiles } from "./rules/testFiles";
import { typescriptOverrides } from "./rules/typescriptOverrides";
import eslintConfigCanonicalAuto from "eslint-config-canonical/auto";
import pluginImportX from "eslint-plugin-import-x";

const config: any[] = [
  // Plugin aliasing for eslint-config-canonical compatibility
  // Canonical config references "import" but package is "eslint-plugin-import-x"
  // Register under both names for backward compatibility
  // See: https://github.com/RobEasthope/protomolecule/issues/259
  {
    plugins: {
      import: pluginImportX, // Alias for canonical config compatibility
      "import-x": pluginImportX, // Standard name
    },
  },
  ignoredFileAndFolders,
  ...eslintConfigCanonicalAuto,
  packageJson,
  commonjs,
  storybook,
  typescriptOverrides,
  testFiles,
  ...astro,
  preferences,
  // React Router 7 exceptions MUST come after preferences to override func-style
  // See: https://github.com/RobEasthope/protomolecule/issues/323
  reactRouterExceptions,
  frameworkRouting,
  // Sanity-specific ESLint configurations:
  // - Schema property ordering for *.schema.ts files (#360)
  // - Structure file exceptions for structure.ts and deskStructure.ts (#365)
  ...sanity,
];

export default config;
