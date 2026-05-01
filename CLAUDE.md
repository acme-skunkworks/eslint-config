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
pnpm format         # prettier write
pnpm changeset      # interactive changeset (or write .changeset/<slug>.md by hand)
```

Node 22 required (`.nvmrc`, `engines.node: ">=22"`, `engine-strict=true` in `.npmrc`).

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

**Adding a release-worthy change.** Make the change on a feature branch, then run `/send-it` — bundles uncommitted work, writes a `.changeset/<slug>.md` with the right bump level, pushes, opens a PR. CI (`.github/workflows/ci.yml`) runs build + lint + `pnpm changeset status` on the PR.

**Cutting a release.** `changesets/action` watches `main` (`.github/workflows/release.yml`). Accumulated changesets → opens a "release: version packages" PR; merging it triggers the publish step:
- npm via OIDC Trusted Publishing (no `NPM_TOKEN` secret, configured on npmjs.com against this repo's `release.yml`).
- GitHub Packages via `GITHUB_TOKEN`.
- Provenance is on by default via `publishConfig.provenance: true`.

Don't reintroduce `NPM_TOKEN` **as a CI secret** unless OIDC is verified broken. The local-only `NPM_TOKEN` documented in `.env.example` is a different concern — it's for human-driven manual publishes from a laptop and never enters CI.

**Manual publish (backup).** Used for the one-time bootstrap publish (npm has no pending-publisher flow, so the package must exist before Trusted Publisher can be configured) and as a fallback when CI is down. Two auth options:

- `npm login` once (browser flow); `npm publish` prompts for an OTP from your authenticator. No token to manage. Recommended.
- Or copy `.env.example` → `.env`, fill in `NPM_TOKEN` (Granular Access Token from npmjs.com → Settings → Tokens), then either `source .env` before publishing or write the token to `~/.npmrc`.

Then run:

```bash
pnpm run release:manual:dry    # builds + simulates publish (verify tarball + auth)
pnpm run release:manual        # builds + actually publishes
```

`--provenance=false` is intentional — provenance attestation requires an OIDC issuer (GitHub Actions), which a laptop doesn't have. Manual publishes ship without the provenance badge; CI publishes have it.

Note: don't try `pnpm run release:manual -- --dry-run`. The chained-script + `--` separator confuses npm into treating `--dry-run` as a positional package spec. Use the dedicated `release:manual:dry` script instead.

**Manual changeset.** `pnpm changeset` (interactive) or hand-write `.changeset/<slug>.md`:

```markdown
---
"@acme-skunkworks/eslint-config": <patch|minor|major>
---

<body>
```

## Editing rules

Rule files under `rules/` are pure config objects exported by name. When changing one:

- Inline comments referencing `protomolecule/issues/<n>` document the rationale for non-obvious choices — preserve them; the issues stay readable on GitHub even though the source repo is gone.
- The lint cache lives at `./.eslintcache` — wipe it if a config change isn't picked up.
- Build before testing locally against a consumer (`pnpm run build`); consumers resolve `dist/index.js`, not `index.ts`.
- Relative imports inside `index.ts` and `rules/*.ts` use explicit `.js` extensions (e.g. `./rules/astro.js`) so the compiled ESM output resolves cleanly in consumer projects. Keep this pattern when adding files.
