---
"@acme-skunkworks/eslint-config": major
---

v7.0.0 — major release. Extracts the package from `RobEasthope/protomolecule` (last published as `@robeasthope/eslint-config@6.2.1`) into this standalone repo and ships everything that has to land before publishing from here:

- **Renamed** to `@acme-skunkworks/eslint-config`. Consumers must update their dependency name and import path. See the README's "Migrating from `@robeasthope/eslint-config`" section.
- **Folded in Tempest's deltas.** New opt-in named-export presets `complexity`, `e2e`, and `tableComponents` (generalised file globs); `preferences` allow-list and `testFiles` rule additions. See `MIGRATION_FROM_PROTOMOLECULE.md` for the full per-preset diff.
- **Bumped every plugin to current** — `eslint-config-canonical` ^47, `eslint-plugin-jsdoc` ^62, `eslint-plugin-regexp` ^3, `eslint-plugin-unicorn` ^64, `globals` ^17, plus dev tooling.
- **Restructured to named-export composition.** Each preset (`base`, `typescript`, `frameworkRouting`, `astro`, `sanity`, `testing`, `storybook`, `complexity`, `e2e`, `tableComponents`) is independently importable. The default export is preserved as a back-compat alias for the v6.x composition but is **deprecated**.
- **Added `prettier ^3.0.0` as a `peerDependency`** to make explicit the contract that `eslint-plugin-prettier` (a regular dep) needs prettier installed in the consumer.
- **Fixed ESLint v10 ESM resolver compatibility.** Source TS imports now use explicit `.js` extensions; the dist works under ESLint v10's stricter resolver.
- **Stood up the publishing pipeline.** CI on PRs (build/lint/changeset status); release workflow on `main` using `changesets/action` to either open a Version Packages PR or publish on merge — npm via Trusted Publishing/OIDC + GitHub Packages via `GITHUB_TOKEN`. Provenance attestation on every npm publish.

Requires Node 22+ and ESLint v9+ (flat config).
