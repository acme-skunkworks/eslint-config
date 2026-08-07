---
title: Add npm ecosystem to Dependabot with Conventional commit prefixes
release_note:
version: 1.1.3
created_at: '2026-07-28T15:13:50Z'
merged_at: '2026-07-28T16:05:55Z'
branch: a-980-dependabot-conventional-commit-templates
pr: 99
commit: 95a6c26
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - A-980
stats:
  files_changed: 2
  loc_added: 60
  loc_removed: 0
  commits: 3
---

## Added

- An `npm` package ecosystem in `.github/dependabot.yml`
  ([A-980](https://linear.app/rheged-studio/issue/A-980)), grouped weekly so one lockfile
  churn lands or reverts atomically. Its `commit-message` template sets `prefix`,
  `prefix-development` and `include: scope`, so bumps read `chore(deps): …` and
  `chore(deps-dev): …`. Setting both prefixes matters: `prefix` alone leaves
  development-dependency bumps on Dependabot's own default subject, which is not
  Conventional and would fail the commit gate once it becomes a required check.

## Notes

- The existing `github-actions` ecosystem is deliberately **unchanged**: its `prefix: "ci"`
  already produces `ci(deps): …`, which is Conventional, semantically accurate for workflow
  bumps, and consistent across the estate. `chore` is reserved for the npm ecosystem so the
  two remain distinguishable; both are no-release types, so neither cuts a version alone.
- Until now this repo had no npm ecosystem at all, so its dev toolchain was never bumped by
  Dependabot.
- Delivers the npm-ecosystem half of [A-175](https://linear.app/rheged-studio/issue/A-175), which had been sitting in the backlog.
