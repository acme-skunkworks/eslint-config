---
---

ASW-168: install agent skills from the [skills.sh](https://www.skills.sh) registry. Bootstrapped with [`find-skills`](https://www.skills.sh/vercel-labs/skills/find-skills), then swept the repo for follow-up candidates and installed: `xixu-me/skills@github-actions-docs`, `antfu/skills@pnpm`, `antfu/skills@vitest`, `wshobson/agents@shellcheck-configuration`, `mattpocock/skills@tdd`, `mattpocock/skills@diagnose`, `mattpocock/skills@grill-me`, and `mattpocock/skills@grill-with-docs`. All scoped to `claude-code`, `cursor`, and `universal` (the cross-agent `.agents/skills/` location). Vendored with `--copy` so the skill files live in the repo and survive a fresh clone without `npm install`. Developer-tooling only — no change to the published artifact.
