# @acme-skunkworks/eslint-config

## 1.0.4

### Patch Changes

- c98ca37: Correct the package description and keywords to reflect React/Sanity/Storybook support, and switch the Sanity preset's documentation comments to British English.

## 1.0.3

### Patch Changes

- 6d38237: Add inline per-rule documentation with upstream doc links in `rules/*.ts` for maintainers and consumers tracing our ESLint overrides.

## 1.0.2

### Patch Changes

- daa0db1: Move `/send-it` derive-changeset helper to `infrastructure/send-it/` (contributor tooling only; published preset unchanged).

## 1.0.1

### Patch Changes

- 6ab1285: Ship `eslint-import-resolver-typescript` and `prettier-plugin-tailwindcss` as runtime `dependencies`. Both are referenced statically by the default `preferences` preset, so consumers were crashing at lint time with `Cannot find module` when the package was installed without dev dependencies.
- 6ea6514: Add local git hooks (husky + lint-staged) covering pre-commit auto-fix (prettier, eslint on TS and `package.json`, sort-package-json, markdownlint), a `Co-Authored-By: Claude` commit-message trailer strip, and a direct-push-to-`main` block. Each pre-commit task is now scoped to staged files only. Also adds `sort-package-json` as an explicit devDep so the hook works offline, and ignores `CHANGELOG.md` in prettier so the hook doesn't ping-pong against markdownlint. Tooling only — no runtime change for consumers.
- 6b156de: Add `actionlint` and `yamllint` validation for `.github/workflows/*.{yml,yaml}` and YAML across the repo. Wired into both the pre-commit hook (best-effort: skips with a `brew install …` hint when the tool isn't on `PATH`; semantic errors block commits, warnings don't) and a new parallel `yaml-lint` CI job (always enforced; both tools cached, pinned to `actionlint v1.7.5` and `yamllint 1.37.1`). Adds `lint:yaml` and `lint:workflows` scripts plus `.yamllint.yml` at the repo root. Tooling only — no runtime change for consumers.
- 49ad365: Bump `globals` to 17.6.0.
- 20e3ec2: Skip the `CI / 🔬 Build & Lint` and `Claude Code Review` workflows on `changeset-release/*` PRs (the auto-generated "release: version packages" PR). Both jobs add no value on a generated version bump and were burning CI minutes plus Claude credits. CI tooling only — no runtime change for consumers.
- 8cdfcb3: Add "when to use" JSDoc headers to every rule preset (`rules/*.ts`) and inline JSDoc to every opt-in re-export in `index.ts`. Each preset now opens with a one-line statement of whether it's always-on (part of `base`) or opt-in, and — for opt-in presets — the trigger condition (Sanity / Astro / Storybook / Playwright / TanStack Table / `scripts/**`). Existing inline rule rationale and `protomolecule/issues/<n>` references are preserved. Comments only — no runtime change for consumers — but the JSDoc rides through to `dist/**/*.d.ts`, so consumer IDE hover tooltips on imports like `{ sanity }` will now show the guidance.

## 1.0.0

### Major Changes

- 921266d: Initial release of `@acme-skunkworks/eslint-config`. Extracts the package from `RobEasthope/protomolecule` (last published as `@robeasthope/eslint-config@6.2.1`) into this standalone repo and ships everything that has to land before publishing from here:
  - **Renamed** to `@acme-skunkworks/eslint-config`. Consumers must update their dependency name and import path. See the README's "Migrating from `@robeasthope/eslint-config`" section.
  - **Folded in Tempest's deltas.** New opt-in named-export presets `complexity`, `e2e`, and `tableComponents` (generalised file globs); `preferences` allow-list and `testFiles` rule additions. See `MIGRATION_FROM_PROTOMOLECULE.md` for the full per-preset diff.
  - **Bumped every plugin to current** — `eslint-config-canonical` ^47, `eslint-plugin-jsdoc` ^62, `eslint-plugin-regexp` ^3, `eslint-plugin-unicorn` ^64, `globals` ^17, plus dev tooling.
  - **Restructured to named-export composition.** Each preset (`base`, `typescript`, `frameworkRouting`, `astro`, `sanity`, `testing`, `storybook`, `complexity`, `e2e`, `tableComponents`) is independently importable. The default export is preserved as a back-compat alias for the v6.x composition but is **deprecated**.
  - **Added `prettier ^3.0.0` as a `peerDependency`** to make explicit the contract that `eslint-plugin-prettier` (a regular dep) needs prettier installed in the consumer.
  - **Fixed ESLint v10 ESM resolver compatibility.** Source TS imports now use explicit `.js` extensions; the dist works under ESLint v10's stricter resolver.
  - **Stood up the publishing pipeline.** CI on PRs (build/lint/changeset status); release workflow on `main` using `changesets/action` to either open a Version Packages PR or publish on merge — npm via Trusted Publishing/OIDC + GitHub Packages via `GITHUB_TOKEN`. Provenance attestation on every npm publish.

  Requires Node 22+ and ESLint v9+ (flat config).
