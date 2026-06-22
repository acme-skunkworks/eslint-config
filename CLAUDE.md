# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo

Standalone home for `@acme-skunkworks/eslint-config` (extracted from `RobEasthope/protomolecule` — see `MIGRATION_FROM_PROTOMOLECULE.md`). Single ESLint v9 flat-config package, written in TypeScript, compiled to `dist/`, published from this repo via Changesets.

## British English

Write all prose in British English — code comments, documentation, commit messages, PR titles/bodies, and any user-facing strings.

- **Spelling:** use British forms — _colour_, _behaviour_, _organisation_, _centre_, _catalogue_, _recognise_, _analyse_.
- **Grammar/punctuation:** follow British conventions where they differ — single quotes for quoting where appropriate, full stops outside the closing quotation mark when the quoted phrase is partial, _whilst_/_amongst_ acceptable.
- **Scope vs. identifiers:** this applies to prose only. Do **not** apply it to identifiers or APIs that mirror upstream names (e.g. `color` props in CSS, third-party API field names) — those stay spelled as the upstream defines them.
- **Exception:** don't rewrite quoted upstream text, dependency names, or any API surface that already uses US spelling.

## GitHub Actions repo config (ASW-176)

Non-secret knobs shared by `ci.yml` and `release.yml` live in **`infrastructure/repo-config.yaml`**, loaded at runtime by the composite `.github/actions/load-repo-config` (`uses: ./.github/actions/load-repo-config`).

| Key                         | Purpose                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `defaultBranch`             | Canonical default branch; keep in sync with static `on:` triggers (GitHub cannot derive `on.push.branches` from this file). |
| `nodeVersionFile`           | Passed to `actions/setup-node` `node-version-file`.                                                                         |
| `npmRegistryUrl`            | Public npm registry (`setup-node` when talking to npmjs).                                                                   |
| `npmScope`                  | Package scope; must equal the owning GitHub org so `setup-node` scopes `.npmrc` for the GitHub Packages leg (ASW-323).      |
| `githubPackagesRegistryUrl` | GitHub Packages npm registry (`https://npm.pkg.github.com`) — the secondary publish target (ASW-323).                       |

Secrets (`GITHUB_TOKEN`), OIDC Trusted Publishing, and Changesets behaviour are unchanged — not in this file.

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
pnpm changeset      # interactive changeset (or write .changeset/<slug>.md by hand)
```

Node 22 required (`.nvmrc`, `engines.node: ">=22"`, `engine-strict=true` in `.npmrc`).

## Local hooks

`pnpm install` runs `prepare` (`husky`), which installs the hooks under `.husky/`. Three hooks fire:

- **`pre-commit`** — runs `pnpm lint-staged`. Auto-fixes only the staged files: `prettier --write` for everything, `eslint --fix` for `**/*.{ts,tsx,js,mjs,cjs}`, `sort-package-json` + `eslint --fix` for `**/package.json` (the `packageJson` preset's glob applies, plus any `jsonc/*` rules from canonical), `markdownlint-cli2 --fix` for `**/*.{md,mdx}`, `yamllint` (read-only check) for `**/*.{yml,yaml}`, `actionlint` (read-only check) for `.github/workflows/*.{yml,yaml}`. Each task is wrapped in `bash -c '… "$@" --` so the staged file paths are passed through. The auto-fixers carry an `|| true` fallback so they never block — CI is the gate. The two YAML linters intentionally do **not** carry the `|| true` fallback: semantic errors block the commit (warnings don't). yamllint and actionlint are best-effort: if the tool isn't on `PATH` locally, the hook prints a platform-appropriate `brew install …` (or `pip` / `curl`) hint and skips. CI still enforces.
- **`commit-msg`** — strips any `Co-Authored-By: Claude … <noreply@anthropic.com>` trailer. Backstops the global `~/.claude/CLAUDE.md` rule (Claude is tooling, not a contributor).
- **`pre-push`** — blocks direct pushes to `main`; humans should use `/send-it` to open a PR. Bot users (`github-actions[bot]`, `road-runner-bot[bot]`) and the changesets release commit (`release: version packages`) bypass.

Hooks are dormant in CI: `release.yml` and `ci.yml` set `HUSKY=0` so the `prepare` script no-ops during `pnpm install`.

To bypass any hook in an emergency: `git commit --no-verify` or `git push --no-verify` — not recommended.

## Markdown lint

`markdownlint-cli2` reads `.markdownlint-cli2.jsonc`, which extends `@acme-skunkworks/markdownlint-config`. Pre-commit auto-fixes staged `**/*.{md,mdx}` via lint-staged (`|| true`, so it never blocks). **CI enforces:** the `build-and-lint` job in `ci.yml` runs `pnpm lint:md` after ESLint.

## Validating workflows and YAML

Two non-Node tools augment Prettier's formatting pass with the semantic checks Prettier can't see (Actions schema, `${{ … }}` expression typos, duplicate keys, etc.):

- **`actionlint` v1.7.5** — Go binary. Local install: `brew install actionlint` (macOS) or `bash <(curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/v1.7.5/scripts/download-actionlint.bash)` elsewhere. CI downloads the official tarball and caches it.
- **`yamllint` 1.37.1** — Python tool. Local install: `brew install yamllint` (macOS) or `pip install --user yamllint==1.37.1` elsewhere. CI installs via pip and caches `~/.local`.

**Digest-pinned bootstraps (ASW-327).** The CI install scripts for these tools fetch-and-execute third-party code, so each is pinned by digest, not just a mutable tag:

- `ensure-actionlint.sh` fetches `download-actionlint.bash` from the **immutable commit SHA** of the v1.7.5 tag (not the `v1.7.5` tag), passes the version explicitly so it installs that exact release, then independently re-verifies the extracted binary against a pinned sha256 (enforced on the CI arch, linux/amd64).
- `ensure-bats.sh` verifies the downloaded release tarball against a pinned sha256 before extraction.
- `ensure-yamllint.sh` installs via `pip install --require-hashes -r infrastructure/requirements-yamllint.txt`, so pip refuses any artefact — yamllint or a transitive dep — whose digest isn't listed. Regenerate that file when bumping (see its header). The `yaml-lint` cache key in `ci.yml` is keyed on its hash.

When bumping any of these, update the version **and** the matching digest/requirements together. These scripts run only in read-scoped CI jobs (`yaml-lint`, `infra`) — they must never be added to the `release`/`publish-github-packages` jobs, which is what keeps a compromised upstream away from the publish identity.

Configuration: `.yamllint.yml` at the repo root extends defaults, demotes line-length / indentation to warnings (Prettier owns formatting), allows the GitHub Actions truthy values (`on`, `off`, `yes`, `no`), and ignores `node_modules/`, `dist/`, `.turbo/`, `pnpm-lock.yaml`. No `.actionlintrc.yaml` — defaults are fine for this repo.

Enforcement: pre-commit is best-effort (skip with install hint when missing); CI is the `yaml-lint` job in `ci.yml`, parallel to `build-and-lint`, always enforced. The install-and-run logic for both tools lives in `infrastructure/scripts/ensure-yamllint.sh` and `ensure-actionlint.sh`; the workflow calls those as one-liners (see `infrastructure/README.md`). Cache steps (`actions/cache@v4`) stay inline in `ci.yml` because caching is a workflow concern.

## Validating workflows locally with `act`

`actionlint` and `yamllint` catch schema and expression-level mistakes. They say nothing about whether a workflow actually _works_ end-to-end — Node/pnpm setup ordering, env propagation, conditional skips, step interdependencies. [`act`](https://github.com/nektos/act) closes that gap by running the workflow against your local Docker daemon so you can iterate without push-and-pray.

**Install:** `brew install act` (macOS) or `bash <(curl -fsSL https://raw.githubusercontent.com/nektos/act/master/install.sh)` (Linux). Requires a running container engine — Docker Desktop, Colima, or podman. `pnpm act:list` is the smoke test: if it enumerates the jobs in `.github/workflows/`, you're set up.

**`.actrc`** at the repo root pins `ubuntu-latest` to `catthehacker/ubuntu:act-latest` (Ubuntu 24.04-based, matching real `ubuntu-latest`). The default `act` image is intentionally minimal and silently breaks Node/pnpm setups, so don't remove this. Container architecture is deliberately **not** pinned — `act` defaults to the host arch (arm64 on Apple Silicon), which is fast and matches GHA's _results_ for this codebase even though GHA runners are amd64.

**Capability matrix** for this repo's workflows (the build-once split in ASW-326/328 is validated by static lint — actionlint/yamllint/shellcheck/bats green; the rows below describe the expected `act` behaviour and await a Docker-up `act` re-run):

| Workflow / Job                            | Under `act` | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml` → `build-and-lint`               | ✅ full     | Checkout → pnpm → Node 22 → install → build → lint all green. The `📝 Changeset status` step inside this job is `continue-on-error: true` and will "fail" locally whenever the working branch has changes vs `main` but no changeset yet — that's expected pre-`/send-it` noise.                                                                                                                                                                                                                                              |
| `ci.yml` → `yaml-lint`                    | ✅ full     | yamllint pip install + actionlint curl-bash both work inside the container. **Required two workflow tweaks** to be portable to `act`'s catthehacker image: `pip install --user --break-system-packages` (Ubuntu 24.04 / Python 3.12 enforces PEP 668; flag is a no-op on real GHA) and `export PATH="$HOME/.local/bin:$PATH"` within the same step (catthehacker runs as root, so `~/.local/bin` isn't pre-added to PATH like it is on the real runner).                                                                      |
| `release.yml` → `build`                   | ✅ full     | Checkout → pnpm → Node → install → build → `npm pack` → upload-artifact. Unprivileged (`contents: read`); no OIDC/publish surface, so it completes end-to-end under `act` (ASW-328).                                                                                                                                                                                                                                                                                                                                          |
| `release.yml` → `release`                 | ⚠️ partial  | Needs `build`; `pnpm add -g npm@11.14.1` → detect changesets → download-artifact succeed. Fails at `🚀 Publish (npm)` inside `infrastructure/scripts/publish-via-raw-npm.sh` with `EUSAGE: Provenance generation in GitHub Actions requires "write" access to the "id-token" permission` — `--provenance` needs a real `ACTIONS_ID_TOKEN_REQUEST_URL` and there isn't one locally. Documented gap. No longer builds from source (ASW-328). The `npm-release` environment's branch policy is server-side, so `act` ignores it. |
| `release.yml` → `publish-github-packages` | ⚠️ partial  | Needs `release`; Node (GH Packages) → download-artifact succeed (no build — publishes the prebuilt tarball, ASW-328). Fails at `🔏 Attest build provenance` / publish: `actions/attest-build-provenance` needs a real OIDC issuer (`ACTIONS_ID_TOKEN_REQUEST_URL`) and the publish needs a real `GITHUB_TOKEN` against `npm.pkg.github.com` — neither exists locally. Same documented gap: confirm the job is _parsed and reached_, not that it publishes.                                                                    |
| `claude-code-review.yml` / `claude.yml`   | ⏭️ skip     | Need `CLAUDE_CODE_OAUTH_TOKEN`. The `act:*` scripts use `-W` to scope to specific workflows, so these aren't loaded by default.                                                                                                                                                                                                                                                                                                                                                                                               |

**Commands:**

```bash
pnpm act:list           # smoke test — enumerate every job in .github/workflows/
pnpm act:ci             # run ci.yml as a PR event, using .github/act-events/pull_request.json
pnpm act:release:dry    # run release.yml — runs everything up to the npm publish, then stops at the OIDC-bound provenance check
```

The PR event fixture lives at `.github/act-events/pull_request.json` and sets `pull_request.head.ref` / `pull_request.base.ref` so `pnpm changeset status --since=origin/${{ github.base_ref }}` in `ci.yml` resolves to a real ref instead of `origin/`.

**Apple Silicon caveat:** arm64 default is fast (native, no emulation) and gives accurate results for this codebase — none of the workflow tooling has arch-specific behaviour. To strictly mirror real `ubuntu-latest` (amd64) for one-off parity debugging, append `--container-architecture linux/amd64` to the command. Expect 3–5× slowdown via Rosetta/QEMU and a multi-minute first-run image pull.

**Post-push triage** (when CI does run remotely, after `/send-it`): `pnpm ci:list` shows recent runs, `pnpm ci:watch` streams the latest one, `pnpm ci:view` opens a specific run. All three require `gh auth login` first.

**Pre-push gate:** `.husky/pre-push` runs `pnpm lint:workflows` (actionlint) and `pnpm lint:yaml` (yamllint) on every push as a last-line safety net for cases where pre-commit was bypassed. Both are sub-second on this repo. If either tool isn't installed locally the hook prints an install hint and skips — CI is the enforced gate. To bypass entirely in an emergency: `git push --no-verify`.

## `infrastructure/`

`act` validates workflow _wiring_ — that the YAML resolves, steps fire in order, env propagates. It says nothing about whether the logic _inside_ a `run:` block is correct. `infrastructure/` is the home for that logic: shell + TS extracted from workflow `run:` blocks, runnable and unit-tested in isolation. The full conventions document is `infrastructure/README.md`; the high-level rules:

- **Per-script language.** Shell + bats for CLI orchestration (`git`, `gh`, `jq`, `curl`, `pip`). TypeScript + vitest for parsing, branching, anything touching octokit. If a shell script grows past ~20 lines with conditionals, port to TS.
- **Inputs via env, not argv.** Workflows pass values through `env:`; tests mock by passing an env object. No shell quoting drama; clean test seam.
- **Pure functions exported for tests.** Each TS script exports the pure logic; `main()` wires it to real subprocesses. Tests inject a fake runner that records argv.
- **Idempotent.** Re-running with the same inputs is safe. The CI cache-hit branch of `ensure-yamllint.sh` / `ensure-actionlint.sh` / `ensure-bats.sh` is exactly this scenario.
- **Pinned versions in env defaults**, e.g. `ACTIONLINT_VERSION="${ACTIONLINT_VERSION:-1.7.5}"`. The workflow's cache-key still hard-codes the version separately — match them when bumping.

Today's scripts:

| File                                 | Replaces                                  | Tests                                                                                                                 |
| ------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `scripts/ensure-yamllint.sh`         | `ci.yml` yamllint step                    | `tests/ensure-yamllint.bats` (install / already-installed branches)                                                   |
| `scripts/ensure-actionlint.sh`       | `ci.yml` actionlint step                  | `tests/ensure-actionlint.bats` (cache-hit / cache-miss branches)                                                      |
| `scripts/ensure-bats.sh`             | `ci.yml` bats install step                | `tests/ensure-bats.bats` (cache hit/miss, version override, off-PATH cache, substring guard, GITHUB_PATH propagation) |
| `send-it/derive-changeset.ts`        | (used by `/send-it`)                      | `tests/derive-changeset.test.ts` (vitest — slug, bump, body)                                                          |
| `scripts/validate-changelog.ts`      | `ci.yml` infra job `validate:changelog`   | `tests/validate-changelog.test.ts` (vitest — schema accept/reject cases)                                              |
| `scripts/finalise-changelog.ts`      | `release.yml` `changeset:version` command | `tests/finalise-changelog.test.ts` (vitest — finalise + gh/git resolver via fake runner)                              |
| `scripts/enrich-changelog.ts`        | (pure lib used by finalise)               | `tests/enrich-changelog.test.ts` (vitest — fill-once, stats overwrite, idempotency)                                   |
| `scripts/add-links-changelog.ts`     | (pure lib used by finalise)               | `tests/add-links-changelog.test.ts` (vitest — masking code/links, ASW/AKW IDs)                                        |
| `scripts/stamp-changelog-version.ts` | (pure lib used by finalise)               | `tests/stamp-changelog-version.test.ts` (vitest — stamp-once, absent-field)                                           |

CI: the `infra` job in `ci.yml` runs `pnpm lint:sh`, `pnpm test`, `pnpm test:sh`, and `pnpm validate:changelog` against this directory. Locally, `pnpm lint:sh` / `pnpm test:sh` skip with install hints if `shellcheck` / `bats` aren't on PATH — `pnpm test` (vitest) always runs because vitest is a node devDep.

> The changelog scripts use `gray-matter` (a devDependency) and the validator is a long flat list of schema checks, so `eslint.config.ts` scopes a `devDependencies: true` + `complexity: off` override to `infrastructure/**`.

When adding workflow-extracted tooling, write the test first, then wire from YAML as a one-liner: `run: pnpm tsx infrastructure/scripts/<name>.ts` or `run: bash infrastructure/scripts/<name>.sh`. Slash-command-only helpers under `infrastructure/send-it/` are invoked from `.claude/commands/send-it.md` instead.

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

Alongside the Changesets-generated root `CHANGELOG.md`, the repo keeps **one dated Markdown file per shippable change** under `changelog/` — a browsable, per-change, machine-readable record (the pattern is borrowed from the `octavo` repo, adapted for a single semver'd npm package: a `version` field is added, `affected_packages` dropped). Full schema and lifecycle in **`changelog/README.md`**.

Two-stage lifecycle — finalisation rides inside the Changesets version PR (ASW-317), which the private release-orchestrator creates (ASW-320).

1. **PR-time** — `/send-it` Step 5b writes `changelog/<YYYYMMDD-HHMMSS>-<slug>.md` with the PR-time fields (and empty enrichment placeholders), **gated identically to the changeset** (only for shippable changes per Step 5.4), so every entry maps to a version bump. The entry merges to `main` with its feature PR and sits with placeholders until release.
2. **Release (in the version PR)** — the **orchestrator** runs `pnpm run changeset:version` (= `changeset version` then `finalise-changelog.ts`) when it builds the version PR. For every entry without a `version`, finalise resolves its merged PR from the `branch` field via `gh` (filling `merged_at`/`commit`/`pr`/`merge_strategy`/`stats`), stamps the just-bumped `version`, and rewrites Linear IDs to links. The orchestrator commits those changelog edits **into the version PR** (pushed with its App token) — so they merge and publish through the normal flow. Idempotent and re-run-safe (it always starts from the placeholder entries on `main`).

`validate:changelog` enforces the schema (CI: the `infra` job). Required frontmatter is relaxed to `title`/`created_at`/`category`/`breaking` so backfilled historical entries (no branch/author/stats) and in-flight entries (no version/stats yet) both pass.

`finalise-changelog.ts` is the only CLI; `enrich-changelog.ts`, `add-links-changelog.ts`, and `stamp-changelog-version.ts` are pure library modules it composes.

## Release workflow

> **Planned change (accepted, not yet implemented):** [ADR 0002](docs/adr/0002-changesets-to-conventional-commits.md) / [SK-371](https://linear.app/acme-skunkworks/issue/SK-371) — versioning is moving from Changesets to Conventional Commits ([release-please](https://github.com/googleapis/release-please)), strand A only (bump mechanism swaps; topology + security unchanged). The flow described below is still the **live** Changesets-based one until SK-371 lands; this section will be rewritten then.

There are two release modes — know which one you're in.

### Day-to-day releases (CI via OIDC)

Once the package exists on npm AND its Trusted Publisher is configured against this repo's `release.yml`, every release flows through CI:

1. Make changes on a feature branch; `/send-it` bundles, writes `.changeset/<slug>.md`, pushes, opens a PR. CI (`.github/workflows/ci.yml`) runs build/lint/changeset-status on the PR.
2. After merge, the private **release-orchestrator** (road-runner-bot, runs a 15-min cron) detects the pending changeset, mints a short-lived repo-scoped App token, runs `pnpm changeset:version`, pushes `changeset-release/main`, and opens the "`<pkg>@<version>`" version PR. On a later tick it squash-merges that PR once `🔬 Build & Lint` is green.
3. The orchestrator's App-token merge pushes to `main`, re-firing `release.yml`. An unprivileged `build` job builds + `npm pack`s the tarball once and uploads it as an artifact; the `release` job sees **no pending changesets**, downloads that exact tarball, and publishes it to npm via OIDC Trusted Publishing (no token, no OTP) + provenance attestation, plus git tags + a GitHub release. A third `publish-github-packages` job downloads the **same** tarball and mirrors it to GitHub Packages with a GitHub-native build-provenance attestation (ASW-323).

**`release.yml` is publish-only (ASW-320).** It does **not** create the version PR — that path needs an identity that isn't `github-actions[bot]` (the "Allow GitHub Actions to create and approve pull requests" toggle is deliberately off, ASW-313), so versioning lives in the orchestrator where the App key stays private (ASW-312). A `🔎 Detect pending changesets` step gates the publish on `has == 'false'`: a feature-merge (changesets pending) is a clean green no-op; a version-PR merge (none pending) publishes. The bot's private key never touches this public repo's CI.

**Cross-boundary hardening (ASW-326).** npm Trusted Publishing binds its OIDC subject to repository + workflow filename only — not the trigger event, ref, or actor — so anything able to run `release.yml` against an arbitrary ref could mint a valid publish credential. Three layers close that:

- **No `workflow_dispatch`.** The only trigger is `push: [main]`; re-run a failed release via "Re-run jobs" on the original push run.
- **Branch-restricted `npm-release` environment** on both privileged jobs (`release` and `publish-github-packages`). It permits deployments **only from `refs/heads/main`** (deployment-branch policy), so a non-main ref is rejected before the OIDC token is mintable. **No required reviewers** — releases stay hands-off; this is a structural ref gate, not a manual approval. The environment is configured in repo settings (not in YAML): `gh api -X PUT repos/acme-skunkworks/eslint-config/environments/npm-release` with `deployment_branch_policy.custom_branch_policies=true`, then a single `main` branch policy.
- **Explicit ref guard** (`github.event_name == 'push' && github.ref == 'refs/heads/main' && …`) on every publish/tag step and the GitHub Packages job `if:`. Redundant with the environment now, but kept as the porting template's in-workflow structural defence.

**Build once, publish the exact artifact (ASW-328).** Build-time code (`pnpm install` + `tsc` + `npm pack`) runs **only** in the unprivileged `build` job (`contents: read`, no `id-token`/`packages`/`contents: write`). Both publish legs download and ship that one tarball, so a compromised build-time dependency never runs alongside a mintable publish credential, and the npm tarball, the GitHub Packages tarball, and the attested digest are guaranteed byte-identical.

**The publish step uses a wrapper script, not `pnpm changeset publish`.** `changesets/action`'s `publish:` input invokes `bash infrastructure/scripts/publish-via-raw-npm.sh`, which calls `$PNPM_HOME/npm publish "$TARBALL" --access public --provenance` directly on the prebuilt tarball (ASW-328). Two reasons (both diagnosed in ASW-174):

- `actions/setup-node` runs after `pnpm/action-setup` and prepends its tool-cache bin to PATH, so plain `npm` resolves to whatever npm Node 22 ships (10.9.8 as of Node 22.22.3, re-verified 2026-05-15). npm Trusted Publishing requires npm 11.5.1+. The upgrade-npm step works around this by `pnpm add -g npm@11.14.1` (pinned, not `@latest`, for CI reproducibility — bump in lockstep with ASW-165's re-verification) and appending `$PNPM_HOME` to `$GITHUB_PATH` so subsequent steps see the upgraded npm at the front of PATH.
- Even with PATH correct, `pnpm changeset publish` itself fails — pnpm's own publish HTTP/OIDC implementation inside `@changesets/cli` doesn't satisfy what npm Trusted Publishing expects (the symptom is a generic 404 instead of npm 11.x's TP-aware error). The wrapper sidesteps this by calling npm directly. The wrapper is also idempotent: if `npm view name@version` succeeds, it exits 0 instead of re-publishing (which would 409).

In `release.yml`, `changesets/action` runs **only when there are no pending changesets** — i.e. solely to publish (npm + git tags + GitHub release). It no longer takes a `version:`/`commit:`/`title:` input; the orchestrator owns versioning and the version PR.

**GitHub Packages — secondary target (ASW-323).** npmjs.org (OIDC + provenance) is the canonical public source; GitHub Packages is published alongside it as a secondary mirror. It was dropped in ASW-320 (token auth, no provenance) and reinstated in ASW-323 with the security gaps closed:

- **Separate `publish-github-packages` job**, gated `needs: release` + `if: needs.release.outputs.has_pending_changesets == 'false'` (same no-pending-changesets condition as the npm publish, reused via a job output) **plus the same main-only ref guard + `npm-release` environment** (ASW-326). `packages: write` is scoped to this job only — never to the `release` job that holds `id-token: write` for npm OIDC.
- **Auth is the ephemeral per-job `GITHUB_TOKEN`** — the most secure option GitHub Packages offers (no OIDC Trusted-Publisher flow exists for it; no standing secret).
- **Provenance via GitHub-native attestation.** `npm publish --provenance` is npmjs.org-only (it uploads to npm's registry attestation API), so the job instead runs `actions/attest-build-provenance` over the exact tarball it publishes. The shared `build` job `npm pack`s once (ASW-328); this job **downloads** that artifact, attests the `.tgz`, then `publish-to-github-packages.sh` publishes the same file — so the attested digest matches both the npm tarball and what consumers download (`gh attestation verify <tarball> --repo acme-skunkworks/eslint-config`).
- **`publish-to-github-packages.sh`** is idempotent (skips on `npm view` hit, distinguishes 404 from real errors) and reads inputs from env (`NODE_AUTH_TOKEN`, `GITHUB_PACKAGES_REGISTRY_URL`, `TARBALL`). It **hard-codes the publish target to `https://npm.pkg.github.com` and aborts if `GITHUB_PACKAGES_REGISTRY_URL` drifts from it** (ASW-330) — the ephemeral `GITHUB_TOKEN` is a bearer credential, so the host must never be redirectable by a config edit. The ASW-307 `published=false` quirk is irrelevant here: this job gates on `has_pending_changesets`, never on changesets' `published` output.

> **Watch-item:** the npm leg's git tag + GitHub release are created explicitly in the `release` job (the raw-npm wrapper makes `changesets/action` report `published=false`, so `createGithubReleases` never fires — see the `🏷️ Tag + GitHub release` step). Confirm that step still runs on each release.

Don't reintroduce `NPM_TOKEN` **as a CI secret** unless OIDC is verified broken. The local `.env`-based `NPM_TOKEN` is a different concern — it's for laptop-driven publishes only, never CI.

**Manual changeset.** `pnpm changeset` (interactive) or hand-write `.changeset/<slug>.md`:

```markdown
---
"@acme-skunkworks/eslint-config": <patch|minor|major>
---

<body>
```

### Manual publish (break-glass — CI-down only, after the package exists)

> **This is break-glass, not a routine path (ASW-331).** Reach for it only when CI/OIDC is genuinely down — every normal release goes through `release.yml` (OIDC, no standing token). The `.env` `NPM_TOKEN` is a long-lived credential, so treat it accordingly:
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
- `package.json` is at the version you want to ship (`pnpm changeset version` consumes pending changesets and bumps).

**Sequence:**

1. `pnpm changeset version` — consume pending changesets, bump `package.json`, write `CHANGELOG.md`.
2. `pnpm run release:manual:dry` — verify tarball + auth. **Note:** dry-run does NOT trigger 2FA enforcement, so a successful dry-run does not predict a successful real publish. It only proves the tarball is valid and your token authenticates.
3. `pnpm run release:manual` (or `npm publish --access public --provenance=false`) — **the primary path.** On a recent npm with `auth-type=web`, this **opens a browser and prompts for a passkey/WebAuthn approval** (Touch ID / Face ID / security key). Approve it and the brand-new package publishes cleanly — **no `--otp` needed.** (Verified 2026-06-01 with npm 11.12.1 publishing a fresh `1.0.0`.)
4. **Recovery-code fallback** — only when the browser flow isn't available: a headless / CI-less host, no passkey registered on the account, or an npm too old for web auth. There the publish fails with `EOTP`; re-run passing a **recovery code as the `--otp` value**:

   ```bash
   npm publish --access public --provenance=false --otp=<recovery-code>
   ```

   Generate codes at npmjs.com → Profile → Two-Factor Authentication → Manage Recovery Codes. Each is single-use. The format is a long hex string (not a 6-digit TOTP) — npm accepts it as `--otp` anyway. After the publish succeeds, **immediately regenerate recovery codes**: the one you used is burnt, and if you transmitted it anywhere (chat, paste buffer with cloud sync, screen share), treat the rest of the set as compromised. (This path is moot when the passkey browser flow worked — no OTP was ever entered.)

5. Configure Trusted Publisher: `https://www.npmjs.com/package/<name>/access` → GitHub Actions → org, repo, workflow filename (`release.yml`), environment blank.
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
