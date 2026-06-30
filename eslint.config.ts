/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable canonical/filename-match-exported */
import { ignoredFileAndFolders } from "./rules/ignoredFileAndFolders.js";
import { packageJson } from "./rules/packageJson.js";
import { preferences } from "./rules/preferences.js";
import { storybook } from "./rules/storybook.js";
import { tsconfigEslintJson } from "./rules/tsconfigEslintJson.js";
import { typescriptOverrides } from "./rules/typescriptOverrides.js";
import eslintConfigCanonicalAuto from "eslint-config-canonical/auto";

const config: any[] = [
  {
    ignores: [
      "infrastructure/tests/fixtures/dupe-keys/**",
      "infrastructure/tests/**/*.test.ts",
    ],
  },
  ignoredFileAndFolders,
  ...eslintConfigCanonicalAuto,
  packageJson,
  tsconfigEslintJson,
  storybook,
  typescriptOverrides,
  preferences,
  // infrastructure/ holds workflow-extracted CLI tooling (not published code):
  // it legitimately imports devDependencies (e.g. gray-matter), and the
  // changelog validator is an inherently branchy flat list of schema checks, so
  // the default complexity ceiling doesn't apply. Scoped narrowly to this dir.
  {
    files: ["infrastructure/**/*.ts"],
    rules: {
      complexity: "off",
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    },
  },
];

export default config;
