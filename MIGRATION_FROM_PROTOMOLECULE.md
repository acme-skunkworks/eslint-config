# Migration from protomolecule

This repo is the new home for the ESLint configuration previously shipped from `RobEasthope/protomolecule` as `@robeasthope/eslint-config`. As of the version published from this repo, the package is renamed to `@acme-skunkworks/eslint-config`.

## Source

- **Source repo:** `RobEasthope/protomolecule`
- **Source path:** `packages/eslint-config/`
- **Source SHA:** `26a77851e5df47c9f6db6690f33923bf42a1901b`
- **Last commit touching the source:** `c98f3a0238863f9c4ef6d28b456031ffd7a1de9f` (release: version packages for release, 2025-12-09)
- **Final published version under the old name:** `@robeasthope/eslint-config@6.2.1`
- **Port date:** 2026-04-30

The full pre-port audit lives on Linear issue [ASW-54](https://linear.app/goose-and-hobbes/issue/ASW-54).

## What changed in the port

The port is a clean copy of the source files with these deliberate edits:

### Package identity

- `name`: `@robeasthope/eslint-config` → `@acme-skunkworks/eslint-config`. On npm this is a brand-new package; consumers must update their dependency. The first release from this repo should be a major bump to signal the rename.
- `repository`, `homepage`, `bugs` URLs: rewritten to point at `acme-skunkworks/eslint-config`. Dropped `repository.directory` since the package is no longer a sub-path of a monorepo.
- `author` is unchanged (still Rob Easthope).

### Build / tooling

- `tsconfig.json` previously extended `@robeasthope/tsconfig/base.json`, which is a `private: true` workspace package and is **not published on npm**. The base config has been **inlined** into `tsconfig.json` rather than depended on. Resulting compiler options are functionally equivalent to the previous setup.
- `devDependencies`: dropped `@robeasthope/tsconfig: workspace:*` (inlined as above). Replaced `@robeasthope/markdownlint-config: workspace:*` with `^1.1.1` (the published npm version) since this package is published.
- Lint scripts: replaced `--cache-location ../../.turbo/.eslintcache-eslint-config` (Turborepo-specific monorepo path) with `--cache-location ./.eslintcache` (local). Added `.turbo/`, `.eslintcache*`, and `*.tsbuildinfo` to `.gitignore`.

### Preserved verbatim

- All 12 rule presets under `rules/` (astro, commonjs, frameworkRouting, ignoredFileAndFolders, packageJson, preferences, reactRouterExceptions, sanity, storybook, testFiles, typescriptOverrides) — copied unchanged.
- `index.ts` composition order, including the deliberate ordering of `reactRouterExceptions` after `preferences` so the `func-style` override wins.
- The `eslint-plugin-import-x` alias hack in `index.ts` — the plugin is still registered under both `import` (for `eslint-config-canonical` back-compat) and `import-x` (the canonical name).
- Inline comments and JSDoc references to `https://github.com/RobEasthope/protomolecule/issues/...` (issues #259, #299, #323, #327, #333, #360, #365). These document the rationale behind non-obvious rule choices and remain accurate as historical context. The protomolecule issues stay readable on GitHub.
- `eslint.config.ts` (the package's own self-lint config) — composes the same imports as `index.ts` does, just a smaller subset.
- `.markdownlint-cli2.jsonc` — still extends `@robeasthope/markdownlint-config` (the npm-published config).
- `.prettierignore` — unchanged.
- `CHANGELOG.md` — copied verbatim so the v6.2.1 history continuity is preserved.
- `README.md` — copied; will be rewritten in a follow-up commit (ASW-56) to reflect the new repo and scope.
- `LICENSE` — copied from `RobEasthope/protomolecule/LICENSE` (MIT, Copyright (c) 2025 Rob Easthope).
