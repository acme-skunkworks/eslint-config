# Switch versioning from Changesets to Conventional Commits (release-please)

**Status:** accepted (2026-06-22)
**Linear:** [SK-371](https://linear.app/acme-skunkworks/issue/SK-371)

This ADR proposes replacing **Changesets** with a **Conventional Commits**–driven flow using [release-please](https://github.com/googleapis/release-please), changing _only_ how the version bump is decided and leaving the release topology, security model, and `package.json` semantics untouched. It documents the trade-offs and a deliberately narrowed scope. **Decision: accepted — proceed with strand A** (2026-06-22); implementation is tracked in [SK-371](https://linear.app/acme-skunkworks/issue/SK-371) and **not yet actioned in code**.

## Context

Versioning today is Changesets-driven. A contributor (via `/send-it`) writes an explicit `.changeset/<slug>.md` declaring the bump and prose; the private **release-orchestrator** later runs `pnpm changeset:version`, opens the version PR, and on a later tick squash-merges it; that merge fires `release.yml`, which publishes the prebuilt tarball to npm via OIDC Trusted Publishing (+ provenance) and mirrors it to GitHub Packages. The whole pipeline has been hardened deliberately (ASW-312/320/323/325/326/328): the org-compromise-grade App key never touches public CI, build-time code runs only in an unprivileged `build` job, and both publish legs ship one byte-identical, attested tarball.

The motivating question was "should we move to Conventional Commits?" Rubber-ducking it surfaced that the question braids together **four independent decisions** that were being treated as one:

| Strand                           | The decision                                                               | Independent?                        |
| -------------------------------- | -------------------------------------------------------------------------- | ----------------------------------- |
| **A — Bump source**              | Explicit files (Changesets) → inferred from commits (Conventional Commits) | The only thing actually being asked |
| **B — Release topology**         | Version-PR model (the "doubling") → no-PR / direct                         | A separate, larger project          |
| **C — `package.json` freshness** | Written back to `main` → stale                                             | A _consequence of B_, not of A      |
| **D — Versioning identity**      | Private orchestrator + App key → public CI / keyless                       | Also a _consequence of B_           |

The 2×2 proves A and B are orthogonal:

- Changesets + version PR ← **today**
- Conventional Commits + version PR ← **release-please** (this proposal)
- Changesets + no version PR ← possible, unusual
- Conventional Commits + no version PR ← semantic-release (the rabbit hole)

The "stale `package.json`" concern and the "retire the orchestrator / re-review the App key" concern are **both artefacts of strand B**, not of Conventional Commits. release-please keeps the version-PR model, so it bumps `package.json` in the release PR exactly as Changesets does today — `main` always reflects the published version. **This ADR scopes to strand A only.** Strand B (collapsing the doubling) is explicitly out of scope and, if ever wanted, is a separate evaluation that re-introduces stale `package.json` and an App-key security re-review for the modest prize of one fewer commit per release.

Two related sub-decisions, already settled in discussion:

- **Squash merge stays.** Conventional Commits works with squash merges as long as the squash subject carries the conventional prefix (GitHub's "PR title" squash default makes this so). No change to how PRs are merged (incl. via Linear) is required — only a PR-title lint to keep the subject parseable.
- **Root `CHANGELOG.md` can be dropped.** It duplicates the dated `changelog/` entries, which remain the curated, machine-readable record.

### Merge strategy: squash vs merge commits

The "squash merge stays" sub-decision above is the recommended path. If merge commits are ever preferred instead (e.g. for richer first-parent history), they are **compatible but carry specific costs** — recorded here so the trade-off isn't rediscovered.

**The bump signal moves.** Under squash, the single squash commit = the PR title, so release-please reads one conventional subject (enforce **conventional PR titles**). Under merge commits, every branch commit lands on `main` and release-please parses **all of them** — the `Merge pull request #N` commit is non-conventional and ignored, so the bump comes from the individual commits. Enforcement therefore moves from the PR title to **every commit** (commitlint as a `commit-msg` hook becomes near-mandatory); the conventional-PR-title lint no longer drives versioning.

**New risks merge commits introduce (single-package repo):**

- **Silent over-bump.** A stray mid-branch `feat!:` or `BREAKING CHANGE:` footer inflates the version (potentially to a major) even when the PR as a whole is a patch. Squash exposes only the final title; merge commits expose every commit.
- **Added-then-reverted over-bump.** A branch with `feat: X` then `revert: X` still counts the `feat:` → minor, despite zero net change. Squash collapses it.
- **`/send-it` changes job.** Its derived conventional _PR title_ stops driving the version; it would instead need to guarantee conventional _commits_ on the branch, leaning on commitlint.
- **Release-note noise.** If the `🏷️ Tag + GitHub release` notes are sourced from the commit log, every WIP commit leaks in. Mitigation: source notes from the dated `changelog/` entry, not the commit log.

**Pipeline gotcha — do not disable squash at the repo level.** The orchestrator merges the **release PR** with `gh pr merge --squash` (pinned to the gate-checked SHA, ASW-334). `gh pr merge --squash` fails if squash merging isn't an allowed method. So the obvious way to force merge commits on features — turning squash off — would **break the orchestrator's release-PR merge**. Correct setup: keep **both** methods enabled, set the repo **default to "merge commit"** (so Linear/humans default to it for feature PRs), and let the orchestrator keep explicitly passing `--squash` for the release PR. Feature history stays rich; the release PR stays a single tidy `chore(main): release X` commit.

**Net.** For a single-package repo, merge commits trade one clean enforcement point (PR title) for per-commit discipline plus the silent-over-bump risk, in exchange for richer history. Recommendation: **keep squash + conventional-PR-title** unless first-parent history genuinely matters; if adopting merge commits, the must-dos are (1) commitlint `commit-msg` hook, (2) keep squash enabled for the orchestrator, (3) set merge-commit as the repo default, (4) source release notes from `changelog/`.

## Considered Options

### A. release-please, strand A only (accepted)

Swap the _bump mechanism_ and nothing else. Concretely:

- **`/send-it`** stops writing `.changeset/*.md`; keeps writing the dated `changelog/*.md` entry; sets a **conventional PR title** (deriving `fix:` / `feat:` / `feat!:` from the existing `derive-changeset.ts` bump logic).
- **Orchestrator** runs `release-please release-pr` (instead of `pnpm changeset:version`) to open/update the release PR (`package.json` + `.release-please-manifest.json` bumped), then runs `finalise-changelog.ts` on that branch to fill placeholders, stamp the computed version, and linkify Linear IDs. The orchestrator still squash-merges the green release PR.
- **`release.yml`** changes one step: the `🔎 Detect pending changesets` gate becomes a keyless "version changed vs latest tag" gate. The `🏷️ Tag + GitHub release` step is unchanged — it still reads the (fresh) version from `package.json`. All privileged jobs are byte-for-byte the same.
- **`ci.yml`** gains two checks: a **conventional-PR-title lint** (e.g. `amannn/action-semantic-pull-request`) and a **changelog-completeness gate** (if the PR's type triggers a release, a new `changelog/*.md` must be present).
- New committed config: `release-please-config.json` + `.release-please-manifest.json`. `.changeset/` is deleted.

**Pros.** Achieves the goal (off Changesets, onto Conventional Commits). **Fresh `package.json`** — no staleness. App-key isolation, ASW-328 build-once, the `npm-release` environment, ref guards, the dated `changelog/` system, and squash-via-Linear all **unchanged** → no security re-review. Identical topology to today, so it ports cleanly across every org package.

**Cons.** Conventional Commits **decouples "a release happens" from "the changelog entry exists"** — which Changesets coupled for free (no changeset → no release). This must be re-enforced in CI (the new completeness gate). The bump source moves from a file you write to the PR title you write (lower friction, but a new failure mode: a mistyped prefix silently ships the wrong semver — mitigated by the title lint). Two new `ci.yml` checks and two new committed config files to maintain. One new orchestrator ordering rule (run `finalise-changelog` _after_ release-please each tick, since release-please owns/force-updates its release branch — safe because finalise is idempotent).

### B. release-please + collapse the doubling (semantic-release, out of scope)

Move to a no-version-PR topology so a feature merge publishes directly. Removes one commit per release.

**Why rejected for now.** Drags in **stale `package.json`** (version lives only in tags/npm/`changelog/`) and an **App-key security re-review** (versioning would move to public CI). The naive single-job form also _regresses ASW-328_ (the large semantic-release dependency graph runs adjacent to the OIDC publish credential); preserving ASW-328 requires a dry-run-decide / build / minimal-publish split that adds back the complexity the option was meant to remove. The prize — one fewer commit per release — is cosmetic. Recorded here so it isn't re-proposed without weighing these costs.

### C. Stay on Changesets

Keep the current flow. If the real pain is _forgetting_ a changeset rather than authoring one, cheaper fixes exist without a migration: make the changeset-status check blocking for shippable changes, lean on `/send-it` always deriving one, add a PR-template reminder.

**Why it's a live option.** Zero migration cost and zero new failure modes. The honest question gating A-vs-C is whether the team prefers commit/PR-title-driven intent over an explicit per-PR file — a taste/workflow call, not a capability gap.

## Decision

**Accepted — Option A (release-please, strand A only), 2026-06-22.** The deciding factor is **cross-repo consistency**: the org is standardising on release-please, which outweighs the "roughly lateral in isolation" assessment for this single package. Option C (stay on Changesets) was the defensible do-nothing; Option B (collapse the version-PR doubling / semantic-release) remains explicitly deferred. Implementation is tracked in [SK-371](https://linear.app/acme-skunkworks/issue/SK-371); this ADR records the decision, not its execution.

## Consequences

- **For consumers:** nothing changes — same package, same npm/provenance, version still visible in `package.json`.
- **If we proceed (A):** follow-up work is (1) `release-please-config.json` + `.release-please-manifest.json`; (2) the `/send-it` change (drop changeset write, set conventional PR title); (3) the orchestrator change (`release-please release-pr` + post-step `finalise-changelog`); (4) the `release.yml` gate change (version-vs-tag); (5) two new `ci.yml` checks (PR-title lint, changelog-completeness); (6) delete `.changeset/`, drop root `CHANGELOG.md`; (7) roll the same change across the other org packages. No change to the privileged release jobs or the security posture.
- **If we defer/reject (B/C):** the pipeline continues unchanged; the strand-B costs (stale `package.json`, App-key re-review, ASW-328 regression risk) are the gating conditions to revisit before ever pursuing the single-step topology.

## References

- Release pipeline & security model: `CLAUDE.md` (Release workflow, Cross-boundary hardening), `.github/workflows/release.yml`
- Dated changelog system: `changelog/README.md`, `infrastructure/scripts/finalise-changelog.ts`
- `/send-it` + changeset derivation: `.claude/commands/send-it.md`, `infrastructure/send-it/derive-changeset.ts`
- ADR format: `.claude/skills/grill-with-docs/ADR-FORMAT.md`
- release-please: <https://github.com/googleapis/release-please>
- Conventional Commits: <https://www.conventionalcommits.org/>
- PR-title lint action: <https://github.com/amannn/action-semantic-pull-request>
