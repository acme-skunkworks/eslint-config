import { describe, expect, it } from "vitest";

import {
  checkCompleteness,
  hasChangelogEntry,
  isReleaseTriggering,
} from "../scripts/check-changelog-completeness.js";

describe("isReleaseTriggering", () => {
  it("is true for feat", () => {
    expect(isReleaseTriggering("feat: add a preset")).toBe(true);
  });

  it("is true for fix", () => {
    expect(isReleaseTriggering("fix: handle nullable")).toBe(true);
  });

  it("is true for a scoped feat", () => {
    expect(isReleaseTriggering("feat(react): add hook")).toBe(true);
  });

  it("is true for a breaking bang on any type", () => {
    expect(isReleaseTriggering("refactor!: drop legacy API")).toBe(true);
    expect(isReleaseTriggering("feat!: remove export")).toBe(true);
  });

  it("is true for perf", () => {
    expect(isReleaseTriggering("perf: speed up")).toBe(true);
  });

  it("is true for revert", () => {
    expect(isReleaseTriggering("revert: undo foo")).toBe(true);
  });

  it("is false for non-release types", () => {
    for (const title of [
      "docs: update readme",
      "chore: bump dep",
      "ci: harden workflow",
      "refactor: tidy internals",
      "test: add cases",
      "build: tweak tsconfig",
      "style: reformat",
    ]) {
      expect(isReleaseTriggering(title)).toBe(false);
    }
  });

  it("tolerates leading/trailing whitespace", () => {
    expect(isReleaseTriggering("  feat: trimmed  ")).toBe(true);
  });
});

describe("hasChangelogEntry", () => {
  it("is true when a dated changelog entry is in the diff", () => {
    expect(
      hasChangelogEntry([
        "rules/astro.ts",
        "changelog/20260623-101010-add-astro.md",
      ]),
    ).toBe(true);
  });

  it("ignores changelog/README.md", () => {
    expect(hasChangelogEntry(["changelog/README.md", "rules/astro.ts"])).toBe(
      false,
    );
  });

  it("is false when no changelog entry is present", () => {
    expect(hasChangelogEntry(["index.ts", "rules/base.ts"])).toBe(false);
  });
});

describe("checkCompleteness", () => {
  it("passes a non-release-triggering PR with no entry", () => {
    const result = checkCompleteness("docs: tidy", ["README.md"]);
    expect(result.ok).toBe(true);
  });

  it("passes a release-triggering PR that carries an entry", () => {
    const result = checkCompleteness("feat: add preset", [
      "rules/astro.ts",
      "changelog/20260623-101010-add-astro.md",
    ]);
    expect(result.ok).toBe(true);
  });

  it("fails a release-triggering PR with no entry", () => {
    const result = checkCompleteness("fix: handle nullable", ["rules/base.ts"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/no changelog/);
  });

  it("fails a breaking PR with no entry", () => {
    const result = checkCompleteness("feat!: drop export", ["index.ts"]);
    expect(result.ok).toBe(false);
  });
});
