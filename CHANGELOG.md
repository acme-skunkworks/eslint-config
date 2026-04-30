# @protomolecule/eslint-config

## 6.2.1

### Patch Changes

- [`f05be2f`](https://github.com/RobEasthope/protomolecule/commit/f05be2fa1667546555c2113042559e5b1117af85) [#368](https://github.com/RobEasthope/protomolecule/pull/368) - Improve Sanity ESLint rules: reorder schema property ordering (move fields earlier) and update structure file pattern to match naming convention

## 6.2.0

### Minor Changes

- [`4969647`](https://github.com/RobEasthope/protomolecule/commit/4969647dc1f0acb78465bdc4f40c2a2f03986354) [#366](https://github.com/RobEasthope/protomolecule/pull/366) - Add ESLint rule exceptions for Sanity structure files

  Sanity Studio structure files (`structure.ts`, `deskStructure.ts`) use specific conventions that conflict with standard ESLint rules:
  - **`func-style`**: Arrow functions assigned to constants are the standard Sanity pattern
  - **`id-length`**: The single-letter `S` parameter is a standard Sanity convention for the StructureBuilder

  Both rules are now disabled for these files to support the standard Sanity patterns:

  ```typescript
  export const structure: StructureResolver = (S) =>
    S.list()
      .title("Content")
      .items([...]);
  ```

  Also renamed `sanitySchema.ts` to `sanity.ts` to better reflect that the file now contains multiple Sanity-related ESLint configurations.

  Closes #365

## 6.1.0

### Minor Changes

- [`8540d1b`](https://github.com/RobEasthope/protomolecule/commit/8540d1bd46e79f06df55386cc53f89bc65ed3459) [#362](https://github.com/RobEasthope/protomolecule/pull/362) - Add ESLint rule for Sanity schema property ordering

  Adds a new `sanitySchema` rule configuration that enforces consistent property ordering in `defineField()` and `defineType()` calls within `*.schema.ts` files.

  **Property ordering groups:**
  1. Identity: `name`, `title`, `type`, `icon`
  2. Organization: `fieldset`, `group`, `groups`, `fieldsets`
  3. Behavior: `hidden`, `readOnly`
  4. Type-specific: `options`, `rows`, `to`, `of`, `marks`, `styles`
  5. Content defaults: `initialValue`, `description`
  6. Document-level: `preview`, `orderings`
  7. Validation: `validation`
  8. Fields: `fields` (always last for document types)

  The rule is auto-fixable with `eslint --fix`.

- [`849d4d5`](https://github.com/RobEasthope/protomolecule/commit/849d4d5a55cdbdae6d270f4669a8429e58aaf210) [#361](https://github.com/RobEasthope/protomolecule/pull/361) - Update eslint-plugin-react-hooks from 6.x to 7.x

  This brings the React hooks ESLint plugin to the latest major version, ensuring compatibility with consumer projects that have upgraded to the newer version.

## 6.0.2

### Patch Changes

- [`3b007d7`](https://github.com/RobEasthope/protomolecule/commit/3b007d7fa47df4c4d82da82f256eeeeffae85cfe) [#356](https://github.com/RobEasthope/protomolecule/pull/356) - Fix ESLint ignore patterns to use recursive globs, preventing massive performance issues

  **Problem:** Ignore patterns used single asterisk (`*`) instead of double asterisk (`**`), causing ESLint to lint hundreds of build output files instead of ignoring them recursively. This caused lint times to go from ~6 seconds to minutes or hanging.

  **Changes:**
  - Changed `**/.vscode/*` → `**/.vscode/**` (and 7 other directory patterns)
  - Added `**/.wrangler/**` for Cloudflare Wrangler state directory

  **Impact:** ESLint will now properly ignore nested build outputs, dramatically improving lint performance when build artifacts exist.

  Fixes #355

## 6.0.1

### Patch Changes

- [`be027e0`](https://github.com/RobEasthope/protomolecule/commit/be027e09ad09a7dadb71bb69c32b3adb1952d9ae) [#350](https://github.com/RobEasthope/protomolecule/pull/350) - Fix TypeScript compilation error with astro rule type inference

  Added explicit type annotation `Linter.Config[]` to the astro export to resolve TypeScript error TS2742. The compiler was unable to infer the type without an explicit reference, causing build failures.

## 6.0.0

### Major Changes

- [`8d374df`](https://github.com/RobEasthope/protomolecule/commit/8d374df23082c91a2ebec42643dd5e54a512a3d4) [#334](https://github.com/RobEasthope/protomolecule/pull/334) - **BREAKING CHANGE: Switch to top-level type imports for React Router 7 compatibility**

  This change updates the default type import style from inline (`import { type Foo }`) to top-level (`import type { Foo }`). This ensures compatibility with React Router 7's virtual module system and TypeScript's `verbatimModuleSyntax` option.

  ## What Changed

  ### Import Style Rules
  - **Disabled**: `canonical/prefer-inline-type-import`
  - **Changed**: `import/consistent-type-specifier-style` from `"prefer-inline"` to `"prefer-top-level"`
  - **Updated**: `import/no-duplicates` with `{ "prefer-inline": false }`

  ### Before (v5.x - Inline Style)

  ```typescript
  import { useState, type FC } from "react";
  ```

  ### After (v6.0.0 - Top-Level Style)

  ```typescript
  import type { FC } from "react";
  import { useState } from "react";
  ```

  ## Why This Change?

  React Router 7 generates virtual type modules (e.g., `./+types/route`) that fail to resolve with inline type imports during production builds. Top-level type imports are:
  1. **Compatible with all frameworks** - Works with React Router 7, Remix, Next.js, and others
  2. **Safer with verbatimModuleSyntax** - Aligns with TypeScript's strict module resolution
  3. **More explicit** - Clear separation between type and value imports
  4. **Future-proof** - Less likely to conflict with framework-specific module systems

  ## Migration Guide

  Run `pnpm lint:fix` in your project. Most inline type imports will auto-fix to top-level:

  ```bash
  pnpm lint:fix
  ```

  ### Manual Fixes Required

  For mixed imports (types + values from same module), you'll need to split them manually:

  ```typescript
  // Before
  import { useState, type FC, type ReactNode } from "react";

  // After
  import type { FC, ReactNode } from "react";
  import { useState } from "react";
  ```

  ### Projects Using React Router 7

  If you previously overrode these rules for React Router compatibility, you can now **remove the overrides**:

  ```typescript
  // eslint.config.ts - Remove this override
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"], // ❌ Remove
      "canonical/prefer-inline-type-import": "off", // ❌ Remove
      "import/no-duplicates": ["error", { "prefer-inline": false }], // ❌ Remove
    },
  }
  ```

  ## Breaking Changes

  ### Style Enforcement
  - Projects using inline type imports will see lint errors
  - `lint:fix` will convert inline imports to top-level
  - Separate import statements for types and values are now the standard

  ### No Impact On
  - Runtime behavior (type imports are erased at compile time)
  - Type safety
  - Import functionality

  ## Affected Projects

  This change specifically addresses issues in:
  - Waterleaf monorepo (#91)
  - Hecate monorepo (#302)
  - Any project using React Router 7 with virtual type modules

  ## References
  - Issue: https://github.com/RobEasthope/protomolecule/issues/333
  - React Router Issue: https://github.com/remix-run/react-router/issues/12503
  - TypeScript verbatimModuleSyntax: https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax

## 5.3.1

### Patch Changes

- [`b6c087e`](https://github.com/RobEasthope/protomolecule/commit/b6c087ebfe37a94c45bc1a89aabf2a9eb931698e) [#328](https://github.com/RobEasthope/protomolecule/pull/328) - Fix import/no-extraneous-dependencies false positives in monorepos with absolute paths

  **Problem Solved:**
  When using lint-staged in pnpm workspace monorepos, the `import/no-extraneous-dependencies` rule reported false positives for dependencies that were correctly listed in workspace package.json files. This occurred because lint-staged passes absolute file paths to ESLint, and the default import resolver couldn't map those paths back to the correct workspace package.

  **Solution:**
  Added `eslint-import-resolver-typescript` to properly resolve imports in monorepo workspaces. The TypeScript resolver:
  - Correctly maps absolute file paths to workspace packages
  - Resolves imports using tsconfig.json path mappings
  - Supports both monorepo and single-package projects
  - Gracefully falls back to standard Node resolution when TypeScript configs aren't present

  **Changes:**
  - Added `eslint-import-resolver-typescript@^4.4.4` as devDependency
  - Configured `import-x/resolver` settings in preferences with:
    - `alwaysTryTypes: true` - Resolves `@types/*` packages
    - `project` array supporting monorepo (`apps/*/`, `packages/*/`) and single-package layouts

  **Performance Impact:**
  Testing on this monorepo (~3.9 seconds cold cache for entire lint run):
  - **Expected overhead**: 10-30% for TypeScript project resolution
  - **Mitigated by**: ESLint caching, optimized tsconfig globs, `unrs-resolver` optimizations
  - **Trade-off**: Slightly slower linting for correct import resolution

  **Compatibility:**
  - ✅ Works in monorepo workspaces (pnpm, npm, yarn)
  - ✅ Works in single-package projects
  - ✅ Backward compatible (falls back to Node resolution for non-TS projects)
  - ✅ No breaking changes to existing configs

  **Testing:**
  - Tested in protomolecule monorepo with multiple workspace packages
  - Verified lint-staged with absolute paths resolves correctly
  - Confirmed no regressions in existing linting behavior
  - Performance measured within acceptable range

  **Resolves:** #327

  **Related:**
  - Original issue: RobEasthope/hecate#377
  - lint-staged absolute paths: https://github.com/okonet/lint-staged/issues/763

## 5.3.0

### Minor Changes

- [`7cbd100`](https://github.com/RobEasthope/protomolecule/commit/7cbd100320ee114a750d9db22211069def0fe57d) [#324](https://github.com/RobEasthope/protomolecule/pull/324) - Enforce function declarations with error-level func-style rule

  **Breaking Change for Consumers:**
  The `func-style` rule now errors (previously warned) when arrow functions or function expressions are used instead of function declarations. This enforces consistent function declaration style across codebases.

  **Changes:**
  - Changed `func-style` from `"warn"` to `"error"` severity
  - Function declarations are now the enforced standard pattern
  - Arrow functions and function expressions will cause linting failures

  **Migration Guide:**
  Convert arrow functions and function expressions to function declarations:

  ```typescript
  // ❌ Before (now errors)
  const myFunction = () => {
    // ...
  };

  // ✅ After
  function myFunction() {
    // ...
  }
  ```

  **Framework-Specific Exceptions:**
  React Router 7 files (`root.tsx`, `*route.tsx`) will need special handling in a future update, as they require arrow functions for typed exports like `export const links: Route.LinksFunction = () => [...]`. See issue #323 for tracking.

  **Rationale:**
  - Better hoisting behavior
  - Clearer stack traces in debugging
  - Explicit function names in all contexts
  - Consistent codebase style

### Patch Changes

- [`c52f51a`](https://github.com/RobEasthope/protomolecule/commit/c52f51a6e8653d854f64115a9881842eb98d8259) [#325](https://github.com/RobEasthope/protomolecule/pull/325) - Add React Router 7 exceptions for func-style rule

  **Changes:**
  - Created `reactRouterExceptions` config for React Router 7 files (`root.tsx`, `*.route.tsx`)
  - These files now allow arrow functions via `allowArrowFunctions` option
  - Exceptions properly override the strict func-style enforcement from base config

  **React Router 7 Patterns Now Allowed:**

  ```typescript
  // ✅ Allowed in root.tsx and *.route.tsx files
  export const links: Route.LinksFunction = () => [...];
  export const meta: Route.MetaFunction = () => ({ ... });
  export const loader: Route.LoaderFunction = async () => { ... };
  ```

  **Why This Exception Is Needed:**
  React Router 7 uses typed exports that require arrow functions or function expressions because:
  1. They need type annotations (`Route.LinksFunction`, etc.)
  2. TypeScript doesn't allow type annotations on function declarations
  3. The framework expects these specific export patterns

  **Implementation Details:**
  - Created `rules/reactRouterExceptions.ts` with framework-specific overrides
  - Added to config array AFTER `preferences` (order matters for override behavior)
  - Uses `allowArrowFunctions: true` option to permit arrow functions in variable declarations

  **Resolves:** #323

## 5.2.1

### Patch Changes

- [`d08c518`](https://github.com/RobEasthope/protomolecule/commit/d08c51891dcc436e248926a8c2c2aa79cadbc0c1) [#311](https://github.com/RobEasthope/protomolecule/pull/311) - Relax func-style rule from error to warning and simplify options. Changed severity from 'error' to 'warn' and removed custom options for arrow functions and named exports to simplify rule enforcement while still encouraging function declarations.

## 5.2.0

### Minor Changes

- [`17b35e8`](https://github.com/RobEasthope/protomolecule/commit/17b35e8f1ba56f5bb1beba3b36042759f50e3f74) [#300](https://github.com/RobEasthope/protomolecule/pull/300) - Fix ESLint rules causing friction with React Router v7 and modern meta-framework patterns

  **Changes:**
  1. **`canonical/filename-match-exported`** - Disabled for framework routing directories (`routes/`, `app/`, `pages/`)
     - File-based routing requires specific filenames that don't match exported component names
     - Affects: React Router v7, Remix, Next.js, SvelteKit, Astro, Nuxt
  2. **`import/no-extraneous-dependencies`** - Enhanced to support framework dev packages
     - Allows imports from `@react-router/dev` and similar packages in devDependencies
     - These are required for route configuration at build time
  3. **`import/no-unassigned-import`** - Allows CSS file imports
     - Standard pattern in Vite, Next.js, React Router, Remix, Astro
     - Supports: `.css`, `.scss`, `.sass`, `.less`, `.pcss`
  4. **`func-style`** - Allows arrow functions for exported const with type annotations
     - Framework types often require specific function signatures
     - Example: `export const links: Route.LinksFunction = () => [...]`
  5. **`no-empty-pattern`** - Disabled to support typed framework exports
     - Empty destructuring satisfies type system when arguments aren't used
     - Example: `export function meta({}: Route.MetaArgs) { ... }`

  **Impact:** Eliminates 7 `eslint-disable` comments across React Router v7 applications and improves DX for all modern meta-frameworks.

  Fixes #299

## 5.1.0

### Minor Changes

- [`34dce1e`](https://github.com/RobEasthope/protomolecule/commit/34dce1ea11522a6ca401ef3f7a876af9c0965ff8) [#296](https://github.com/RobEasthope/protomolecule/pull/296) - Allow devDependencies in test setup files

  Configure `import/no-extraneous-dependencies` rule to allow imports from `devDependencies` in test files and test setup files. This prevents false positives on files like `vitest.setup.ts` that legitimately import testing libraries.

  **New file patterns recognized:**
  - `vitest.setup.{ts,js}` - Vitest setup files
  - `jest.setup.{ts,js}` - Jest setup files
  - `playwright.setup.{ts,js}` - Playwright setup files
  - `test.setup.{ts,js}` - Generic test setup files
  - `**/__tests__/**/*.setup.{ts,js}` - Setup files in `__tests__` directories
  - `**/tests/**/*.setup.{ts,js}` - Setup files in `tests` directories

  **Before:**

  ```typescript
  // vitest.setup.ts
  import "@testing-library/jest-dom";
  // ❌ Error: should be in dependencies, not devDependencies
  ```

  **After:**

  ```typescript
  // vitest.setup.ts
  import "@testing-library/jest-dom";
  // ✅ Allowed - setup files can use devDependencies
  ```

  This uses a hybrid approach with specific framework names and test directory scoping to avoid false positives on non-test setup files like `database.setup.ts` or `server.setup.ts`.

  Closes #295

## 5.0.0

### Major Changes

- [`fc6d2ec`](https://github.com/RobEasthope/protomolecule/commit/fc6d2ec22d3e84f6e5d9af7fbabfcb75f3f8ad68) [#293](https://github.com/RobEasthope/protomolecule/pull/293) - Move ESLint plugins from peerDependencies to dependencies for flat config

  **BREAKING CHANGE**: ESLint plugins are now regular dependencies instead of peerDependencies. This aligns with ESLint flat config best practices.

  **What Changed:**
  - All 13 ESLint plugins moved from `peerDependencies` to `dependencies`
  - `astro-eslint-parser` and `typescript-eslint` moved to `dependencies`
  - Only `eslint` remains as a `peerDependency`
  - Removed `peerDependenciesMeta` section
  - Removed unused plugin re-exports from `index.ts`

  **Benefits:**
  - ✅ Simpler installation (2 packages instead of 14)
  - ✅ No peer dependency warnings
  - ✅ Config package controls exact plugin versions
  - ✅ Automatic compatible plugin updates
  - ✅ Follows ESLint flat config documentation

  **Migration Guide for Consumers:**

  After upgrading to v5.0.0, you can remove plugin dependencies from your `package.json`:

  ```bash
  # Remove plugins (now bundled with config)
  pnpm remove astro-eslint-parser eslint-plugin-import-x \
    eslint-plugin-jsdoc eslint-plugin-jsx-a11y eslint-plugin-n \
    eslint-plugin-prettier eslint-plugin-promise eslint-plugin-react \
    eslint-plugin-react-hooks eslint-plugin-regexp eslint-plugin-unicorn \
    typescript-eslint

  # Keep only if you import them directly in your eslint.config files
  # (e.g., eslint-plugin-astro for Astro-specific config)
  ```

  **Before (v4.x):**

  ```bash
  pnpm add -D @robeasthope/eslint-config eslint [+ 13 plugins]
  ```

  **After (v5.0.0):**

  ```bash
  pnpm add -D @robeasthope/eslint-config eslint
  ```

  Your ESLint configuration will continue to work without changes. The config package now handles all plugin dependencies automatically.

  Closes #292

## 4.2.0

### Minor Changes

- [`3a186e2`](https://github.com/RobEasthope/protomolecule/commit/3a186e2201b62bef4952905d5b612b5f7c98c679) [#286](https://github.com/RobEasthope/protomolecule/pull/286) - Allow console.log() in no-console ESLint rule

  The no-console rule now allows console.log() alongside error, debug, and warn methods. This change enables legitimate use of console.log() in:
  - GitHub Actions scripts for CI output visibility
  - CLI tools for normal operation
  - Utility scripts for progress reporting

  The rule remains configured as a warning (not error), maintaining visibility while allowing practical usage.

- [`bfe99a3`](https://github.com/RobEasthope/protomolecule/commit/bfe99a3b5814441d9e5b08b2baf3afdf31c82c1c) [#288](https://github.com/RobEasthope/protomolecule/pull/288) - Add CommonJS support for .cjs files

  The ESLint config now properly handles `.cjs` files, treating them as CommonJS scripts with appropriate Node.js environment globals.

  **Features:**
  - Automatically matches `**/*.cjs` files
  - Sets `sourceType: "script"` for proper CommonJS parsing
  - Provides Node.js globals (`require`, `module`, `exports`, `console`, `process`, etc.)
  - Provides ES2021 globals

  **Use case:**

  This enables `.cjs` files (CommonJS by convention) to use `require()` and `module.exports` without ESLint parsing errors. Note that `.js` files are treated as ES modules by default, matching modern Node.js behavior.

  **Dependencies:**

  Added `globals` package (v15.18.0) for Node.js and ES global definitions.

- [`6cb7b3c`](https://github.com/RobEasthope/protomolecule/commit/6cb7b3cb9cc08f3e926b76c57b3b6ba0e715b55d) [#290](https://github.com/RobEasthope/protomolecule/pull/290) - Configure import/no-extraneous-dependencies for monorepos

  The `import/no-extraneous-dependencies` rule now understands monorepo structures, allows devDependencies in appropriate file types, and recognizes peerDependencies.

  **Features:**

  **Monorepo support:**
  - `packageDir: ["./", "../", "../../"]` - checks parent directories for `package.json`
  - Resolves dependencies declared in workspace root, not just local package

  **PeerDependencies support:**
  - `peerDependencies: true` - allows imports from peerDependencies
  - Essential for shared configs (ESLint configs, etc.) that re-export plugins

  **DevDependencies allowed in:**
  - Test files: `**/*.test.{ts,tsx,js,jsx}`, `**/*.spec.{ts,tsx,js,jsx}`, `**/__tests__/**/*`
  - Config files: `**/*.config.{ts,js,mjs,cjs}`
  - Utility directories: `.changeset/**`, `.github/scripts/**`, `scripts/**`

  **Problems solved:**

  Before this change:
  1. Utility directories without local `package.json` would error when importing workspace root dependencies
  2. ESLint configs couldn't import plugins from peerDependencies

  ```javascript
  // .changeset/changelogFunctions.test.js
  import { describe, expect, it } from "vitest";
  // ❌ Error: 'vitest' should be listed in dependencies
  // (even though it's in root package.json)
  ```

  After this change, the rule correctly finds dependencies in ancestor `package.json` files and recognizes peerDependencies.

- [`fa8f8d0`](https://github.com/RobEasthope/protomolecule/commit/fa8f8d06a0c708c7e5c472f35057ef82bec40bf6) [#287](https://github.com/RobEasthope/protomolecule/pull/287) - Add relaxed TypeScript rules for test files

  Created new test file overrides that downgrade strict TypeScript rules from error to warning in test files:
  - `@typescript-eslint/no-explicit-any` → warning (allows testing type validation)
  - `@typescript-eslint/no-non-null-assertion` → warning (allows assertions after preconditions)

  Test files are matched by:
  - `**/*.test.{ts,tsx,js,jsx}`
  - `**/*.spec.{ts,tsx,js,jsx}`
  - `**/__tests__/**/*.{ts,tsx,js,jsx}`

  These rules remain warnings (not disabled) to maintain visibility during code review, while allowing idiomatic test patterns without blocking CI/CD.

## 4.1.0

### Minor Changes

- [`7d563c1`](https://github.com/RobEasthope/protomolecule/commit/7d563c186fe901b2cb90c0c54dbaebda6ce65c87) [#266](https://github.com/RobEasthope/protomolecule/pull/266) - Add common import ignore patterns to Astro rules

  **Enhancement:**
  Added commonly-needed import ignore patterns to the Astro configuration to reduce boilerplate in consumer projects.

  **New Ignore Patterns:**
  1. **`^@/`** - Path aliases defined in tsconfig
     - Most Astro projects use path aliases like `@/components`, `@/layouts`
     - ESLint's static import resolver can't resolve these without complex configuration
  2. **`\\.astro$`** - .astro file imports
     - Astro's custom file format (`.astro`) isn't recognized by standard import resolvers
     - Allows imports like `import Layout from './Layout.astro'`

  **Before (consumers had to override):**

  ```typescript
  // Consumer's eslint.config.ts
  export const astroImportRules = {
    files: ["**/*.astro"],
    rules: {
      "import/no-unresolved": [
        "error",
        {
          ignore: [
            "^astro:", // From base config (now lost due to override)
            "^@/", // Had to add manually
            "\\.astro$", // Had to add manually
          ],
        },
      ],
    },
  };
  ```

  **After (works out of the box):**

  ```typescript
  // Consumer's eslint.config.ts
  export default [...baseConfig, customRules]; // Just works!
  ```

  **Updated Rule:**

  ```typescript
  "import/no-unresolved": [
    "error",
    {
      ignore: [
        "^astro:",    // Astro virtual modules (existing)
        "^@/",        // Path aliases (NEW)
        "\\.astro$",  // .astro imports (NEW)
      ],
    },
  ]
  ```

  **Benefits:**
  - ✅ Reduces boilerplate in consumer configs
  - ✅ Covers 90%+ of Astro projects out of the box
  - ✅ Consumers can still override if they need different patterns
  - ✅ Maintains original `^astro:` virtual module ignores

  **Impact:**
  - No breaking changes - only adds ignore patterns
  - Existing configs continue to work
  - Projects using these patterns can remove their local overrides

  Closes #265

## 4.0.2

### Patch Changes

- [`c81d167`](https://github.com/RobEasthope/protomolecule/commit/c81d167b0cef75a3955816aca17998d7202ff571) [#263](https://github.com/RobEasthope/protomolecule/pull/263) - Fix Astro parser resolution by making astro-eslint-parser a peerDependency

  **Problem:**
  Even though the Astro parser was configured correctly in the ESLint config, ESLint was still using the JavaScript parser (acorn/espree) for `.astro` files in consumer workspaces. This caused parsing errors like:

  ```text
  error  Parsing error: The keyword 'interface' is reserved
  ```

  **Root Cause:**
  The `astro-eslint-parser` was a regular dependency of `@robeasthope/eslint-config`, installed in its `node_modules`. When ESLint ran from a consumer workspace subdirectory, it couldn't resolve the parser module even though the config referenced it correctly.

  **Solution:**
  Moved `astro-eslint-parser` from dependencies to **optional peerDependencies**:
  - Consumers install the parser at workspace root where ESLint can resolve it
  - Parser module is accessible from consumer's execution context
  - Re-exported parser for explicit imports if needed

  **Changes:**
  - Moved `astro-eslint-parser` to peerDependencies (optional)
  - Added to devDependencies for package's own linting
  - Re-exported parser: `export { default as astroParser } from "astro-eslint-parser"`

  **Installation (updated):**

  ```bash
  # For projects using Astro
  pnpm add -D -w \
    astro-eslint-parser \
    eslint-plugin-astro \
    [... other plugins]
  ```

  **Benefits:**
  - ✅ Astro parser now resolves correctly in monorepo workspaces
  - ✅ `.astro` files parse without errors
  - ✅ No more fallback to JavaScript parser
  - ✅ Astro-specific syntax (interfaces, components) works correctly

  Related to #261

## 4.0.1

### Patch Changes

- [`5c09ae1`](https://github.com/RobEasthope/protomolecule/commit/5c09ae18d2e4b5d4906821da3a621fdc399ac677) [#260](https://github.com/RobEasthope/protomolecule/pull/260) - Add plugin aliasing to map eslint-plugin-import-x as "import"

  **Problem:**
  `eslint-config-canonical` references rules using plugin name `"import"`, but the actual installed package is `eslint-plugin-import-x`. This caused ESLint flat config to fail with:

  ```text
  A configuration object specifies rule "import/no-unresolved", but could not find plugin "import".
  ```

  **Solution:**
  Added plugin aliasing to register `eslint-plugin-import-x` as both `"import"` and `"import-x"`:
  - `"import"` - Alias for backward compatibility with canonical config
  - `"import-x"` - Standard modern name

  **Changes:**
  - Imported `pluginImportX` explicitly in index.ts
  - Added plugin registration config object before canonical config
  - Registered plugin under both names for compatibility

  **Benefits:**
  - ✅ Backward compatibility with canonical config's "import" references
  - ✅ No consumer changes needed - workarounds can be removed
  - ✅ Future-proof - works when canonical eventually updates
  - ✅ Clean migration path - can remove "import" alias later

  **Impact:**
  Consumers can now remove workarounds like:

  ```typescript
  export const astroImportFix = {
    files: ["**/*.astro"],
    rules: {
      "import/no-unresolved": "off",
    },
  };
  ```

  **Note on Astro compatibility:**
  This fix is essential for Astro files. The `rules/astro.ts` configuration uses `"import/no-unresolved"` rule to ignore Astro virtual imports. Without the plugin aliasing, this rule reference would fail because ESLint couldn't find the "import" plugin.

  Closes #259
  Related to #261

## 4.0.0

### Major Changes

- [`cf5f831`](https://github.com/RobEasthope/protomolecule/commit/cf5f8314d6ad8721cdc6edb51b1797ba5a2d0d97) [#257](https://github.com/RobEasthope/protomolecule/pull/257) - Fix ESLint plugin resolution in flat config for workspace consumers

  **Problem:**
  When using `@robeasthope/eslint-config` in monorepo workspaces, ESLint couldn't resolve plugins when run from subdirectories. This caused errors like:

  ```text
  A configuration object specifies rule "import/no-unresolved", but could not find plugin "import".
  ```

  This prevented consumers from using the simplified config:

  ```typescript
  import robeasthope from "@robeasthope/eslint-config";
  export default [...robeasthope];
  ```

  **Solution:**
  - Re-exported 12 core plugins alongside the config for proper resolution
  - Moved plugins to peerDependencies (consumers must install them)
  - Package managers will warn about missing peer dependencies during installation
  - Consumers can import re-exported plugins if needed for custom configurations

  **Changes:**
  - Re-exported plugins: `pluginImportX`, `pluginReact`, `pluginReactHooks`, `pluginJsxA11y`, `pluginUnicorn`, `pluginPrettier`, `pluginPromise`, `pluginRegexp`, `pluginN`, `pluginJsdoc`, `pluginAstro`, `typescriptEslint`
  - Converted plugins to peerDependencies (except `eslint-plugin-astro` which is optional)
  - Added TypeScript type suppression for plugins without type declarations

  **Breaking Changes:**
  - Consumers must now install required plugins as peer dependencies
  - Package managers will show warnings if plugins are missing
  - Installation command provided in package warnings

  **Installation:**

  ```bash
  pnpm add -D @robeasthope/eslint-config \
    eslint-plugin-import-x \
    eslint-plugin-react \
    eslint-plugin-react-hooks \
    eslint-plugin-jsx-a11y \
    eslint-plugin-unicorn \
    eslint-plugin-prettier \
    eslint-plugin-promise \
    eslint-plugin-regexp \
    eslint-plugin-n \
    eslint-plugin-jsdoc \
    typescript-eslint
  ```

  **Benefits:**
  - ✅ Fixes plugin resolution in workspace subdirectories
  - ✅ Enables simplified consumer configs
  - ✅ Smaller package size (plugins not bundled)
  - ✅ Consumers control plugin versions
  - ✅ Clear warnings when plugins are missing

  Closes #255

## 3.0.3

### Patch Changes

- [`5d113b1`](https://github.com/RobEasthope/protomolecule/commit/5d113b1517ccd9c7af8ac54bdf0cd1141d954446) [#227](https://github.com/RobEasthope/protomolecule/pull/227) - Fix initial GitHub Packages publish script to not modify global .npmrc

  **Problem:** The initial publish script was modifying `~/.npmrc` with a scope-level registry override (`@robeasthope:registry=https://npm.pkg.github.com`), causing all `@robeasthope/*` packages to resolve from GitHub Packages instead of npm. This required authentication and broke CI in other repositories.

  **Solution:**
  - Initial publish now uses temporary `.npmrc` (automatically cleaned up)
  - No modification of user's global `~/.npmrc`
  - Dual publishing continues to work (npm + GitHub Packages)
  - Added cleanup script for affected users: `scripts/cleanup-npmrc.ts`
  - Added verification check to warn about existing scope overrides

  **Migration:** If you previously ran the initial publish script, run the cleanup script to restore normal npm behavior:

  ```bash
  pnpm tsx scripts/cleanup-npmrc.ts
  ```

  **Impact:** Packages now install from npm by default (no authentication required). GitHub Packages remains available as an explicit opt-in backup registry.

  Fixes #226

## 3.0.2

### Patch Changes

- [`e1913ab`](https://github.com/RobEasthope/protomolecule/commit/e1913ab0fba40c755194b6e80ff320112c14859b) [#192](https://github.com/RobEasthope/protomolecule/pull/192) - Add dual publishing to GitHub Packages registry. Packages are now published to both npm (primary) and GitHub Packages (backup) registries.

  **Changes:**
  - Added automatic publishing to GitHub Packages after npm publish
  - Non-fatal error handling for GitHub Packages (npm remains primary)
  - Updated documentation with GitHub Packages installation info

  **For users:**
  - No action required - packages still install from npm by default
  - GitHub Packages available as backup registry (requires authentication)
  - See README for GitHub Packages setup instructions

  See issue #191 for implementation details.

- [`1226985`](https://github.com/RobEasthope/protomolecule/commit/12269850a3be2d526795e978db4cc658f4e428af) [#192](https://github.com/RobEasthope/protomolecule/pull/192) - Improve GitHub Packages publishing script robustness
  - Add error handling for JSON parsing
  - Add package name and path validation
  - Track success/failure counts for better error reporting
  - Add comprehensive JSDoc comments
  - Document environment variables and exit codes

## 3.0.1

### Patch Changes

- [`1f51ac7`](https://github.com/RobEasthope/protomolecule/commit/1f51ac7e248214935ddd7b34efdd75a9486d4200) [#182](https://github.com/RobEasthope/protomolecule/pull/182) - Improve Astro support by ignoring virtual imports (astro:\*) instead of disabling import resolution entirely. The import/no-unresolved rule now uses a targeted regex pattern to allow Astro's virtual modules (astro:content, astro:assets, etc.) while still validating other imports in .astro files.

- [`5144c13`](https://github.com/RobEasthope/protomolecule/commit/5144c13be191b1f43ae7943697e28db48ff6ab65) [#184](https://github.com/RobEasthope/protomolecule/pull/184) - Use typescript-eslint's disableTypeChecked config for Storybook files instead of disabling TypeScript parser entirely. This disables only type-aware linting rules (that require tsconfig project references) while keeping all syntax-based TypeScript rules active, providing better linting coverage for Storybook files that are excluded from tsconfig.json.

## 3.0.0

### Major Changes

- [`0ff0bdc`](https://github.com/RobEasthope/protomolecule/commit/0ff0bdc8db20c1b34459d0e0ed7ffca37915f3ff) [#171](https://github.com/RobEasthope/protomolecule/pull/171) - BREAKING CHANGE: Migrate package namespace from @protomolecule to @robeasthope

  All packages have been renamed to use the @robeasthope namespace for GitHub Packages compatibility:
  - @protomolecule/ui → @robeasthope/ui
  - @protomolecule/eslint-config → @robeasthope/eslint-config
  - @protomolecule/colours → @robeasthope/colours

  Migration guide:
  1. Update package.json dependencies from @protomolecule/_to @robeasthope/_
  2. Update any imports from @protomolecule/_to @robeasthope/_
  3. Clear node_modules and reinstall dependencies

### Patch Changes

- [`f57cad4`](https://github.com/RobEasthope/protomolecule/commit/f57cad4a06614d53b514748d3e3cbb4fb642ccc1) [#165](https://github.com/RobEasthope/protomolecule/pull/165) - Add package metadata fields for improved npm discoverability. Added keywords, author, homepage, and bugs fields to all published packages to improve search ranking and provide clear support channels.

- [`6923886`](https://github.com/RobEasthope/protomolecule/commit/69238864d656aab4d28f323f5a63995816598d13) [#153](https://github.com/RobEasthope/protomolecule/pull/153) - fix: update ESLint rules for better compatibility
  - Changed no-console from error to warning to allow debugging
  - Added avoidEscape option to quotes rule to prevent circular fixes
  - Disabled canonical/filename-match-regex rule for more flexible naming

- [`799150b`](https://github.com/RobEasthope/protomolecule/commit/799150b9d60c2f7633ca732ebe6069620326e018) [#166](https://github.com/RobEasthope/protomolecule/pull/166) - Move test scripts to .github/scripts/ for better organization and convention alignment

- [`31aa4c4`](https://github.com/RobEasthope/protomolecule/commit/31aa4c4ce03f28b9c85c02abaa0c5324e2368c0d) [#160](https://github.com/RobEasthope/protomolecule/pull/160) - Update markdown linting to use markdownlint-cli2 configuration format. Migrated from separate .markdownlint.json and .markdownlintignore files to unified .markdownlint-cli2.jsonc files. Simplified lint:md scripts to use config file exclusively, adding MDX file support.

## 2.1.7

### Patch Changes

- [`a6b4929`](https://github.com/RobEasthope/protomolecule/commit/a6b4929e83b64dab2c519dbeb73f83bd16659462) [#156](https://github.com/RobEasthope/protomolecule/pull/156) - chore: remove GitHub packages publishing functionality

  Simplified the release process by removing dual-registry publishing to GitHub packages. Packages are now only published to NPM, reducing complexity and maintenance overhead.

## 2.1.6

### Patch Changes

- [`e94ad2f`](https://github.com/RobEasthope/protomolecule/commit/e94ad2f00e049f13bc0aca64e443da3451958446) [#144](https://github.com/RobEasthope/protomolecule/pull/144) - feat(ci): add descriptive PR titles for version releases

  Improved the release workflow to generate more descriptive PR titles based on the packages being released and the types of changes included. PR titles now indicate:
  - Which packages are being released
  - The nature of changes (features, fixes, breaking changes)
  - The number of packages when releasing many at once

  This makes it easier to understand at a glance what each release PR contains without having to open it.

## 2.1.5

### Patch Changes

- 31f216f: Improve shell script error handling by adding pipefail option

## 2.1.4

### Patch Changes

- e6a328b: docs: add comprehensive GitHub Packages manual publishing documentation
  - Created detailed manual publishing guide with step-by-step instructions
  - Added automated script for manual GitHub Packages publishing
  - Created documentation index (docs/README.md) for easier navigation
  - Added cross-references between all release-related documentation
  - Updated release process docs with troubleshooting section
  - Linked all documentation for better discoverability

- 8a3048f: Configure GitHub Packages with personal namespace and add individual publish scripts
  - Updated all GitHub Packages configuration to use personal namespace (RobEasthope) instead of organization
  - Fixed manual publish script hanging issue by redirecting stdin from /dev/null
  - Added individual publish scripts for each package for more granular control
  - Improved error detection and reporting in publish scripts
  - Scripts now automatically load .env file for convenience
  - Enhanced .env file error handling to catch and report syntax errors
  - Updated documentation to explain personal namespace setup

## 2.1.3

### Patch Changes

- 353c05f: fix(ci): use RELEASE_PAT for GitHub Packages publishing to fix 403 errors
  - Use RELEASE_PAT (which has package write permissions) instead of GITHUB_TOKEN
  - Falls back to GITHUB_TOKEN if RELEASE_PAT is not available
  - Should resolve 403 permission errors when publishing to GitHub Packages

## 2.1.2

### Patch Changes

- 2a1d81d: fix(ci): comprehensive fix for GitHub Packages publishing failures
  - Fixed workspace directory reference issue that caused cd command failures
  - Added retry mechanism with exponential backoff for transient failures
  - Implemented package existence check before attempting to publish
  - Improved error handling with specific error detection patterns
  - Added detailed logging and debugging output for troubleshooting
  - Created separate npmrc configuration to avoid conflicts with NPM registry
  - Used file-based result tracking to work around bash array limitations in pipelines
  - Added comprehensive summary reporting with success/skip/failure counts
  - Created test script for local validation of publishing logic

## 2.1.1

### Patch Changes

- a15c2ac: feat: add GitHub Packages publishing support

  Added dual publishing to both NPM and GitHub Packages registries. All public packages will now be automatically published to GitHub Packages alongside NPM during the release process.
  - Updated release workflow to publish to GitHub Packages after NPM publishing
  - Added repository field to all publishable packages for proper GitHub Packages metadata
  - Configured authentication for GitHub Packages using GITHUB_TOKEN

## 2.1.0

### Minor Changes

- 6baaf4b: Add Astro file linting support to eslint-config package

## 2.0.2

### Patch Changes

- d9e3dac: feat: add markdown linting with turbo support
  - Added markdownlint-cli2 for markdown file linting
  - Configured markdown linting rules in .markdownlint.json
  - Added .markdownlintignore to exclude node_modules and build directories
  - Integrated markdown linting into lint-staged for automatic checks on commit
  - Added npm scripts for manual markdown linting (lint:md and lint:md:fix)
  - Added turbo tasks for running markdown linting across all packages
  - Added lint:md scripts to each package for package-level linting

## 2.0.1

### Patch Changes

- dd05159: Add ESLint auto-fix to pre-commit hooks
  - Added lint:fix-staged scripts to packages that run ESLint with --fix
  - Configured lint-staged to run ESLint fix on JS/TS files before prettier
  - ESLint will auto-fix issues but won't block commits for unfixable problems

- fda5cad: Fix release workflow for continuous deployment
  - Replace Version Packages PR approach with immediate publishing
  - Packages now publish to NPM immediately when changesets merge to main
  - Aligns with SPEC.md continuous deployment strategy

- a14a0fc: Update @types/node to version 22 to match Node version used in CI
- a6cbb14: Fix NPM authentication using changesets/action with enhanced reliability
  - Replace custom version/publish logic with official changesets/action@v1.4.8 (pinned version)
  - Action handles NPM authentication automatically via NPM_TOKEN
  - Enhanced build verification:
    - Comprehensive build output validation before publish
    - File size checks to detect empty/corrupt builds
    - Clear error reporting in GitHub Step Summary
  - Improved error handling:
    - NPM retry configuration for transient network failures
    - Post-publish verification to confirm packages are available
    - Non-brittle error handling that doesn't mask real issues
  - Restored useful custom functionality:
    - Concurrency control (queues releases instead of cancelling)
    - Pre-publish validation and changeset status checking
    - Enhanced release summaries with clear success/failure indicators
    - Better error messages and action items on failure
  - Simplifies workflow while keeping important safeguards
  - Reduces 105 lines of custom code

- 5def063: Fix release workflow by disabling Husky hooks in CI to prevent prettier errors during changeset commits
- a14a0fc: Fix critical GitHub Actions workflow syntax error that prevented workflow from running
  - Fixed invalid token fallback syntax that caused workflow parse errors
  - Now properly uses RELEASE_PAT secret for checkout (required for protected branches)
  - GITHUB_TOKEN is still used for GitHub release creation (doesn't need push permissions)

- a232f46: Fix critical workflow YAML parsing errors and add workflow linting
  - Fixed info emoji character (ℹ️) that caused YAML parsing errors on line 220
  - Fixed multiline string with "---" that was interpreted as YAML document separator
  - Added yaml-lint package for workflow validation
  - Added lint:workflows and lint:workflows:fix scripts
  - Integrated workflow linting into pre-commit hooks via lint-staged
  - Prettier already handles YAML formatting, yaml-lint validates syntax

- 33c4dd1: Add .claude directory to ESLint ignore list to prevent linting of Claude AI-generated files
