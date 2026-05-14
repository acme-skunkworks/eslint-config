# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo

Standalone home for `@acme-skunkworks/eslint-config` (extracted from `RobEasthope/protomolecule` — see `MIGRATION_FROM_PROTOMOLECULE.md`). Single ESLint v9 flat-config package, written in TypeScript, compiled to `dist/`, published from this repo via Changesets.

## Commands

```bash
pnpm install        # install deps
pnpm run build      # tsc → dist/ (the published artifact; consumers import from dist)
pnpm tsc            # type-check only (no emit)
pnpm lint           # lint this package's own source (index.ts + rules/**)
pnpm lint:fix       # auto-fix
pnpm lint:md        # markdownlint
pnpm lint:yaml      # yamllint . (semantic YAML check; warnings non-blocking)
pnpm lint:workflows # actionlint on .github/workflows/
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

## Validating workflows and YAML

Two non-Node tools augment Prettier's formatting pass with the semantic checks Prettier can't see (Actions schema, `${{ … }}` expression typos, duplicate keys, etc.):

- **`actionlint` v1.7.5** — Go binary. Local install: `brew install actionlint` (macOS) or `bash <(curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/v1.7.5/scripts/download-actionlint.bash)` elsewhere. CI downloads the official tarball and caches it.
- **`yamllint` 1.37.1** — Python tool. Local install: `brew install yamllint` (macOS) or `pip install --user yamllint==1.37.1` elsewhere. CI installs via pip and caches `~/.local`.

Configuration: `.yamllint.yml` at the repo root extends defaults, demotes line-length / indentation to warnings (Prettier owns formatting), allows the GitHub Actions truthy values (`on`, `off`, `yes`, `no`), and ignores `node_modules/`, `dist/`, `.turbo/`, `pnpm-lock.yaml`. No `.actionlintrc.yaml` — defaults are fine for this repo.

Enforcement: pre-commit is best-effort (skip with install hint when missing); CI is the `yaml-lint` job in `ci.yml`, parallel to `build-and-lint`, always enforced.

## Validating workflows locally with `act`

`actionlint` and `yamllint` catch schema and expression-level mistakes. They say nothing about whether a workflow actually _works_ end-to-end — Node/pnpm setup ordering, env propagation, conditional skips, step interdependencies. [`act`](https://github.com/nektos/act) closes that gap by running the workflow against your local Docker daemon so you can iterate without push-and-pray.

**Install:** `brew install act` (macOS) or `bash <(curl -fsSL https://raw.githubusercontent.com/nektos/act/master/install.sh)` (Linux). Requires a running container engine — Docker Desktop, Colima, or podman. `pnpm act:list` is the smoke test: if it enumerates the jobs in `.github/workflows/`, you're set up.

**`.actrc`** at the repo root pins `ubuntu-latest` to `catthehacker/ubuntu:act-latest` (Ubuntu 24.04-based, matching real `ubuntu-latest`). The default `act` image is intentionally minimal and silently breaks Node/pnpm setups, so don't remove this. Container architecture is deliberately **not** pinned — `act` defaults to the host arch (arm64 on Apple Silicon), which is fast and matches GHA's _results_ for this codebase even though GHA runners are amd64.

**Capability matrix** for this repo's workflows (validated by running `act` on this branch):

| Workflow / Job                          | Under `act` | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml` → `build-and-lint`             | ✅ full     | Checkout → pnpm → Node 22 → install → build → lint all green. The `📝 Changeset status` step inside this job is `continue-on-error: true` and will "fail" locally whenever the working branch has changes vs `main` but no changeset yet — that's expected pre-`/send-it` noise.                                                                                                                                                                                                                                   |
| `ci.yml` → `yaml-lint`                  | ✅ full     | yamllint pip install + actionlint curl-bash both work inside the container. **Required two workflow tweaks** to be portable to `act`'s catthehacker image: `pip install --user --break-system-packages` (Ubuntu 24.04 / Python 3.12 enforces PEP 668; flag is a no-op on real GHA) and `export PATH="$HOME/.local/bin:$PATH"` within the same step (catthehacker runs as root, so `~/.local/bin` isn't pre-added to PATH like it is on the real runner).                                                           |
| `release.yml` → `release`               | ⚠️ partial  | Checkout → pnpm → Node → `pnpm add -g npm@latest` → install → build all succeed. Fails at `🚀 Version or Publish (npm)` inside `pnpm changeset publish` with `EUSAGE: Provenance generation in GitHub Actions requires "write" access to the "id-token" permission` — npm refuses because `publishConfig.provenance: true` needs a real `ACTIONS_ID_TOKEN_REQUEST_URL` and there isn't one locally. This is the documented gap. The `pnpm add -g npm@latest` step, contrary to early worry, runs cleanly on arm64. |
| `claude-code-review.yml` / `claude.yml` | ⏭️ skip     | Need `CLAUDE_CODE_OAUTH_TOKEN`. The `act:*` scripts use `-W` to scope to specific workflows, so these aren't loaded by default.                                                                                                                                                                                                                                                                                                                                                                                    |

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

## Release workflow

There are two release modes — know which one you're in.

### Day-to-day releases (CI via OIDC)

Once the package exists on npm AND its Trusted Publisher is configured against this repo's `release.yml`, every release flows through CI:

1. Make changes on a feature branch; `/send-it` bundles, writes `.changeset/<slug>.md`, pushes, opens a PR. CI (`.github/workflows/ci.yml`) runs build/lint/changeset-status on the PR.
2. After merge, `changesets/action` (`.github/workflows/release.yml`) opens a "release: version packages" PR.
3. Merging that PR triggers publish: npm via OIDC Trusted Publishing (no token, no OTP) + GitHub Packages via `GITHUB_TOKEN` + provenance attestation on the npm artifact.

Don't reintroduce `NPM_TOKEN` **as a CI secret** unless OIDC is verified broken. The local `.env`-based `NPM_TOKEN` is a different concern — it's for laptop-driven publishes only, never CI.

**Manual changeset.** `pnpm changeset` (interactive) or hand-write `.changeset/<slug>.md`:

```markdown
---
"@acme-skunkworks/eslint-config": <patch|minor|major>
---

<body>
```

### Manual publish (CI fallback, after the package exists)

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
- npm enforces 2FA at the publish endpoint for the first publish of a new package, irrespective of account/org/token bypass settings. Granular bypass-2FA tokens only honour the bypass on subsequent publishes.

So bootstrap is always: manual first publish → configure Trusted Publisher → CI takes over from publish #2.

**Pre-flight:**

- You belong to the target npm org with publish rights.
- npm CLI ≥ 11.5.1 (`npm install -g npm@latest`).
- Account has 2FA enabled with **recovery codes generated and saved** (you'll need one).
- `package.json` is at the version you want to ship (`pnpm changeset version` consumes pending changesets and bumps).

**Sequence:**

1. `pnpm changeset version` — consume pending changesets, bump `package.json`, write `CHANGELOG.md`.
2. `pnpm run release:manual:dry` — verify tarball + auth. **Note:** dry-run does NOT trigger 2FA enforcement, so a successful dry-run does not predict a successful real publish. It only proves the tarball is valid and your token authenticates.
3. `pnpm run release:manual` — first real attempt. **This will fail with `EOTP`.** That's expected.
4. Use a **recovery code as the `--otp` value**:

   ```bash
   npm publish --access public --provenance=false --otp=<recovery-code>
   ```

   Generate codes at npmjs.com → Profile → Two-Factor Authentication → Manage Recovery Codes. Each is single-use. The format is a long hex string (not a 6-digit TOTP) — npm accepts it as `--otp` anyway.

5. After publish succeeds, **immediately regenerate recovery codes**. The one you used is burnt; if you transmitted it anywhere (chat, paste buffer with cloud sync, screen share), treat the rest of the set as compromised.
6. Configure Trusted Publisher: `https://www.npmjs.com/package/<name>/access` → GitHub Actions → org, repo, workflow filename (`release.yml`), environment blank.
7. From here on, releases go through CI cleanly.

### Things that look like solutions but aren't

Saving these to spare the next bootstrap from rediscovering them:

- `npm publish --auth-type=web` — flag is for `npm login`, ignored by `publish`.
- Toggling "Require 2FA for write actions" off in account settings.
- Disabling org-level 2FA enforcement.
- Generating a Granular token with bypass-2FA enabled — works for publish #2+, NOT publish #1.
- `npm login --auth-type=web` to refresh the session token. Auth swaps successfully but the publish endpoint still demands OTP.
- `oathtool` for generating TOTP — only works if you have a TOTP secret, and **npm has phased TOTP out of new accounts** (only passkeys + recovery codes are offered now).
- Disabling 2FA entirely — npm's policy _requires_ either 2FA or a bypass-2FA token; you can't disable both. And the bypass token doesn't help for publish #1 anyway.

Recovery codes are the answer because they're the only OTP-shaped value an npm account can produce when its only 2FA factor is a passkey.

## Editing rules

Rule files under `rules/` are pure config objects exported by name. When changing one:

- Inline comments referencing `protomolecule/issues/<n>` document the rationale for non-obvious choices — preserve them; the issues stay readable on GitHub even though the source repo is gone.
- The lint cache lives at `./.eslintcache` — wipe it if a config change isn't picked up.
- Build before testing locally against a consumer (`pnpm run build`); consumers resolve `dist/index.js`, not `index.ts`.
- Relative imports inside `index.ts` and `rules/*.ts` use explicit `.js` extensions (e.g. `./rules/astro.js`) so the compiled ESM output resolves cleanly in consumer projects. Keep this pattern when adding files.
