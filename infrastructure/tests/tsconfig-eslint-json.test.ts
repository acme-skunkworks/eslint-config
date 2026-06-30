import { ESLint } from "eslint";
import { execSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";

import { base } from "../../dist/index.js";

const FIXTURE = "infrastructure/tests/fixtures/tsconfig.eslint.json";
const DUPE_KEYS_FIXTURE =
  "infrastructure/tests/fixtures/dupe-keys/tsconfig.eslint.json";

describe("tsconfig.eslint.json under base", () => {
  beforeAll(() => {
    execSync("pnpm run build", { stdio: "inherit" });
  });

  it("passes lint when Prettier-formatted (single-line include)", async () => {
    const eslint = new ESLint({ baseConfig: base, overrideConfigFile: true });
    const [result] = await eslint.lintFiles([FIXTURE]);

    expect(result?.errorCount).toBe(0);
  });

  it("still reports semantic jsonc violations", async () => {
    const eslint = new ESLint({ baseConfig: base, overrideConfigFile: true });
    const [result] = await eslint.lintFiles([DUPE_KEYS_FIXTURE]);

    expect(
      result?.messages.some((m) => m.ruleId === "jsonc/no-dupe-keys"),
    ).toBe(true);
  });
});
