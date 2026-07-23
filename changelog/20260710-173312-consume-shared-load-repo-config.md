---
title: Consume shared load-repo-config reusable
release_note: CI and pkg-release now float reusable-load-repo-config.yml@v1; the local load-repo-config composite is deleted (A-779).
created_at: '2026-07-10T17:33:12Z'
branch: a-779-consume-shared-load-repo-config
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - A-779
merged_at: '2026-07-10T17:41:54Z'
commit: '3861195'
pr: 93
stats:
  loc_added: 27
  loc_removed: 133
  files_changed: 6
  commits: 1
version: 1.1.2
---

## Changed

- `ci.yml` / `pkg-release.yml` `config` jobs call
  `reusable-load-repo-config.yml@v1` instead of the local composite
  ([A-779](https://linear.app/acme-skunkworks/issue/A-779)).
- Deleted `.github/actions/load-repo-config/`.
