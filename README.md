# @acme-skunkworks/eslint-config

Shared ESLint v9 configuration with TypeScript and React support, composed from named-export presets.

## 📦 Installation

```bash
pnpm add -D @acme-skunkworks/eslint-config eslint prettier
```

Every ESLint plugin used by the config ships as a regular dependency — you don't install plugins separately. `eslint` and `prettier` are peer dependencies.

## 🚀 Usage

The package exports presets as named exports. Compose them in your `eslint.config.js`:

```js
import { base, typescript, frameworkRouting } from "@acme-skunkworks/eslint-config";

export default [
  ...base,
  typescript,
  ...frameworkRouting,
  // your overrides last so they win
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
```

Pull in the presets relevant to your project:

| Export | What it covers |
|---|---|
| `base` | Plugin-alias hack + global ignores + the canonical baseline + packageJson lint config + commonjs file overrides + the big preferences block (top-level type imports, `func-style: declaration`, prettier integration, import resolver, `no-console` warn, etc.). The "you almost always want this" stack. |
| `typescript` | Overrides for `**/*.{ts,tsx}` (disables `react/no-unused-prop-types` and `react/prop-types`). |
| `frameworkRouting` | Disables `canonical/filename-match-exported` for routing dirs (`routes/**`, `app/**`, `pages/**`, `src/routes/**`, `src/pages/**`); re-allows arrow functions on `root.tsx` / `*.route.tsx`. Order matters — must spread **after** `base`. |
| `astro` | `eslint-plugin-astro/flat/recommended` + Astro-specific overrides. Pull in for Astro projects. |
| `sanity` | Schema property ordering for `*.schema.ts` and structure-file exceptions. Pull in for projects using Sanity Studio. |
| `testing` | Relaxes strict TypeScript rules and devDependencies imports for `**/*.{test,spec}.*`, `__tests__/**`, and setup files. |
| `storybook` | Overrides for `**/*.stories.{ts,tsx}`. |
| `complexity` | Raises cyclomatic complexity threshold to 40 for `**/scripts/**` (orchestration scripts run linearly). Opt-in. |
| `e2e` | Disables `react-hooks/rules-of-hooks` for `**/e2e/**` (Playwright `test.extend` callbacks are false positives). Opt-in. |
| `tableComponents` | Disables `react/no-unstable-nested-components` for `**/*Table.tsx` (TanStack Table / Refine column-cell renderers). Opt-in. |

> **Note:** Requires ESLint v9+ with flat config. Node 22+.

## 🔄 Migrating from `@robeasthope/eslint-config`

This package was previously published as `@robeasthope/eslint-config` from the [`RobEasthope/protomolecule`](https://github.com/RobEasthope/protomolecule) monorepo (versions up to and including v6.2.1). It now ships from this standalone repo under the `@acme-skunkworks` scope, with a named-export composition pattern.

### Step 1: rename the dep

```bash
pnpm remove @robeasthope/eslint-config
pnpm add -D @acme-skunkworks/eslint-config
```

### Step 2: switch to named exports

The default export still works during the migration window, but is **deprecated** and will be removed in a future major:

```js
// Old (still works in v1, deprecated)
import eslintConfig from "@acme-skunkworks/eslint-config";
export default [...eslintConfig];

// New (preferred — pull in only what you need)
import { base, typescript, frameworkRouting } from "@acme-skunkworks/eslint-config";
export default [...base, typescript, ...frameworkRouting];
```

If your project was a Sanity / Storybook / Astro consumer, opt-in to those presets explicitly. The default export bundled all of them; the new shape makes the dependencies explicit.

### What's new in v1

- **Tempest fold-in.** Plugin versions bumped to current; `complexity`, `e2e`, and `tableComponents` are new opt-in presets ported from Tempest. See `MIGRATION_FROM_PROTOMOLECULE.md` for the per-preset diff.
- **Named-export composition.** Each preset is independently importable; consumers compose what they need.
- **`prettier` is now a `peerDependency`.** Was already a transitive dep via `eslint-plugin-prettier`; this just makes the contract explicit.

For older breaking-change history (v4 → v5 plugin bundling, v5 → v6 top-level type imports) see the original [protomolecule changelog](https://github.com/RobEasthope/protomolecule/blob/main/packages/eslint-config/CHANGELOG.md).

## ✨ Features

- **TypeScript** — full TypeScript linting via `typescript-eslint` v8.
- **React** — React 19 compatible rules from canonical-auto.
- **React Router 7 compatible** — top-level type imports, `func-style: declaration` with framework-aware exceptions for typed exports on `root.tsx` / `*.route.tsx`.
- **Astro** — opt-in preset.
- **Sanity** — opt-in preset for schema property ordering and structure-file exceptions.
- **Modern JavaScript** — ES2022+, Prettier integration, accessibility checks.

## 🛠️ Customisation

Override any rule from your local config — last config wins in flat config:

```js
import { base, typescript } from "@acme-skunkworks/eslint-config";

export default [
  ...base,
  typescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/prop-types": "off",
    },
  },
];
```

Add additional plugins by configuring them directly:

```js
import { base, typescript } from "@acme-skunkworks/eslint-config";
import pluginReact from "eslint-plugin-react";

export default [
  ...base,
  typescript,
  {
    plugins: { react: pluginReact },
    rules: { "react/jsx-uses-react": "error" },
  },
];
```

## 🔧 Development

```bash
pnpm install   # install deps
pnpm run build # tsc → dist/
pnpm lint      # lint this package's own source
pnpm lint:fix  # auto-fix
```

## 📄 License

MIT License — see [LICENSE](LICENSE).

This software is provided "as is", without warranty of any kind. Use at your own risk.
