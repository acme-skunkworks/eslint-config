import type { Linter } from "eslint";

/**
 * Part of the `frameworkRouting` composition (paired with `frameworkRoutingRule`).
 * Not applied directly by consumers — pull in via `frameworkRouting`.
 *
 * Composition-order constraint: this preset MUST spread after `preferences`
 * (which `base` includes) so its `func-style` override beats the stricter
 * declaration-only default. Re-ordering silently breaks the React Router 7
 * typed-export pattern. See `index.ts` for the canonical composition.
 */
export const reactRouterExceptions = {
  files: ["**/root.tsx", "**/*.route.tsx"],
  rules: {
    // Allow arrow functions for React Router 7 typed exports
    // React Router 7 uses patterns like:
    //   export const links: Route.LinksFunction = () => [...]
    //   export const meta: Route.MetaFunction = () => ({ ... })
    //   export const loader: Route.LoaderFunction = async () => { ... }
    //
    // These MUST be arrow functions or function expressions because:
    // 1. They require type annotations (Route.LinksFunction, etc.)
    // 2. TypeScript doesn't allow type annotations on function declarations
    // 3. The framework expects these specific export patterns
    //
    // The allowArrowFunctions option permits arrow functions in variable
    // declarations while still enforcing function declarations elsewhere
    //
    // See: https://github.com/RobEasthope/protomolecule/issues/323
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
  },
} satisfies Linter.Config;
