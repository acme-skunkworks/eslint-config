import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  retitleReleasePr,
  type Runner,
} from "../scripts/retitle-release-pr.js";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const packageJsonFixture = readFileSync(
  join(fixtureDir, "package-with-name-and-version.json"),
  "utf8",
);

type Call = { cmd: string; args: readonly string[] };

function makeRunner(handlers: Record<string, () => string>): {
  run: Runner;
  calls: Call[];
} {
  const calls: Call[] = [];
  const run: Runner = (cmd, args) => {
    calls.push({ cmd, args });
    const key = `${cmd} ${args.join(" ")}`;
    // Sort by length descending so the most specific prefix wins. Guards
    // against silent shadowing if a future test registers a shorter
    // catch-all prefix before a longer specific one. ASW-169.
    for (const prefix of Object.keys(handlers).sort(
      (a, b) => b.length - a.length,
    )) {
      if (key.startsWith(prefix)) return handlers[prefix]();
    }
    return "";
  };
  return { run, calls };
}

describe("retitleReleasePr", () => {
  it("skips when PR_NUMBER is empty", () => {
    const { run, calls } = makeRunner({});
    const result = retitleReleasePr({ PR_NUMBER: "" }, run);
    expect(result).toEqual({ status: "skipped", reason: "PR_NUMBER is empty" });
    expect(calls).toEqual([]);
  });

  it("skips when PR_NUMBER is whitespace", () => {
    const { run, calls } = makeRunner({});
    const result = retitleReleasePr({ PR_NUMBER: "  " }, run);
    expect(result.status).toBe("skipped");
    expect(calls).toEqual([]);
  });

  it("skips when PR_NUMBER is undefined", () => {
    const { run, calls } = makeRunner({});
    const result = retitleReleasePr({}, run);
    expect(result.status).toBe("skipped");
    expect(calls).toEqual([]);
  });

  it("fetches, parses package.json, and edits the PR with <name>@<version>", () => {
    const { run, calls } = makeRunner({
      "git show FETCH_HEAD:package.json": () => packageJsonFixture,
    });
    const result = retitleReleasePr({ PR_NUMBER: "42" }, run);

    expect(result).toEqual({
      status: "ok",
      title: "@acme-skunkworks/eslint-config@1.2.3",
    });
    expect(calls).toEqual([
      { cmd: "git", args: ["fetch", "origin", "changeset-release/main"] },
      { cmd: "git", args: ["show", "FETCH_HEAD:package.json"] },
      {
        cmd: "gh",
        args: [
          "pr",
          "edit",
          "42",
          "--title",
          "@acme-skunkworks/eslint-config@1.2.3",
        ],
      },
    ]);
  });

  it("throws if package.json is missing `name`", () => {
    const { run } = makeRunner({
      "git show FETCH_HEAD:package.json": () =>
        JSON.stringify({ version: "1.0.0" }),
    });
    expect(() => retitleReleasePr({ PR_NUMBER: "1" }, run)).toThrow(
      /missing a string `name`/,
    );
  });

  it("throws if package.json is missing `version`", () => {
    const { run } = makeRunner({
      "git show FETCH_HEAD:package.json": () => JSON.stringify({ name: "pkg" }),
    });
    expect(() => retitleReleasePr({ PR_NUMBER: "1" }, run)).toThrow(
      /missing a string `version`/,
    );
  });

  it("throws if package.json is invalid JSON", () => {
    const { run } = makeRunner({
      "git show FETCH_HEAD:package.json": () => "not json {",
    });
    expect(() => retitleReleasePr({ PR_NUMBER: "1" }, run)).toThrow();
  });
});
