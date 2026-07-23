---
title: Bump Claude-pair caller pins to v1.0.2
release_note: ''
created_at: '2026-07-01T13:01:58Z'
branch: a-626-eslint-config-bump-claude-pair-caller-pins-v100-v102-pilot
category: chore
breaking: false
issues:
  - A-626
  - A-623
merged_at: '2026-07-01T13:07:49Z'
commit: 0e6fe2f
pr: 81
stats:
  loc_added: 23
  loc_removed: 2
  files_changed: 3
  commits: 2
version: 1.1.2
---

## Changed

- Bump both `claude.yml` and `claude-code-review.yml` reusable-workflow pins
  from `v1.0.0` (`6cbcab65…`) to `v1.0.2` (`9febdb14…`). `v1.0.0` shipped a
  top-level `concurrency:` in `reusable-claude-code-review.yml` that
  deadlock-cancelled every caller's run at startup; shared-workflows PR #21
  removed it ([A-621](https://linear.app/acme-skunkworks/issue/A-621)).
- Pilot for the estate-wide rollout of the canonical Claude-pair caller pattern
  ([A-623](https://linear.app/acme-skunkworks/issue/A-623)).
