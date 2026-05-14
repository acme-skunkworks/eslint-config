---
---

ASW-168: install the [`find-skills`](https://www.skills.sh/vercel-labs/skills/find-skills) agent skill from the [skills.sh](https://www.skills.sh) registry, scoped to `claude-code`, `cursor`, and `universal` (the cross-agent `.agents/skills/` location). Vendored with `--copy` so the `SKILL.md` files live in the repo and survive a fresh clone without `npm install`. Developer-tooling only — no change to the published artifact.
