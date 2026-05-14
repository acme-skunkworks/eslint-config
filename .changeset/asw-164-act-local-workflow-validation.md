---
---

ASW-164: add [`act`](https://github.com/nektos/act)-based local workflow validation, a pre-push `actionlint` + `yamllint` gate, and `gh run` triage scripts. Also includes a portability fix to `ci.yml`'s `yaml-lint` step so it runs under container-based runners. Developer-tooling only — no change to the published artifact.
