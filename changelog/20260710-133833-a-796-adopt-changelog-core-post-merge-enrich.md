---
title: "Adopt changelog-core and in-repo post-merge enrich"
release_note: "Replace vendored changelog scripts with @acme-skunkworks/changelog-core and wire reusable-changelog-enrich (mode: finalise) into pkg-release.yml for post-merge metadata + version stamp (A-796 canary)."
created_at: "2026-07-10T13:38:33Z"
merged_at:
branch: "a-796-phase-2-canary-byte-parity-on-one-npm-target-eslint-config"
pr:
commit:
author: "rob@acmeskunkworks.io"
co_authors: []
category: chore
breaking: false
issues: ["A-796"]
stats:
  files_changed:
  loc_added:
  loc_removed:
  commits:
---

## Changed

- **Validate / completeness** now run via `pnpm exec changelog-core` — vendored `infrastructure/scripts/*changelog*.ts` and tests removed.
- **`pkg-release.yml`** gains a `changelog-enrich` sibling job (`mode: finalise`, `secrets: inherit`) calling `reusable-changelog-enrich.yml` (A-821 pin) so post-merge fields and release `version` stamps land in-repo as `road-runner-bot[bot]`.

## Fixed

N/A — canary adoption of the shared enricher path (parity vs the orchestrator inline finalise is the A-796 gate).
