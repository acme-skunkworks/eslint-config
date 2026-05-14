---
---

Spec tweak to `/send-it`: widen the non-shippable paths rule (Step 5.4) to include `.agents/` and `skills-lock.json` alongside the existing `.claude/`, so that skill-only branches (installs via `npx skills add --copy`) don't trip the changeset prompt. Developer-tooling only — no change to the published artifact.
