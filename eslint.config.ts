/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable canonical/filename-match-exported */
import { ignoredFileAndFolders } from "./rules/ignoredFileAndFolders";
import { packageJson } from "./rules/packageJson";
import { preferences } from "./rules/preferences";
import { storybook } from "./rules/storybook";
import { typescriptOverrides } from "./rules/typescriptOverrides";
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
