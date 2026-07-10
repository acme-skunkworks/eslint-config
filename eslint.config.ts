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
];

export default config;
