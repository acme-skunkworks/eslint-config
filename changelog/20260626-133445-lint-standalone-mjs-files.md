---
title: Lint standalone `.mjs` files cleanly under `base`
release_note: >-
  `base` now applies Node + ES globals to standalone `.mjs` files — the ESM
  counterpart to the existing `.cjs` handling — so plain ES-module scripts lint
  without spurious `no-undef` errors on `console` / `process`.
version:
created_at: "2026-06-26T13:34:45Z"
merged_at:
branch: sk-439-support-linting-standalone-mjs-skill-files-validateextend
pr:
commit:
merge_strategy:
author: rob@acmeskunkworks.io
co_authors: []
category: feature
breaking: false
issues: ["SK-439"]
---

## Added

- `base` now ships an `esm` file-overrides block (`rules/esm.ts`) mirroring the
  existing `commonjs` block: standalone `.mjs` scripts get Node + ES2021 globals
  and `sourceType: "module"`, so they lint cleanly under the shared config
  without being members of a `tsconfig` project. Unblocks linting agent-skills'
  `skills/**/*.mjs` helpers (the `.mjs` portion of SK-394).
