#!/usr/bin/env -S npx tsx
// Post-merge enrichment of a changelog entry: backfills the fields that are
// only knowable once the feature PR has merged.
//
// Ported from octavo's scripts/enrich-changelog.mjs and adapted for this repo:
// `derivePackagesFromPaths` / `affected_packages` are dropped (single package).
// `version` is NOT filled here — it's only known at release time, stamped by
// stamp-changelog-version.ts.
//
// Inputs arrive via env (see EnrichInput). The pure `enrichFrontmatter(raw,
// input)` returns the rewritten markdown so it's unit-testable; main() does the
// directory lookup (by `branch`) and file write.

import matter from "gray-matter";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const CHANGELOG_DIR = "changelog";

export type EnrichInput = {
  additions?: null | string;
  /**
   * Feature branch name — the stable lookup key.
   */
  branch: string;
  changedFiles?: null | string;
  deletions?: null | string;
  /**
   * PR merged_at timestamp (ISO 8601 UTC).
   */
  mergedAt: string;
  /**
   * Merge commit SHA (full or short); only the first 7 chars are stored.
   */
  mergeSha: string;
  mergeStrategy?: null | string;
  prNumber?: null | string;
};

/**
 * True when a value is unset (null/undefined/"").
 */
function blank(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

/**
 * Apply enrichment to a single entry's raw markdown and return the rewritten
 * markdown. Fill-once for merged_at/commit/merge_strategy/pr; authoritative
 * overwrite for stats. created_at is never touched.
 */
export function enrichFrontmatter(raw: string, input: EnrichInput): string {
  const parsed = matter(raw);
  const fm = { ...parsed.data } as Record<string, unknown>;

  if (!fm.created_at) {
    throw new Error("entry has no created_at; refusing to enrich");
  }

  const shortSha = input.mergeSha.slice(0, 7);

  if (blank(fm.merged_at)) {
    fm.merged_at = input.mergedAt;
  }

  if (blank(fm.commit)) {
    fm.commit = shortSha;
  }

  if (blank(fm.merge_strategy) && input.mergeStrategy) {
    fm.merge_strategy = input.mergeStrategy;
  }

  if (blank(fm.pr) && input.prNumber) {
    fm.pr = Number.parseInt(input.prNumber, 10);
  }

  // Authoritative overwrites from the GH API, always under stats: { ... }.
  const stats =
    typeof fm.stats === "object" &&
    fm.stats !== null &&
    !Array.isArray(fm.stats)
      ? { ...(fm.stats as Record<string, unknown>) }
      : {};
  if (input.additions !== null && input.additions !== undefined) {
    stats.loc_added = Number.parseInt(input.additions, 10);
  }

  if (input.deletions !== null && input.deletions !== undefined) {
    stats.loc_removed = Number.parseInt(input.deletions, 10);
  }

  if (input.changedFiles !== null && input.changedFiles !== undefined) {
    stats.files_changed = Number.parseInt(input.changedFiles, 10);
  }

  fm.stats = stats;

  return matter.stringify(parsed.content, fm);
}

/**
 * Read env into an EnrichInput, exiting if a required var is missing.
 */
function readInput(
  environment: Record<string, string | undefined>,
): EnrichInput {
  function required(name: string): string {
    const value = environment[name];
    if (!value || value.trim() === "") {
      console.error(`enrich: missing required env var ${name}`);
      process.exit(2);
    }

    return value.trim();
  }

  function optional(name: string): null | string {
    const value = environment[name];
    return value && value.trim() !== "" ? value.trim() : null;
  }

  return {
    additions: optional("ADDITIONS"),
    branch: required("BRANCH_NAME"),
    changedFiles: optional("CHANGED_FILES"),
    deletions: optional("DELETIONS"),
    mergedAt: required("MERGED_AT"),
    mergeSha: required("MERGE_SHA"),
    mergeStrategy: optional("MERGE_STRATEGY"),
    prNumber: optional("PR_NUMBER"),
  };
}

function findEntryByBranch(directory: string, branch: string): null | string {
  const files = readdirSync(directory)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .map((name) => join(directory, name));
  for (const file of files) {
    const { data } = matter(readFileSync(file, "utf8"));
    if ((data as Record<string, unknown>)?.branch === branch) {
      return file;
    }
  }

  return null;
}

function main(): void {
  const input = readInput(process.env);
  const file = findEntryByBranch(CHANGELOG_DIR, input.branch);
  if (!file) {
    console.log(
      `No changelog entry found for branch '${input.branch}'. Nothing to enrich.`,
    );
    return;
  }

  console.log(`Enriching: ${file}`);
  const output = enrichFrontmatter(readFileSync(file, "utf8"), input);
  writeFileSync(file, output);
  console.log(`Wrote enriched frontmatter to ${file}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
