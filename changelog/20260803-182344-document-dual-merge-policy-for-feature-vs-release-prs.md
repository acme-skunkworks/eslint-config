---
title: Document dual merge policy for feature vs release PRs
release_note:
version: 1.1.3
created_at: '2026-08-03T18:23:44Z'
merged_at: '2026-08-03T20:03:02Z'
branch: a-1176-update-send-it-derive-bump-claudemd-adr-for-merge-commits
pr: 103
commit: 0d70d23
author: rob@acmeskunkworks.io
co_authors: []
category: docs
breaking: false
issues:
  - A-1176
stats:
  files_changed: 4
  loc_added: 38
  loc_removed: 8
  commits: 2
---

## Changed

- Updated `CLAUDE.md` release wording for dual merge policy: feature PRs land as merge commits; release-please ranks Conventional Commits on `main` ([A-824](https://linear.app/rheged-studio/issue/A-824)); Conventional PR titles stay CI-required but are no longer the sole post-merge bump signal; the orchestrator still squash-merges the release PR and fan-out stays squash ([A-1176](https://linear.app/rheged-studio/issue/A-1176)).
- Amended ADR-0002 with a short superseded note pointing at shared-agents-md ADR-0003 / [A-1176](https://linear.app/rheged-studio/issue/A-1176).
- Clarified the `ci.yml` `edited` comment so completeness still re-runs on title edits without treating the PR title as the sole bump signal.
