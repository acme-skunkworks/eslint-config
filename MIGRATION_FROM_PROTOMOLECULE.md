# Migration from protomolecule

This repo is the new home for the ESLint configuration previously shipped from `RobEasthope/protomolecule` as `@robeasthope/eslint-config`. As of the version published from this repo, the package is renamed to `@acme-skunkworks/eslint-config`.

## Source

- **Source repo:** `RobEasthope/protomolecule`
- **Source path:** `packages/eslint-config/`
- **Source SHA:** `26a77851e5df47c9f6db6690f33923bf42a1901b`
- **Last commit touching the source:** `c98f3a0238863f9c4ef6d28b456031ffd7a1de9f` (release: version packages for release, 2025-12-09)
- **Final published version under the old name:** `@robeasthope/eslint-config@6.2.1`
- **Port date:** 2026-04-30

The full pre-port audit lives on Linear issue [ASW-54](https://linear.app/acme-skunkworks/issue/ASW-54).

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

## Tempest fold-in deltas

For context on why we're folding Tempest's deltas in: Tempest's internal `@tempest/eslint-config` (`/Users/rob/Code/tempest/packages/eslint-config`, private — only ships `dist/` in tree) was originally copied from `@robeasthope/eslint-config` and has since diverged. v1.0.0 of `@acme-skunkworks/eslint-config` is the union of the two lineages.

Tempest's source files aren't in tree, so this diff is between Tempest's compiled `dist/rules/*.js` and our ported `rules/*.ts`.

### Plugin version deltas

Tempest is generally newer than protomolecule. v1.0.0's bumps will go to current latest at execution time, so Tempest's pins are a starting point not the ceiling.

| Plugin | protomolecule (ours) | Tempest |
|---|---|---|
| `astro-eslint-parser` | `^1.0.0` | `^1.3.0` |
| `eslint-config-canonical` | `^45.0.1` | `^47.4.2` |
| `eslint-plugin-astro` | `^1.0.0` | `^1.6.0` |
| `eslint-plugin-import-x` | `^4.16.1` | `^4.16.1` |
| `eslint-plugin-jsdoc` | `^60.8.2` | `^62.7.1` |
| `eslint-plugin-jsx-a11y` | `^6.10.2` | `^6.10.2` |
| `eslint-plugin-n` | `^17.23.1` | `^17.24.0` |
| `eslint-plugin-prettier` | `^5.5.4` | `^5.5.5` |
| `eslint-plugin-promise` | `^7.2.1` | `^7.2.1` |
| `eslint-plugin-react` | `^7.37.5` | `^7.37.5` |
| `eslint-plugin-react-hooks` | `^7.0.1` | `^7.0.1` |
| `eslint-plugin-regexp` | `^2.10.0` | `^3.0.0` |
| `eslint-plugin-unicorn` | `^61.0.2` | `^63.0.0` |
| `globals` | `^16.4.0` | `^17.4.0` |
| `typescript-eslint` | `^8.46.0` | `^8.56.1` |

Tempest also adds `prettier: ^3.8.1` as a `peerDependency`. We adopt this — it makes the prettier dependency contract explicit at install time.

### Rule presets — what changed

| Preset | Status | Notes |
|---|---|---|
| `astro` | identical | |
| `commonjs` | identical | |
| `frameworkRouting` | identical | |
| `ignoredFileAndFolders` | identical | |
| `packageJson` | identical | |
| `reactRouterExceptions` | identical | |
| `storybook` | identical | |
| `typescriptOverrides` | identical | |
| `preferences` | **delta** | Tempest's `import/no-extraneous-dependencies.devDependencies` allow-list adds `**/*.setup.{ts,js}`, `**/test-utils.{ts,tsx}`, `**/routes.ts`. Folded in for v1.0.0. |
| `testFiles` | **delta** | Tempest adds `"@typescript-eslint/triple-slash-reference": "off"` to support Vitest setup files using `/// <reference types="..." />` to augment global types. Folded in for v1.0.0. |
| `sanity` | **Tempest dropped** | Tempest doesn't use Sanity, so the preset was removed. We **keep** the preset and make it an opt-in named export — consumers in non-Sanity projects don't import it. |

### New presets in Tempest (ported as opt-in named exports for v1.0.0)

| Preset | What it does | Generalisation applied during fold-in |
|---|---|---|
| `complexity` | Raises cyclomatic-complexity threshold for files where the elevated count is structural rather than smelly. | Drops the Studio-specific `**/duplicates.tsx` glob; keeps the broad `**/scripts/**/*.ts` (40). Consumers add their own per-file overrides. |
| `e2e` | Disables `react-hooks/rules-of-hooks` for Playwright fixture callbacks (false positive). | Keeps `**/e2e/**/*.{ts,tsx}` glob; drops the Tempest-specific `**/fixtures/authenticated*` glob. |
| `tableComponents` (renamed from `studioTables`) | Disables `react/no-unstable-nested-components` for TanStack Table / Refine column-cell renderers. | Drops Studio-specific filenames (`list.tsx`, `duplicates.tsx`, `LookupList.tsx`, `*Table.tsx` is generalised to `**/*Table.tsx` only). Renamed for clarity. |

These three are exported but **not** part of the default flat-config composition — consumers `import { complexity, e2e, tableComponents } from "@acme-skunkworks/eslint-config"` and spread into their own config.

### `index.ts` composition

Tempest's order: `ignoredFileAndFolders → ...canonicalAuto → packageJson → commonjs → storybook → typescriptOverrides → testFiles → ...astro → preferences → reactRouterExceptions → frameworkRouting → studioTables → e2e → ...complexity`.

Ours stays: `ignoredFileAndFolders → ...canonicalAuto → packageJson → commonjs → storybook → typescriptOverrides → testFiles → ...astro → preferences → reactRouterExceptions → frameworkRouting → ...sanity`.

For v1.0.0's default export the composition is `base → typescript → react → frameworkRouting` (per the named-export restructure plan); the rest are opt-in named exports. The Tempest-only presets (complexity, e2e, tableComponents) and `sanity` all become opt-in named exports.

### Conflict resolution

No genuine conflicts surfaced — every Tempest delta is an addition, not a change to an existing rule's options. The one judgment call is the `sanity` preset: Tempest dropped it but we keep it opt-in. Documented above.

### Verification (deferred to ASW-46 Step 8)

After the fold-in lands, lint protomolecule and Tempest checkouts against the new package and confirm the deltas in lint output match the predictions above. Any unexpected differences become follow-up issues.
