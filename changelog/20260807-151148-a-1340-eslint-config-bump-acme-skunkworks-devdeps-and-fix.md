---
title: "Bump sibling @acme-skunkworks packages and fix markdownlint 3.x fallout"
release_note: ""
created_at: "2026-08-07T15:11:48Z"
merged_at:
branch: a-1340-eslint-config-bump-acme-skunkworks-devdeps-and-fix-lint
pr:
commit:
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - A-1340
stats:
  files_changed:
  loc_added:
  loc_removed:
  commits:
---

## Changed

**Bump sibling @acme-skunkworks packages and fix markdownlint 3.x fallout ([A-1340](https://linear.app/rheged-studio/issue/A-1340))**

- Raise `@acme-skunkworks/markdownlint-config` to `^3.0.0`, `@acme-skunkworks/changelog-core` to `^1.1.1`, and `@acme-skunkworks/commitlint-config` to `^1.0.1` (leave self at 1.1.3)
- Exclude vendored `.claude/skills/**` and `.agents/skills/**` from markdownlint (cli2 ignores, `lint:md` globs, and CI `markdown-globs`) so skill bundles stay byte-identical
- Correct first-party MD040/MD044 findings in `AGENTS.md`, `CLAUDE.md`, and `infrastructure/README.md`
