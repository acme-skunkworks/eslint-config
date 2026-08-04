---
title: Re-vendor send-it 0.7.0 and refresh AGENTS.md for merge commits
release_note: ''
created_at: '2026-08-03T21:18:00Z'
merged_at: '2026-08-03T21:04:02Z'
branch: a-1177-enable-estate-merge-commits-keep-squash-allowed-for-release
pr: 104
commit: d6e37e3
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - A-1177
stats:
  files_changed: 13
  loc_added: 271
  loc_removed: 162
  commits:
---

## Changed

**Estate merge-commit cutover ([A-1177](https://linear.app/rheged-studio/issue/A-1177))** — re-vendor `send-it` **0.7.0** (feature PRs use `gh pr merge --auto --merge`) and refresh `AGENTS.md` dual-merge policy from `shared-agents-md`. Fan-outs remain paused (A-809), so this is a manual one-shot.
