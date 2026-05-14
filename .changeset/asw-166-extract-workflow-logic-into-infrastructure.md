---
---

ASW-166: extract the non-trivial shell from `.github/workflows/*.yml` into `infrastructure/scripts/` and cover it with vitest + bats. `release.yml`'s changeset-PR retitle step and `ci.yml`'s yamllint/actionlint install dances each collapse to a one-line invocation of a tested script. Migrates `scripts/send-it/derive-changeset.mjs` to `infrastructure/scripts/derive-changeset.ts` with the same `selfTest()` cases ported to vitest. Adds `pnpm test`, `pnpm test:sh`, `pnpm lint:sh`, plus a sibling `infra` CI job. Developer-tooling only — no change to the published artifact.
