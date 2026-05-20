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
    // func-style — requires `function foo() {}` over `const foo = function () {}` / arrows.
    // Error + declaration + allowArrowFunctions: RR7 typed exports need annotated arrow/const patterns.
    // See: https://github.com/RobEasthope/protomolecule/issues/323
    // https://eslint.org/docs/latest/rules/func-style
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
  },
} satisfies Linter.Config;
