# @acme-skunkworks/eslint-config

> A shared ESLint v9 flat-config **preset composer** for TypeScript and React projects — import named-export presets and compose only the ones you need.

[![npm version](https://img.shields.io/npm/v/@acme-skunkworks/eslint-config?logo=npm)](https://www.npmjs.com/package/@acme-skunkworks/eslint-config)
[![Provenance: built and signed on GitHub Actions](https://img.shields.io/badge/provenance-built%20%26%20signed%20on%20GitHub%20Actions-2ea44f?logo=github)](https://www.npmjs.com/package/@acme-skunkworks/eslint-config#provenance)
[![License: MIT](https://img.shields.io/npm/l/@acme-skunkworks/eslint-config)](LICENSE)
[![Node engine](https://img.shields.io/node/v/@acme-skunkworks/eslint-config?logo=node.js)](https://www.npmjs.com/package/@acme-skunkworks/eslint-config)

Every release is published to npm via OIDC Trusted Publishing with a **provenance attestation** — the artefact is built and signed on GitHub Actions, so consumers can verify exactly which commit and workflow produced it.

## Install

```bash
pnpm add -D @acme-skunkworks/eslint-config eslint prettier
```

`eslint` (`^8.57.0 || ^9.0.0`) and `prettier` (`^3.0.0`) are **required peer dependencies** — install them alongside. Every ESLint plugin the config uses ships as a regular dependency, so you don't install plugins separately. Node 22+ is required.

> **ESLint v8 users:** flat config isn't the default in v8 — set `ESLINT_USE_FLAT_CONFIG=1` so ESLint reads your `eslint.config.js`. ESLint v9 uses flat config by default, so no flag is needed.

## Quick start

The package exposes each preset as a named export. Compose them in your `eslint.config.js`:

```js
import {
  base,
  typescript,
  frameworkRouting,
} from "@acme-skunkworks/eslint-config";

export default [
  ...base,
  typescript,
  ...frameworkRouting,
  // your overrides last so they win
  { rules: { "@typescript-eslint/no-explicit-any": "warn" } },
];
```

Pull in only the presets your project needs. Array presets are spread with `...`; single-config presets are added as-is — the table below notes which is which.

## Presets

**Core** — the everyday stack:

| Preset             | Shape         | What it covers                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`             | array (`...`) | Plugin-alias hack, global ignores, the canonical baseline, `package.json` lint config, CommonJS file overrides, and the `preferences` block (top-level type imports, `func-style: declaration`, Prettier integration, import resolver, `no-console` warn). The "you almost always want this" stack. |
| `typescript`       | single        | Overrides for `**/*.{ts,tsx}` — disables `react/no-unused-prop-types` and `react/prop-types`, which are redundant under TypeScript.                                                                                                                                                                 |
| `frameworkRouting` | array (`...`) | Turns off `canonical/filename-match-exported` for routing dirs — `routes/**`, `app/**`, `pages/**` (Next.js), `src/routes/**` (SvelteKit), `src/pages/**` (Astro) — and re-allows arrow functions on `root.tsx` / `*.route.tsx`. Spread **after** `base` (see Gotchas).                             |
| `testing`          | single        | Relaxes strict TypeScript rules and `import/no-extraneous-dependencies` for `**/*.{test,spec}.*`, `__tests__/**`, and setup files.                                                                                                                                                                  |

**Opt-in** — pull in per project:

| Preset            | Shape         | What it covers                                                                                                      |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| `astro`           | array (`...`) | `eslint-plugin-astro/flat/recommended` plus Astro-specific overrides.                                               |
| `sanity`          | array (`...`) | Schema property ordering for `*.schema.ts` and structure-file exceptions, for Sanity Studio projects.               |
| `storybook`       | single        | Overrides for `**/*.stories.{ts,tsx}`.                                                                              |
| `complexity`      | array (`...`) | Raises the cyclomatic-complexity threshold to 40 for `**/scripts/**`, where orchestration scripts run linearly.     |
| `e2e`             | single        | Disables `react-hooks/rules-of-hooks` for `**/e2e/**` — Playwright `test.extend` callbacks are false positives.     |
| `tableComponents` | single        | Disables `react/no-unstable-nested-components` for `**/*Table.tsx` — TanStack Table / Refine column-cell renderers. |

> A deprecated **default export** still bundles the v6.x composition for back-compat during migration. New code should use the named exports above. See the [migration guide](MIGRATION_FROM_PROTOMOLECULE.md).

## Gotchas

Two ordering rules are easy to get wrong and fail **silently** — the config still loads, but the intended override never wins:

- **Spread `frameworkRouting` _after_ `...base`.** Its `func-style` override must come later in the array than the `preferences` block (which `base` includes), or `base` wins and the React Router 7 typed-export pattern breaks.
- **`frameworkRouting` is an ordered pair of configs** for the same reason — its second element (the React Router exceptions) must stay after its first, which in turn must follow `preferences`. If you ever expand the spread into individual elements, preserve their order.

Full rationale (and the protomolecule issues behind it) is in [`CLAUDE.md`](CLAUDE.md).

## Links

- [Changelog](CHANGELOG.md)
- [Migration guide](MIGRATION_FROM_PROTOMOLECULE.md) — moving from `@robeasthope/eslint-config`
- [Repository](https://github.com/acme-skunkworks/eslint-config)
- [Licence](LICENSE) — MIT
