---
"@acme-skunkworks/eslint-config": patch
---

Add "when to use" JSDoc headers to every rule preset (`rules/*.ts`) and inline JSDoc to every opt-in re-export in `index.ts`. Each preset now opens with a one-line statement of whether it's always-on (part of `base`) or opt-in, and — for opt-in presets — the trigger condition (Sanity / Astro / Storybook / Playwright / TanStack Table / `scripts/**`). Existing inline rule rationale and `protomolecule/issues/<n>` references are preserved. Comments only — no runtime change for consumers — but the JSDoc rides through to `dist/**/*.d.ts`, so consumer IDE hover tooltips on imports like `{ sanity }` will now show the guidance.
