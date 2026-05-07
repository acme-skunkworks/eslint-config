---
"@acme-skunkworks/eslint-config": patch
---

Skip the `CI / 🔬 Build & Lint` and `Claude Code Review` workflows on `changeset-release/*` PRs (the auto-generated "release: version packages" PR). Both jobs add no value on a generated version bump and were burning CI minutes plus Claude credits. CI tooling only — no runtime change for consumers.
