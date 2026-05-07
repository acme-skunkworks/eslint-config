---
"@acme-skunkworks/eslint-config": patch
---

Add `actionlint` and `yamllint` validation for `.github/workflows/*.{yml,yaml}` and YAML across the repo. Wired into both the pre-commit hook (best-effort: skips with a `brew install …` hint when the tool isn't on `PATH`; semantic errors block commits, warnings don't) and a new parallel `yaml-lint` CI job (always enforced; both tools cached, pinned to `actionlint v1.7.5` and `yamllint 1.37.1`). Adds `lint:yaml` and `lint:workflows` scripts plus `.yamllint.yml` at the repo root. Tooling only — no runtime change for consumers.
