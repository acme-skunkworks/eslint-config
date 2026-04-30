import type { Linter } from "eslint";

export const preferences = {
  files: ["**/*.{ts,tsx,js,jsx,mjs}"],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  rules: {
    "canonical/filename-match-regex": "off",
    "canonical/id-match": "off",
    // Prefer top-level type imports for React Router 7 compatibility
    // Top-level: import type { Foo } from 'bar'
    // Inline: import { type Foo } from 'bar' (causes issues with virtual modules)
    // See: https://github.com/RobEasthope/protomolecule/issues/333
    "canonical/prefer-inline-type-import": "off",
    // Enforce function declarations as the standard pattern
    // Arrow functions and function expressions will error
    // Note: React Router 7 files (root.tsx, *route.tsx) need framework-specific exceptions
    // See: https://github.com/RobEasthope/protomolecule/issues/299
    "func-style": ["error", "declaration"],
    // Prefer top-level type imports over inline type imports
    // This ensures compatibility with React Router 7 virtual modules and verbatimModuleSyntax
    // See: https://github.com/RobEasthope/protomolecule/issues/333
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    // Prevent duplicate imports from the same module
    // With prefer-inline: false, allows separate type and value imports
    // e.g., import { useState } from 'react' and import type { FC } from 'react'
    // See: https://github.com/RobEasthope/protomolecule/issues/333
    "import/no-duplicates": ["error", { "prefer-inline": false }],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.{ts,tsx,js,jsx}",
          "**/*.spec.{ts,tsx,js,jsx}",
          "**/__tests__/**/*",
          "**/*.config.{ts,js,mjs,cjs}",
          ".changeset/**",
          ".github/scripts/**",
          "scripts/**",
        ],
        // Allow importing from @react-router/dev and similar framework dev packages
        // These are in devDependencies but required for route configuration at build time
        // See: https://github.com/RobEasthope/protomolecule/issues/299
        includeInternal: false,
        includeTypes: true,
        packageDir: ["./", "../", "../../"],
        // Allow importing from peerDependencies (for shared configs like eslint-config)
        peerDependencies: true,
      },
    ],
    // Allow CSS file imports (standard pattern in Vite, Next.js, React Router, Remix, Astro)
    // See: https://github.com/RobEasthope/protomolecule/issues/299
    "import/no-unassigned-import": [
      "error",
      {
        allow: ["**/*.css", "**/*.scss", "**/*.sass", "**/*.less", "**/*.pcss"],
      },
    ],
    "no-console": ["warn", { allow: ["error", "debug", "warn", "log"] }],
    // Allow empty patterns with type annotations (React Router v7, Remix, SvelteKit patterns)
    // e.g., `export function meta({}: Route.MetaArgs) { ... }`
    // The empty destructuring satisfies the type system even when arguments aren't used
    // See: https://github.com/RobEasthope/protomolecule/issues/299
    "no-empty-pattern": "off",
    "perfectionist/sort-modules": "off",
    "prettier/prettier": [
      "error",
      {
        plugins: ["prettier-plugin-tailwindcss"],
        singleQuote: false,
        tailwindFunctions: ["cn", "clsx"],
      },
    ],

    quotes: ["warn", "double", { avoidEscape: true }],
    "react/forbid-component-props": "off",
    "react/function-component-definition": "off",
    "regexp/no-unused-capturing-group": "off",
    "require-unicode-regexp": "off",
    "unicorn/better-regex": "off",
    "unicorn/numeric-separators-style": "off",
  },
  settings: {
    // TypeScript import resolver for monorepo support
    // Fixes false positives with import/no-extraneous-dependencies when lint-staged
    // passes absolute file paths in monorepo workspaces
    // See: https://github.com/RobEasthope/protomolecule/issues/327
    "import-x/resolver": {
      typescript: {
        // Always try to resolve types under `@types/*` directory
        alwaysTryTypes: true,
        // Support both monorepo and single-package projects
        // Monorepo: Multiple tsconfig files for workspace packages
        // Single package: Falls back to root tsconfig.json
        project: [
          "tsconfig.json", // Root or single package
          "apps/*/tsconfig.json", // Monorepo apps
          "packages/*/tsconfig.json", // Monorepo packages
        ],
      },
    },
    react: {
      version: "detect",
    },
  },
} satisfies Linter.Config;
