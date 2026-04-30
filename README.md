# @acme-skunkworks/eslint-config

Shared ESLint v9 configuration with TypeScript and React support.

## 📦 Installation

Install the config along with ESLint:

```bash
pnpm add -D @acme-skunkworks/eslint-config eslint
```

That's it! All ESLint plugins are bundled as dependencies, so you don't need to install them separately.

### Migrating from `@robeasthope/eslint-config`

This package was previously published as `@robeasthope/eslint-config` from the [`RobEasthope/protomolecule`](https://github.com/RobEasthope/protomolecule) monorepo (versions up to and including v6.2.1). It now ships from this standalone repo under the `@acme-skunkworks` scope.

To migrate:

```bash
pnpm remove @robeasthope/eslint-config
pnpm add -D @acme-skunkworks/eslint-config
```

Then update your `eslint.config.js` import:

```javascript
// Before
import eslintConfig from "@robeasthope/eslint-config";

// After
import eslintConfig from "@acme-skunkworks/eslint-config";
```

The exported flat-config array is unchanged. No rule changes ship with the rename — for older breaking-change history (v4 → v5 plugin bundling, v5 → v6 top-level type imports) see the original [protomolecule changelog](https://github.com/RobEasthope/protomolecule/blob/main/packages/eslint-config/CHANGELOG.md).

## 🚀 Usage

In your `eslint.config.js`:

```javascript
import eslintConfig from "@acme-skunkworks/eslint-config";

export default [
  ...eslintConfig,
  // your custom rules
  {
    rules: {
      // override or add rules here
    },
  },
];
```

> **Note:** This config requires ESLint v9+ with flat config.

## ✨ Features

This configuration includes:

- **TypeScript Support**: Full TypeScript linting with type checking
- **React Support**: React and JSX best practices
- **React Router 7 Compatible**: Top-level type imports for virtual module compatibility
- **Modern JavaScript**: ES2022+ features
- **Code Quality**: Enforces consistent code style
- **Accessibility**: Basic a11y checks for React components

## 📝 Rules Overview

### Included Plugins

- TypeScript ESLint rules
- React hooks rules
- Import ordering and resolution
- Best practices for modern JavaScript

### Key Rules

- Strict TypeScript checking
- React 19 compatible rules
- **Top-level type imports** (`import type { }` instead of `import { type }`)
- Consistent import ordering
- No unused variables or imports
- Consistent naming conventions

## 🛠️ Customization

### Override Rules

You can override any rules by adding them to your local config:

```javascript
export default [
  ...eslintConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // downgrade from error
      "react/prop-types": "off", // disable prop-types
    },
  },
];
```

### Custom Plugin Configuration

If you need to configure plugins directly, install them separately:

```javascript
import eslintConfig from "@acme-skunkworks/eslint-config";
import pluginReact from "eslint-plugin-react";

export default [
  ...eslintConfig,
  {
    plugins: {
      react: pluginReact,
    },
    rules: {
      "react/jsx-uses-react": "error",
    },
  },
];
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Run linting on this package
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## 📄 License

MIT License — see [LICENSE](LICENSE).

This software is provided "as is", without warranty of any kind. Use at your own risk.
