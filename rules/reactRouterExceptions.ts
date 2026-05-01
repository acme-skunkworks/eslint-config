import type { Linter } from "eslint";

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
