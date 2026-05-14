#!/usr/bin/env -S npx tsx
// Rewrites the Changesets-opened "Version Packages" PR title from the static
// `release: version packages` (set in release.yml) to `<name>@<version>` after
// the action has bumped package.json on the changeset-release/main branch.
//
// Inputs are read from env, not argv, so the script is trivially mockable in
// tests and we don't have to think about shell quoting in YAML:
//
//   PR_NUMBER  — the changesets/action output `pullRequestNumber`. Empty means
//                the action either published (no PR) or had nothing to do; in
//                that case we exit cleanly. The workflow's `if:` should gate
//                this already, but the guard is here for direct invocations.
//   GH_TOKEN   — passed through to `gh` via the subprocess env.

import { execFileSync } from "node:child_process";

export type Runner = (cmd: string, args: readonly string[]) => string;

export type RetitleResult =
  | { reason: string; status: "skipped" }
  | { status: "ok"; title: string };

function realRunner(cmd: string, args: readonly string[]): string {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
}

export function retitleReleasePr(
  environment: Record<string, string | undefined>,
  run: Runner,
): RetitleResult {
  const prNumber = environment.PR_NUMBER?.trim();
  if (!prNumber) {
    return { reason: "PR_NUMBER is empty", status: "skipped" };
  }

  run("git", ["fetch", "origin", "changeset-release/main"]);
  const packageJsonRaw = run("git", ["show", "FETCH_HEAD:package.json"]);
  const pkg = JSON.parse(packageJsonRaw) as {
    name?: unknown;
    version?: unknown;
  };

  if (typeof pkg.name !== "string" || pkg.name.length === 0) {
    throw new Error("package.json is missing a string `name`");
  }

  if (typeof pkg.version !== "string" || pkg.version.length === 0) {
    throw new Error("package.json is missing a string `version`");
  }

  const title = `${pkg.name}@${pkg.version}`;
  run("gh", ["pr", "edit", prNumber, "--title", title]);
  return { status: "ok", title };
}

function main(): void {
  const result = retitleReleasePr(process.env, realRunner);
  if (result.status === "skipped") {
    console.log(`retitle-release-pr: skipped (${result.reason})`);
  } else {
    console.log(`retitle-release-pr: set title to ${result.title}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
