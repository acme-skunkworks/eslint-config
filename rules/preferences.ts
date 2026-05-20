import type { Linter } from "eslint";

/**
 * Part of `base` — applied to every consumer. The largest preset, and the
 * one most consumers will reach for when they want to override something.
 *
 * Covers function style, type-import style, the prettier integration, the
 * import resolver (with monorepo support), `no-console`, and the
 * React Router 7 / Remix / SvelteKit compatibility block (top-level type
 * imports, empty-pattern allowance for typed framework args, CSS-import
 * carve-out, devDependencies allowlist for test / config / scripts files).
 *
 * Per-rule rationale lives inline below; the relevant protomolecule issues
 * (#299 React Router 7 ergonomics, #327 monorepo lint-staged paths,
 * #333 virtual modules + verbatimModuleSyntax) are linked at each site.
 */
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
    // canonical/filename-match-regex — requires exported symbol names to match a filename regex.
    // Off: canonical's default regex is too strict for our file-routing and colocated-file patterns.
    // https://github.com/gajus/eslint-plugin-canonical#rules
    "canonical/filename-match-regex": "off",
    // canonical/id-match — enforces identifier naming conventions (regex/case).
    // Off: conflicts with framework and library conventions (e.g. single-letter Sanity `S`).
    // https://github.com/gajus/eslint-plugin-canonical#rules
    "canonical/id-match": "off",
    // canonical/prefer-inline-type-import — prefers `import { type Foo }` over `import type { Foo }`.
    // Off: top-level type imports are required for React Router 7 virtual modules and verbatimModuleSyntax.
    // See: https://github.com/RobEasthope/protomolecule/issues/333
    // https://github.com/gajus/eslint-plugin-canonical#rules
    "canonical/prefer-inline-type-import": "off",
    // func-style — requires `function foo() {}` over `const foo = function () {}` / arrows.
    // Error + declaration: our default style; frameworkRouting relaxes root/route files.
    // See: https://github.com/RobEasthope/protomolecule/issues/299
    // https://eslint.org/docs/latest/rules/func-style
    "func-style": ["error", "declaration"],
    // import/consistent-type-specifier-style — enforces where `type` appears in import specifiers.
    // Error + prefer-top-level: separate `import type` lines for RR7 virtual modules compatibility.
    // See: https://github.com/RobEasthope/protomolecule/issues/333
    // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/consistent-type-specifier-style.md
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    // import/no-duplicates — reports multiple import declarations from the same module.
    // Error + prefer-inline false: allows separate value and type imports from one module.
    // See: https://github.com/RobEasthope/protomolecule/issues/333
    // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-duplicates.md
    "import/no-duplicates": ["error", { "prefer-inline": false }],
    // import/no-extraneous-dependencies — forbids importing packages not listed in package.json.
    // Error with devDependencies allowlist for tests, configs, scripts, and monorepo packageDir lookup.
    // See: https://github.com/RobEasthope/protomolecule/issues/299
    // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-extraneous-dependencies.md
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.{ts,tsx,js,jsx}",
          "**/*.spec.{ts,tsx,js,jsx}",
          "**/__tests__/**/*",
          "**/*.config.{ts,js,mjs,cjs}",
          "**/*.setup.{ts,js}",
          "**/test-utils.{ts,tsx}",
          "**/routes.ts",
          ".changeset/**",
          ".github/scripts/**",
          "scripts/**",
        ],
        includeInternal: false,
        includeTypes: true,
        packageDir: ["./", "../", "../../"],
        peerDependencies: true,
      },
    ],
    // import/no-unassigned-import — forbids side-effect imports that bind no symbols.
    // Error with CSS/SCSS/etc. allowlist: framework apps import stylesheets without bindings.
    // See: https://github.com/RobEasthope/protomolecule/issues/299
    // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-unassigned-import.md
    "import/no-unassigned-import": [
      "error",
      {
        allow: ["**/*.css", "**/*.scss", "**/*.sass", "**/*.less", "**/*.pcss"],
      },
    ],
    // no-console — disallows `console` calls (with optional allowlist of methods).
    // Warn + allow error/debug/warn/log: discourage casual logging but permit intentional use.
    // https://eslint.org/docs/latest/rules/no-console
    "no-console": ["warn", { allow: ["error", "debug", "warn", "log"] }],
    // no-empty-pattern — disallows empty object/array patterns in destructuring.
    // Off: typed framework route args use `{}` placeholders (e.g. `meta({}: Route.MetaArgs)`).
    // See: https://github.com/RobEasthope/protomolecule/issues/299
    // https://eslint.org/docs/latest/rules/no-empty-pattern
    "no-empty-pattern": "off",
    // perfectionist/sort-modules — enforces ordering of ES module statements.
    // Off: canonical enables this; we prefer manual/import-group ordering without auto-sort noise.
    // https://perfectionist.dev/rules/sort-modules
    "perfectionist/sort-modules": "off",
    // prettier/prettier — runs Prettier as an ESLint rule and reports formatting diffs.
    // Error with tailwind plugin + cn/clsx: formatting is enforced at lint time, not only on save.
    // https://github.com/prettier/eslint-plugin-prettier#options
    "prettier/prettier": [
      "error",
      {
        plugins: ["prettier-plugin-tailwindcss"],
        singleQuote: false,
        tailwindFunctions: ["cn", "clsx"],
      },
    ],
    // quotes — enforces consistent quote style for strings.
    // Warn + double + avoidEscape: align with Prettier double-quote default; escapes when needed.
    // https://eslint.org/docs/latest/rules/quotes
    quotes: ["warn", "double", { avoidEscape: true }],
    // react/forbid-component-props — bans specific props on DOM/components.
    // Off: canonical's forbidden-prop list is too opinionated for our component libraries.
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/forbid-component-props.md
    "react/forbid-component-props": "off",
    // react/function-component-definition — enforces arrow vs function declaration for components.
    // Off: we use func-style globally instead; this rule duplicates and conflicts with RR7 patterns.
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/function-component-definition.md
    "react/function-component-definition": "off",
    // regexp/no-unused-capturing-group — flags capturing groups whose match is never used.
    // Off: false positives on regexes where groups aid readability or future back-references.
    // https://ota.github.io/eslint-plugin-regexp/rules/no-unused-capturing-group.html
    "regexp/no-unused-capturing-group": "off",
    // require-unicode-regexp — requires the `u` flag on `RegExp` literals and constructors.
    // Off: not all regexes need Unicode semantics; canonical's default is too strict for us.
    // https://eslint.org/docs/latest/rules/require-unicode-regexp
    "require-unicode-regexp": "off",
    // unicorn/better-regex — suggests regex optimizations (simpler patterns, fewer backtracks).
    // Off: auto-suggestions conflict with intentionally explicit patterns in places.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/better-regex.md
    "unicorn/better-regex": "off",
    // unicorn/numeric-separators-style — enforces `_` separators in numeric literals.
    // Off: style preference; teams vary on when separators help readability.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/numeric-separators-style.md
    "unicorn/numeric-separators-style": "off",
  },
  settings: {
    // import-x/resolver — tells import-x rules how to resolve module paths (TypeScript projects).
    // typescript resolver + monorepo tsconfig globs: fixes false positives when lint-staged passes absolute paths.
    // See: https://github.com/RobEasthope/protomolecule/issues/327
    // https://github.com/import-js/eslint-import-resolver-typescript
    "import-x/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: [
          "tsconfig.json",
          "apps/*/tsconfig.json",
          "packages/*/tsconfig.json",
        ],
      },
    },
    // react.version — supplies React version to eslint-plugin-react for version-aware rules.
    // detect: read version from installed `react` package instead of hard-coding.
    // https://github.com/jsx-eslint/eslint-plugin-react#configuration
    react: {
      version: "detect",
    },
  },
} satisfies Linter.Config;
