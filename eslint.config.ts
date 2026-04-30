/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable canonical/filename-match-exported */
import { ignoredFileAndFolders } from "./rules/ignoredFileAndFolders.js";
import { packageJson } from "./rules/packageJson.js";
import { preferences } from "./rules/preferences.js";
import { storybook } from "./rules/storybook.js";
import { typescriptOverrides } from "./rules/typescriptOverrides.js";
import eslintConfigCanonicalAuto from "eslint-config-canonical/auto";

const config: any[] = [
  ignoredFileAndFolders,
  ...eslintConfigCanonicalAuto,
  packageJson,
  storybook,
  typescriptOverrides,
  preferences,
];

export default config;
