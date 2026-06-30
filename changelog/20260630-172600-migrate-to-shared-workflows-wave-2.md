---
title: Migrate eslint-config to shared-workflows (Wave 2 reference consumer)
release_note: >-
  Adopt SHA-pinned shared-workflows callers for CI (lint, build-test, PR title,
  Claude), the GO/NO GO gate, and pkg-release — first proven consumer for
  estate-wide rollout.
created_at: "2026-06-30T17:26:00Z"
branch: a-588-wave-2-eslint-config-first-proven-consumer-consolidated-pass
category: chore
breaking: false
issues:
  - A-588
  - A-430
  - A-592
  - A-456
stats:
  loc_added:
  loc_removed:
  files_changed:
---

## Changed

- Replace inline `ci.yml` jobs with `reusable-lint.yml` + `reusable-build-test.yml`
  callers and a local `GO/NO GO` aggregator (A-592).
- Extract PR-title validation to `validate-pr-title.yml` calling
  `reusable-validate-pr-title.yml`; thin callers for Claude workflows (A-430).
- Replace inline `release.yml` with `pkg-release.yml` calling
  `reusable-pkg-release.yml`; remove local publish scripts (A-456).
- Pin all shared-workflows refs to `v1.0.0` (`6cbcab65…`).
