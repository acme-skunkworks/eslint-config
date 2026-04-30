# Repo notes

This is the standalone home for `@acme-skunkworks/eslint-config` (extracted from `RobEasthope/protomolecule` — see `MIGRATION_FROM_PROTOMOLECULE.md`). Single ESLint flat-config package, published from this repo via Changesets.

## Layout

- `index.ts` — composes the default flat-config array. After the named-export refactor, also re-exports each preset as a named export.
- `rules/*.ts` — individual presets (astro, commonjs, frameworkRouting, ignoredFileAndFolders, packageJson, preferences, reactRouterExceptions, sanity, storybook, testFiles, typescriptOverrides, etc).
- `eslint.config.ts` — the package's own self-lint config.
- `.changeset/` — pending releases.
- `.github/workflows/` — CI on PRs (`ci.yml`); release on push to `main` (`release.yml`).
- `scripts/send-it/` — supports the `/send-it` Claude slash command at `.claude/commands/send-it.md`.

## Common workflows

**Adding a release-worthy change.** Make the code change on a feature branch, then run `/send-it` — it bundles uncommitted work, writes a `.changeset/<slug>.md` with the right bump level, pushes, and opens a PR. CI runs build + lint + `pnpm changeset status` on the PR.

**Cutting a release.** `changesets/action` watches `main`. When changesets accumulate it opens a "release: version packages" PR; merging that PR triggers the workflow's publish step (npm via Trusted Publishing + GitHub Packages via `GITHUB_TOKEN`). Provenance is on by default via `publishConfig`.

**Manual changeset.** `pnpm changeset` (interactive) or hand-write `.changeset/<slug>.md` with `---\n"@acme-skunkworks/eslint-config": <patch|minor|major>\n---\n\n<body>`.

## Trusted Publishing

npm publishing uses OIDC Trusted Publishing — no `NPM_TOKEN` secret. Configured on npmjs.com against this repo's `release.yml`. Don't reintroduce `NPM_TOKEN` unless OIDC is verified broken.

## Node version

`.nvmrc` pins Node 22. CI uses `actions/setup-node` with `node-version-file: .nvmrc`. `engines.node: ">=22"` enforces locally via `engine-strict=true` in `.npmrc`.
