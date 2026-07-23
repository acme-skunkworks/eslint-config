# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Claude Code reads only `CLAUDE.md`, so the `@AGENTS.md` line below imports the canonical shared
block (which Cursor reads from `AGENTS.md` natively). Estate-wide guidance lives there;
repo-specific guidance follows below.

@AGENTS.md

## Repo

Standalone home for `@acme-skunkworks/eslint-config` (extracted from `RobEasthope/protomolecule` — see `MIGRATION_FROM_PROTOMOLECULE.md`). Single ESLint v9 flat-config package, written in TypeScript, compiled to `dist/`, published from this repo via release-please (Conventional Commits — A-371).

## GitHub Actions repo config (A-176)

Non-secret knobs shared by `ci.yml` and `pkg-release.yml` live in **`infrastructure/repo-config.yaml`**, loaded at runtime via `reusable-load-repo-config.yml@v1` (A-779).

| Key                         | Purpose                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `defaultBranch`             | Canonical default branch; keep in sync with static `on:` triggers (GitHub cannot derive `on.push.branches` from this file). |
| `nodeVersionFile`           | Passed to `actions/setup-node` `node-version-file`.                                                                         |
| `npmRegistryUrl`            | Public npm registry (`setup-node` when talking to npmjs).                                                                   |
| `npmScope`                  | Package scope; must equal the owning GitHub org so `setup-node` scopes `.npmrc` for the GitHub Packages leg (A-323).        |
| `githubPackagesRegistryUrl` | GitHub Packages npm registry (`https://npm.pkg.github.com`) — the secondary publish target (A-323).                         |

Secrets (`GITHUB_TOKEN`), OIDC Trusted Publishing, and release-please behaviour are unchanged — not in this file.

## Commands

```bash
pnpm install        # install deps
pnpm run build      # tsc → dist/ (the published artifact; consumers import from dist)
pnpm tsc            # type-check only (no emit)
pnpm lint           # lint this package's own source (index.ts + rules/** + infrastructure/**)
pnpm lint:fix       # auto-fix
pnpm lint:md        # markdownlint (CI: build-and-lint job in ci.yml)
pnpm lint:yaml      # yamllint . (semantic YAML check; warnings non-blocking)
pnpm lint:workflows # actionlint on .github/workflows/
pnpm lint:sh        # shellcheck on infrastructure/scripts/*.sh + .husky/*
pnpm test           # vitest run (infrastructure/tests/**/*.test.ts)
pnpm test:watch     # vitest in watch mode
pnpm test:sh        # bats on infrastructure/tests/*.bats
pnpm format         # prettier write
pnpm validate:changelog  # validate dated changelog/ entries (CI: build-and-lint job)
```

Node 22 required (`.nvmrc`, `engines.node: ">=22"`, `engine-strict=true` in `.npmrc`).

## Agent skills

The shipping and housekeeping commands are provided by the shared
[`@acme-skunkworks/agent-skills`](https://github.com/acme-skunkworks/agent-skills)
bundles, installed via [skills.sh](https://skills.sh) under `.claude/skills/`
(and mirrored to `.agents/skills/` for Cursor). They replace the previous bespoke
`.claude/commands/send-it.md`:

- `/send-it` — commit → preflight → dated changelog entry → Conventional-Commit PR
  title → push → draft PR → Linear → In Review. Delegates to `preflight`,
  `changelog`, and `linear-sync`.
- `/preflight` — change-gated, branch-scoped lint preflight.
- `/changelog` — author/refresh/validate the dated `changelog/` entry.
- `/linear-sync` — transition linked Linear issues.
- `/cleanup-repo` — prune merged branches, worktrees, filesystem cruft.
- `/triage-pr` — drive a PR from draft-with-failing-CI to merge-ready.

Each skill reads its own `config.json` (reconciled by `initialise-skills` from
this repo's facts). Re-install or upgrade with `npx skills add … --copy`; re-run
`initialise-skills` afterwards to pick up new config keys.

## Local hooks

`pnpm install` runs `prepare` (`husky`), which installs the hooks under `.husky/`. Three hooks fire:

- **`pre-commit`** — runs `pnpm lint-staged`. Auto-fixes only the staged files: `prettier --write` for everything, `eslint --fix` for `**/*.{ts,tsx,js,mjs,cjs}`, `sort-package-json` + `eslint --fix` for `**/package.json` (the `packageJson` preset's glob applies, plus any `jsonc/*` rules from canonical), `markdownlint-cli2 --fix` for `**/*.{md,mdx}`, `yamllint` (read-only check) for `**/*.{yml,yaml}`, `actionlint` (read-only check) for `.github/workflows/*.{yml,yaml}`. Each task is wrapped in `bash -c '… "$@" --` so the staged file paths are passed through. The auto-fixers carry an `|| true` fallback so they never block — CI is the gate. The two YAML linters intentionally do **not** carry the `|| true` fallback: semantic errors block the commit (warnings don't). yamllint and actionlint are best-effort: if the tool isn't on `PATH` locally, the hook prints a platform-appropriate `brew install …` (or `pip` / `curl`) hint and skips. CI still enforces.
- **`commit-msg`** — strips any `Co-Authored-By: Claude … <noreply@anthropic.com>` trailer. Backstops the global `~/.claude/CLAUDE.md` rule (Claude is tooling, not a contributor).
- **`pre-push`** — blocks direct pushes to `main`; humans should use `/send-it` to open a PR. Bot users (`github-actions[bot]`, `road-runner-bot[bot]`) bypass — the release-please release commit (`chore(main): release <version>`) is authorised by bot identity, not commit message shape. A-1023 also runs a best-effort `commitlint --from origin/main --to HEAD` range check, skipping with an install hint when `@commitlint/cli` or `origin/main` is missing; CI’s reusable commit-validation workflow remains authoritative. Configuration is `commitlint.config.mjs`, extending `@acme-skunkworks/commitlint-config`.

Hooks are dormant in CI: `pkg-release.yml` and `ci.yml` set `HUSKY=0` so the `prepare` script no-ops during `pnpm install`.

To bypass any hook in an emergency: `git commit --no-verify` or `git push --no-verify` — not recommended.

## Markdown lint

`markdownlint-cli2` reads `.markdownlint-cli2.jsonc`, which extends `@acme-skunkworks/markdownlint-config`. Pre-commit auto-fixes staged `**/*.{md,mdx}` via lint-staged (`|| true`, so it never blocks). **CI enforces:** the `build-and-lint` job in `ci.yml` runs `pnpm lint:md` after ESLint.

## Validating workflows and YAML

Two non-Node tools augment Prettier's formatting pass with the semantic checks Prettier can't see (Actions schema, `${{ … }}` expression typos, duplicate keys, etc.):

- **`actionlint` v1.7.5** — Go binary. Local install: `brew install actionlint` (macOS) or `bash <(curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/v1.7.5/scripts/download-actionlint.bash)` elsewhere. CI downloads the official tarball and caches it.
- **`yamllint` 1.37.1** — Python tool. Local install: `brew install yamllint` (macOS) or `pip install --user yamllint==1.37.1` elsewhere. CI installs via pip and caches `~/.local`.

**Digest-pinned bootstraps (A-327).** The CI install scripts for these tools fetch-and-execute third-party code, so each is pinned by digest, not just a mutable tag:

- `ensure-actionlint.sh` fetches `download-actionlint.bash` from the **immutable commit SHA** of the v1.7.5 tag (not the `v1.7.5` tag), passes the version explicitly so it installs that exact release, then independently re-verifies the extracted binary against a pinned sha256 (enforced on the CI arch, linux/amd64).
- `ensure-bats.sh` verifies the downloaded release tarball against a pinned sha256 before extraction.
- `ensure-yamllint.sh` installs via `pip install --require-hashes -r infrastructure/requirements-yamllint.txt`, so pip refuses any artefact — yamllint or a transitive dep — whose digest isn't listed. Regenerate that file when bumping (see its header).

When bumping any of these, update the version **and** the matching digest/requirements together. These scripts run only in local hooks and the reusable lint lane's pre-commit equivalents — publish logic lives in `acme-skunkworks/shared-workflows` (`reusable-pkg-release.yml`, A-588).

Configuration: `.yamllint.yml` at the repo root extends defaults, demotes line-length / indentation to warnings (Prettier owns formatting), allows the GitHub Actions truthy values (`on`, `off`, `yes`, `no`), and ignores `node_modules/`, `dist/`, `.turbo/`, `pnpm-lock.yaml`. CI YAML linting is owned by the shared `reusable-lint.yml` lane (centralised `.yamllint.yml` + actionlint 1.7.12 in shared-workflows, SK-422).

Enforcement: pre-commit is best-effort (skip with install hint when missing); CI is the shared `lint` reusable caller in `ci.yml`, always enforced.

## Validating workflows locally with `act`

`actionlint` and `yamllint` catch schema and expression-level mistakes. They say nothing about whether a workflow actually _works_ end-to-end — Node/pnpm setup ordering, env propagation, conditional skips, step interdependencies. [`act`](https://github.com/nektos/act) closes that gap by running the workflow against your local Docker daemon so you can iterate without push-and-pray.

**Install:** `brew install act` (macOS) or `bash <(curl -fsSL https://raw.githubusercontent.com/nektos/act/master/install.sh)` (Linux). Requires a running container engine — Docker Desktop, Colima, or podman. `pnpm act:list` is the smoke test: if it enumerates the jobs in `.github/workflows/`, you're set up.

**`.actrc`** at the repo root pins `ubuntu-latest` to `catthehacker/ubuntu:act-latest` (Ubuntu 24.04-based, matching real `ubuntu-latest`). The default `act` image is intentionally minimal and silently breaks Node/pnpm setups, so don't remove this. Container architecture is deliberately **not** pinned — `act` defaults to the host arch (arm64 on Apple Silicon), which is fast and matches GHA's _results_ for this codebase even though GHA runners are amd64.

**Capability matrix** for this repo's workflows (the build-once split in A-326/328 is validated by static lint — actionlint/yamllint/shellcheck/bats green; the rows below describe the expected `act` behaviour and await a Docker-up `act` re-run):

| Workflow / Job                          | Under `act` | Notes                                                                                                                                                                                                                          |
| --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml` → `lint` / `build-test`        | ⚠️ partial  | Reusable-workflow callers need cross-repo fetch; `act` may not resolve `acme-skunkworks/shared-workflows@<sha>` without extra setup. Local validation: `pnpm lint:workflows` + push to GHA.                                    |
| `ci.yml` → `changelog-completeness`     | ✅ full     | On a `feat`/`fix`/breaking title with no `changelog/` entry it fails by design. PR-title lint is in `validate-pr-title.yml`.                                                                                                   |
| `pkg-release.yml` → `release`           | ⚠️ partial  | Thin caller into `reusable-pkg-release.yml`. Fails at OIDC/provenance steps without a real `ACTIONS_ID_TOKEN_REQUEST_URL` — documented gap. The `npm-release` environment's branch policy is server-side, so `act` ignores it. |
| `claude-code-review.yml` / `claude.yml` | ⏭️ skip     | Need `CLAUDE_CODE_OAUTH_TOKEN`. The `act:*` scripts use `-W` to scope to specific workflows, so these aren't loaded by default.                                                                                                |

**Commands:**

```bash
pnpm act:list           # smoke test — enumerate every job in .github/workflows/
pnpm act:ci             # run ci.yml as a PR event, using .github/act-events/pull_request.json
pnpm act:release:dry    # run pkg-release.yml — stops at OIDC-bound publish steps without a real issuer
```

The PR event fixture lives at `.github/act-events/pull_request.json` and sets `pull_request.head.ref` / `pull_request.base.ref` / `pull_request.title` so the `📓 Changelog completeness` gate (which diffs against `origin/${{ github.base_ref }}` and reads the PR title) resolves real values instead of `origin/`. PR-title lint runs in `validate-pr-title.yml`.

**Apple Silicon caveat:** arm64 default is fast (native, no emulation) and gives accurate results for this codebase — none of the workflow tooling has arch-specific behaviour. To strictly mirror real `ubuntu-latest` (amd64) for one-off parity debugging, append `--container-architecture linux/amd64` to the command. Expect 3–5× slowdown via Rosetta/QEMU and a multi-minute first-run image pull.

**Post-push triage** (when CI does run remotely, after `/send-it`): `pnpm ci:list` shows recent runs, `pnpm ci:watch` streams the latest one, `pnpm ci:view` opens a specific run. All three require `gh auth login` first.

**Pre-push gate:** `.husky/pre-push` runs `pnpm lint:workflows` (actionlint) and `pnpm lint:yaml` (yamllint) on every push as a last-line safety net for cases where pre-commit was bypassed. Both are sub-second on this repo. If either tool isn't installed locally the hook prints an install hint and skips — CI is the enforced gate. To bypass entirely in an emergency: `git push --no-verify`. A-1023 also runs a best-effort `commitlint --from origin/main --to HEAD` range check, skipping with an install hint when `@commitlint/cli` or `origin/main` is missing; CI’s reusable commit-validation workflow remains authoritative. Configuration is `commitlint.config.mjs`, extending `@acme-skunkworks/commitlint-config`.

## `infrastructure/`

`act` validates workflow _wiring_ — that the YAML resolves, steps fire in order, env propagates. It says nothing about whether the logic _inside_ a `run:` block is correct. `infrastructure/` is the home for that logic: shell + TS extracted from workflow `run:` blocks, runnable and unit-tested in isolation. The full conventions document is `infrastructure/README.md`; the high-level rules:

- **Per-script language.** Shell + bats for CLI orchestration (`git`, `gh`, `jq`, `curl`, `pip`). TypeScript + vitest for parsing, branching, anything touching octokit. If a shell script grows past ~20 lines with conditionals, port to TS.
- **Inputs via env, not argv.** Workflows pass values through `env:`; tests mock by passing an env object. No shell quoting drama; clean test seam.
- **Pure functions exported for tests.** Each TS script exports the pure logic; `main()` wires it to real subprocesses. Tests inject a fake runner that records argv.
- **Idempotent.** Re-running with the same inputs is safe. The CI cache-hit branch of `ensure-yamllint.sh` / `ensure-actionlint.sh` / `ensure-bats.sh` is exactly this scenario.
- **Pinned versions in env defaults**, e.g. `ACTIONLINT_VERSION="${ACTIONLINT_VERSION:-1.7.5}"`. The workflow's cache-key still hard-codes the version separately — match them when bumping.

Today's scripts:

| File                           | Replaces                   | Tests                                                                                                                 |
| ------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `scripts/ensure-yamllint.sh`   | `ci.yml` yamllint step     | `tests/ensure-yamllint.bats` (install / already-installed branches)                                                   |
| `scripts/ensure-actionlint.sh` | `ci.yml` actionlint step   | `tests/ensure-actionlint.bats` (cache-hit / cache-miss branches)                                                      |
| `scripts/ensure-bats.sh`       | `ci.yml` bats install step | `tests/ensure-bats.bats` (cache hit/miss, version override, off-PATH cache, substring guard, GITHUB_PATH propagation) |

Changelog validate / completeness / enrich / finalise are provided by
`@acme-skunkworks/changelog-core` (`pnpm validate:changelog`,
`pnpm exec changelog-core check-completeness`). Post-merge write-back is the
`changelog-enrich` job in `pkg-release.yml` calling
`reusable-changelog-enrich.yml` (A-796 / A-821).

CI: the shared `reusable-build-test.yml` caller runs vitest, shellcheck, and bats against this directory. Locally, `pnpm lint:sh` / `pnpm test:sh` skip with install hints if `shellcheck` / `bats` aren't on PATH — `pnpm test` (vitest) always runs because vitest is a node devDep.

When adding workflow-extracted tooling, write the test first, then wire from YAML as a one-liner: `run: pnpm tsx infrastructure/scripts/<name>.ts` or `run: bash infrastructure/scripts/<name>.sh`. (The bespoke `/send-it` slash command and its `infrastructure/send-it/` helpers were superseded by the shared `send-it` agent skill — see [Agent skills](#agent-skills); its bump logic now lives in the bundle's `derive-bump.mjs`.)

## Architecture

The package is a flat-config preset composer. Source is TypeScript; consumers import the compiled `dist/index.js`.

**`index.ts`** — the public surface. Defines the named-export presets (`base`, `typescript`, `frameworkRouting`, `testing`) and re-exports the opt-in ones (`astro`, `complexity`, `e2e`, `sanity`, `storybook`, `tableComponents`). Also exports a deprecated default config that bundles the v6.x composition for back-compat during migration.

**`rules/*.ts`** — individual presets, each a `Linter.Config` (or array thereof). Pure data; no logic.

**`eslint.config.ts`** — the package's own self-lint config. Composes a smaller subset of the same presets.

### Two non-obvious things to know before editing

1. **The `import-x` alias hack in `index.ts`.** `eslint-config-canonical` references its rules under the `import` plugin name, but the actual package is `eslint-plugin-import-x`. We register the same plugin under both names so canonical's rules resolve and modern `import-x/*` rules also work. Don't remove this without verifying canonical no longer needs it. Context: protomolecule issue #259.

2. **Composition order matters in `index.ts` and consumers' configs.** `reactRouterExceptions` MUST come after `preferences` (which `base` includes) so its `func-style` override wins. `frameworkRouting` is exported as `[frameworkRoutingRule, reactRouterExceptions]` and consumers must spread it **after** `...base`. Re-ordering will silently break the React Router 7 typed-export pattern. Context: protomolecule issues #299, #333.

### Preset roles (high level)

- `base` — plugin alias + global ignores + `eslint-config-canonical/auto` + `packageJson` + `commonjs` + `preferences`. The "almost always want this" stack.
- `typescript` — `**/*.{ts,tsx}` overrides (disables a couple of `react/*` rules redundant under TS).
- `frameworkRouting` — turns off `canonical/filename-match-exported` for `routes/`, `app/`, `pages/`, etc.; re-allows arrow functions on `root.tsx` / `*.route.tsx`.
- `testing` — relaxes strict TS rules and `import/no-extraneous-dependencies` for test files.
- Opt-in (not in the default composition): `astro`, `sanity`, `storybook`, `complexity` (raises cyclomatic threshold for `**/scripts/**`), `e2e` (Playwright `test.extend` false-positive workaround), `tableComponents` (TanStack Table cell-renderer false positive).

## Dated changelog (`changelog/`)

The `changelog/` directory is the **only** changelog in the repo — there is no root `CHANGELOG.md` (release-please runs with `skip-changelog`, A-371). It keeps **one dated Markdown file per shippable change** — a browsable, per-change, machine-readable record (the pattern is borrowed from the `octavo` repo, adapted for a single semver'd npm package: a `version` field is added, `affected_packages` dropped). `pkg-release.yml` (via `reusable-pkg-release.yml`) sources its GitHub-release notes from these entries. Full schema and lifecycle in **`changelog/README.md`**.

Two-stage lifecycle — post-merge enrichment runs in-repo via
`reusable-changelog-enrich.yml` on every push to `main` (A-796 / A-821); the
orchestrator's inline finalise is retired later (A-801).

1. **PR-time** — `/send-it` writes `changelog/<YYYYMMDD-HHMMSS>-<slug>.md` with the PR-time fields (and empty enrichment placeholders), **gated on shippability** (only for shippable changes — the same changes that get a release-triggering `feat`/`fix`/breaking PR title), so every entry maps to a version bump. CI's changelog-completeness gate re-enforces this coupling. The entry merges to `main` with its feature PR and sits with placeholders until post-merge enrich / release finalise.
2. **Post-merge / release** — `pkg-release.yml`'s `changelog-enrich` job (`mode: finalise`) resolves the just-merged PR, fills `merged_at`/`commit`/`pr`/`stats` via `changelog-core enrich`, and stamps `version` via `changelog-core finalise` only when `package.json`'s version has no matching git tag (release-please cut). Write-back pushes only `changelog/**` as `road-runner-bot[bot]` (ADR 0004).

`validate:changelog` (`pnpm exec changelog-core validate`) enforces the schema (CI: the shared `reusable-lint.yml` caller). Required frontmatter is relaxed to `title`/`created_at`/`category`/`breaking` so backfilled historical entries and in-flight entries both pass.

## Release workflow

There are two release modes — know which one you're in.

### Day-to-day releases (CI via OIDC)

Once the package exists on npm AND its Trusted Publisher is configured against this repo's `pkg-release.yml` (and `npm-release` environment), every release flows through CI:

1. Make changes on a feature branch; `/send-it` bundles, writes the dated `changelog/<slug>.md` entry (for shippable changes), sets a **Conventional Commits PR title** (the squash subject release-please reads — `feat`/`fix`/`feat!` for shippable, a non-release type otherwise), pushes, opens a PR. CI (`ci.yml` + `validate-pr-title.yml`) runs shared lint/build-test callers, the conventional-PR-title lint, the changelog-completeness gate, and the `GO/NO GO` aggregator.
2. After merge, the private **release-orchestrator** (road-runner-bot, runs a 15-min cron) mints a short-lived repo-scoped App token, runs `release-please release-pr` (which infers the bump from the merged PR titles and writes `package.json` + `.release-please-manifest.json`), pushes the `release-please--branches--main` branch, and opens the "`chore(main): release <version>`" release PR. On a later tick it squash-merges that PR once `GO/NO GO` is green.
3. The orchestrator's App-token merge pushes to `main`, re-firing `pkg-release.yml`: the `release` job publishes via shared-workflows; the sibling `changelog-enrich` job (`mode: finalise`) fills post-merge changelog metadata and stamps `version` on the release cut (A-796).

**`pkg-release.yml` is publish-only (A-320).** It does **not** create the release PR — versioning lives in the orchestrator where the App key stays private (A-312). Publish logic is centralised in shared-workflows (A-384); this repo no longer ships local `publish-*.sh` wrappers.

**Cross-boundary hardening (A-326).** npm Trusted Publishing binds its OIDC subject to repository + **caller workflow filename** (`pkg-release.yml`, A-543) + environment — not the reusable callee. Three layers close the trust boundary:

- **No `workflow_dispatch`.** The only trigger is `push: [main]`; re-run a failed release via "Re-run jobs" on the original push run.
- **Branch-restricted `npm-release` environment** on the reusable publish jobs. Configured in repo settings: `gh api -X PUT repos/acme-skunkworks/eslint-config/environments/npm-release` with `deployment_branch_policy.custom_branch_policies=true`, then a single `main` branch policy.
- **Version-vs-tag gate** inside `reusable-pkg-release.yml`: a feature-merge (version unchanged) is a clean no-op; a release-PR merge publishes.

**Build once, publish the exact artifact (A-328).** Implemented in `reusable-pkg-release.yml` — build-time code runs only in an unprivileged job; both publish legs ship one byte-identical tarball with attestation (`gh attestation verify <tarball>`).

Don't reintroduce `NPM_TOKEN` **as a CI secret** unless OIDC is verified broken. The local `.env`-based `NPM_TOKEN` is for laptop-driven publishes only, never CI.

**Choosing the bump.** The bump is inferred by release-please from the **Conventional Commits PR title** (the squash subject). The conventional-PR-title lint (`validate-pr-title.yml`) + the changelog-completeness gate in `ci.yml` keep the title honest.

### Manual publish (break-glass — CI-down only, after the package exists)

> **This is break-glass, not a routine path (A-331).** Reach for it only when CI/OIDC is genuinely down — every normal release goes through `pkg-release.yml` (OIDC, no standing token). The `.env` `NPM_TOKEN` is a long-lived credential, so treat it accordingly:
>
> - **Store it in a secrets manager**, retrieved just-in-time into the shell — not committed to a plaintext `.env` that lingers on disk (`.env` is gitignored, but a secrets manager is the stronger control).
> - **Shortest viable lifetime + a documented rotation cadence**; rotate immediately if a laptop is lost or the token is exposed.
> - It never touches CI (CLAUDE.md forbids `NPM_TOKEN` as a CI secret), and manual publishes are distinguishable from CI ones (no provenance badge), so a manual release can't masquerade as a verified CI one. The only way this token leaks is full local-machine compromise.

For when CI is down. Auth setup (one-time, or after rotating your token):

```bash
NPM_TOKEN=$(grep '^NPM_TOKEN=' .env | cut -d'=' -f2-)
npm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"
npm whoami    # verify
```

The token must be a **Granular Access Token with the "Bypass 2FA" option enabled at creation time**. Without that flag, every publish hits `EOTP` and you're stuck. Tokens are immutable after creation — if you forgot the flag, revoke and regenerate.

Then publish:

```bash
pnpm run release:manual:dry    # simulate — verifies tarball + auth
pnpm run release:manual        # actual publish
```

`--provenance=false` is intentional — provenance attestation requires a GitHub Actions OIDC issuer, which a laptop doesn't have. Manual publishes ship without the provenance badge; CI publishes get it.

Don't try `pnpm run release:manual -- --dry-run`. The chained-script + `--` separator confuses npm into treating `--dry-run` as a positional package spec. Use `release:manual:dry`.

## Bootstrap publish — read this when setting up a new package

The very first publish of a brand-new npm package **cannot go through CI**. Two reasons that compound:

- npm (unlike PyPI) has no pending-Trusted-Publisher flow. The package must exist on the registry before the Trusted Publisher form is reachable at `npmjs.com/package/<name>/access`.
- npm enforces interactive 2FA at the publish endpoint for the first publish of a new package, irrespective of account/org/token bypass settings — Granular bypass-2FA tokens only honour the bypass on _subsequent_ publishes. So a non-interactive CI token can't clear it; the first publish has to be done by a human at a terminal with a browser.

So bootstrap is always: manual first publish → configure Trusted Publisher → CI takes over from publish #2.

**Pre-flight:**

- You belong to the target npm org with publish rights.
- npm CLI ≥ 11.5.1 (`npm install -g npm@latest`). A recent npm (11.12.1 verified) does the browser 2FA flow below; older npm or a non-interactive host falls back to the recovery-code path.
- An **interactive browser** is available and npm is on its default `auth-type=web` (don't override it to `legacy`).
- Account has 2FA enabled, with a **passkey registered** (preferred — it completes first-publish 2FA in the browser). **Recovery codes generated and saved** as a fallback.
- `package.json` is at the version you want to ship. For a brand-new package this is the initial `1.0.0` (or `0.1.0`) you set by hand; release-please takes over bumping from publish #2 once the manifest is seeded.

**Sequence:**

1. Set `package.json` (and `.release-please-manifest.json`) to the version you want to ship — for a fresh package, edit it directly; no changeset/release-please run is needed for the very first publish.
2. `pnpm run release:manual:dry` — verify tarball + auth. **Note:** dry-run does NOT trigger 2FA enforcement, so a successful dry-run does not predict a successful real publish. It only proves the tarball is valid and your token authenticates.
3. `pnpm run release:manual` (or `npm publish --access public --provenance=false`) — **the primary path.** On a recent npm with `auth-type=web`, this **opens a browser and prompts for a passkey/WebAuthn approval** (Touch ID / Face ID / security key). Approve it and the brand-new package publishes cleanly — **no `--otp` needed.** (Verified 2026-06-01 with npm 11.12.1 publishing a fresh `1.0.0`.)
4. **Recovery-code fallback** — only when the browser flow isn't available: a headless / CI-less host, no passkey registered on the account, or an npm too old for web auth. There the publish fails with `EOTP`; re-run passing a **recovery code as the `--otp` value**:

   ```bash
   npm publish --access public --provenance=false --otp=<recovery-code>
   ```

   Generate codes at npmjs.com → Profile → Two-Factor Authentication → Manage Recovery Codes. Each is single-use. The format is a long hex string (not a 6-digit TOTP) — npm accepts it as `--otp` anyway. After the publish succeeds, **immediately regenerate recovery codes**: the one you used is burnt, and if you transmitted it anywhere (chat, paste buffer with cloud sync, screen share), treat the rest of the set as compromised. (This path is moot when the passkey browser flow worked — no OTP was ever entered.)

5. Configure Trusted Publisher: `https://www.npmjs.com/package/<name>/access` → GitHub Actions → org, repo, workflow filename (`pkg-release.yml`), environment `npm-release`.
6. From here on, releases go through CI cleanly.

### Things that look like solutions but aren't

Saving these to spare the next bootstrap from rediscovering them:

- Toggling "Require 2FA for write actions" off in account settings.
- Disabling org-level 2FA enforcement.
- Generating a Granular token with bypass-2FA enabled — works for publish #2+, NOT publish #1.
- `oathtool` for generating TOTP — only works if you have a TOTP secret, and **npm has phased TOTP out of new accounts** (passkeys / security keys + recovery codes are what's offered now).
- Disabling 2FA entirely — npm's policy _requires_ either 2FA or a bypass-2FA token; you can't disable both. And the bypass token doesn't help for publish #1 anyway.

**Things that _used_ to be dead ends but now work.** Earlier copies of this runbook listed `npm publish --auth-type=web` / `npm login --auth-type=web` as ignored-by-publish and claimed recovery codes were the only OTP-shaped value an npm account with a passkey could produce. That was true when this repo shipped its own `1.0.0` (likely no passkey then, and/or an older npm), but it's stale on current npm: `auth-type=web` is the default, and it's exactly what triggers the browser passkey/WebAuthn approval that clears first-publish 2FA. The **passkey browser flow is now the primary answer**; recovery codes are the fallback for when that flow isn't available (see the sequence above).

## Editing rules

Rule files under `rules/` are pure config objects exported by name. When changing one:

- Inline comments referencing `protomolecule/issues/<n>` document the rationale for non-obvious choices — preserve them; the issues stay readable on GitHub even though the source repo is gone.
- The lint cache lives at `./.eslintcache` — wipe it if a config change isn't picked up.
- Build before testing locally against a consumer (`pnpm run build`); consumers resolve `dist/index.js`, not `index.ts`.
- Relative imports inside `index.ts` and `rules/*.ts` use explicit `.js` extensions (e.g. `./rules/astro.js`) so the compiled ESM output resolves cleanly in consumer projects. Keep this pattern when adding files.
