---
title: "Let Prettier win on all tsconfig.*.json variants"
release_note: >-
  Prettier-formatted named tsconfig variants (e.g. tsconfig.tools.json with a
  short exclude array) now pass lint under base without .prettierignore workarounds.
created_at: "2026-07-17T16:52:39Z"
merged_at:
branch: "cursor/a-709-tsconfig-variants-jsonc-prettier-5c17"
pr:
commit:
merge_strategy:
author: "cursoragent@cursor.com"
co_authors: []
category: fix
breaking: false
issues: ["A-709"]
stats:
  files_changed:
  loc_added:
  loc_removed:
  commits:
---

## Fixed

- Widen the `tsconfigEslintJson` override in `base` from `**/tsconfig.eslint.json`
  alone to `**/tsconfig.*.json`, so the same four Prettier-conflicting `jsonc/*`
  formatting rules (`array-bracket-newline`, `array-element-newline`,
  `object-curly-spacing`, `object-property-newline`) are off for every named
  variant — including `tsconfig.tools.json`. Short `exclude` / `include` arrays
  no longer ping-pong between `eslint --fix` and Prettier ([A-709](https://linear.app/acme-skunkworks/issue/A-709)).

## Added

- Vitest regression fixture for a Prettier-formatted `tsconfig.tools.json` with a
  short `exclude` array under `infrastructure/tests/fixtures/`.
