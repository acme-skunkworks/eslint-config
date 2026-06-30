---
title: Allow Prettier-formatted tsconfig.eslint.json under base
release_note: >-
  Prettier-formatted tsconfig.eslint.json files (single-line include arrays) now
  pass lint without per-file .prettierignore workarounds.
created_at: '2026-06-30T19:19:46Z'
branch: a-378-stop-requiring-multi-line-tsconfigeslintjson-include-arrays
author: rob@acmeskunkworks.io
co_authors: []
category: fix
breaking: false
issues:
  - A-378
  - A-620
merged_at: '2026-06-30T19:33:04Z'
commit: a4ee985
merge_strategy: squash
pr: 79
stats:
  loc_added: 111
  loc_removed: 1
  files_changed: 7
version: 1.1.1
---

## Fixed

- Add `tsconfigEslintJson` preset to `base` — disables four `jsonc/*` formatting
  rules for `**/tsconfig.eslint.json` that conflict with Prettier output
  (`array-bracket-newline`, `array-element-newline`, `object-curly-spacing`,
  `object-property-newline`). Consumers no longer need to exclude each
  `tsconfig.eslint.json` from Prettier.

## Added

- Vitest regression test with Prettier-formatted fixture under
  `infrastructure/tests/fixtures/`.
