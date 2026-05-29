#!/usr/bin/env -S npx tsx
// Release-time enrichment: stamps the just-published `version` onto every
// changelog entry that doesn't yet have one.
//
// This is the second of the two enrichment passes (the first, enrich-changelog,
// runs on feature-PR merge and fills merged_at/commit/pr/stats). Because
// Changesets decides the version, an entry can't know its version until the
// release publishes — so release.yml runs this after publish, reading the
// freshly-bumped version from package.json.
//
// Idempotent: entries that already carry a version are left untouched, so a
// re-run (or a release that ships no new entries) is a no-op.
//
// The pure `stampVersion(raw, version)` returns rewritten markdown (or null if
// nothing changed) and is unit-testable; main() reads package.json + the dir.

import matter from "gray-matter";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const CHANGELOG_DIR = "changelog";

/**
 * True when a value is unset (null/undefined/"").
 */
function blank(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

/**
 * Stamp `version` onto an entry if it has none. Returns the rewritten markdown,
 * or null when the entry already has a version (no write needed).
 */
export function stampVersion(raw: string, version: string): null | string {
  const parsed = matter(raw);
  const fm = { ...parsed.data } as Record<string, unknown>;
  if (!blank(fm.version)) {
    return null;
  }

  fm.version = version;
  return matter.stringify(parsed.content, fm);
}

/**
 * Read the `version` field from a package.json string.
 */
export function readPackageVersion(packageJsonRaw: string): string {
  const pkg = JSON.parse(packageJsonRaw) as { version?: unknown };
  if (typeof pkg.version !== "string" || pkg.version.length === 0) {
    throw new Error("package.json is missing a string `version`");
  }

  return pkg.version;
}

function main(): void {
  const version = readPackageVersion(readFileSync("package.json", "utf8"));
  const files = readdirSync(CHANGELOG_DIR)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .map((name) => join(CHANGELOG_DIR, name));

  let stamped = 0;
  for (const file of files) {
    const next = stampVersion(readFileSync(file, "utf8"), version);
    if (next !== null) {
      writeFileSync(file, next);
      stamped++;
      console.log(`stamped ${version}: ${file}`);
    }
  }

  console.log(
    `Version stamping complete. ${stamped} entr${stamped === 1 ? "y" : "ies"} stamped with ${version}.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
