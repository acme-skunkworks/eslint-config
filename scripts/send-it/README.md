# `scripts/send-it/`

Supporting scripts for the [`/send-it` Claude slash command](../../.claude/commands/send-it.md).

## Layout decision (ASW-73)

`/send-it` lives at `.claude/commands/send-it.md` plus this directory — the slash command does the orchestration in markdown, this directory owns the deterministic helpers it shells out to. This is option 2 from ASW-73 and the recommended starting shape.

## What's here

- **`derive-changeset.mjs`** — given the current branch and the commits ahead of `origin/main` (or local `main` if no remote), prints JSON with the proposed `.changeset/<slug>.md` filename, bump level, and a draft body. The slash command calls this in Step 5 to keep slug + bump derivation deterministic and testable.
  - Run end-to-end: `node scripts/send-it/derive-changeset.mjs`
  - Run unit tests: `node scripts/send-it/derive-changeset.mjs --self-test`

## Bump heuristic

`derive-changeset.mjs` derives the bump level in this order (first match wins):

1. Any commit subject matches `^[a-z]+(\([^)]+\))?!:` **or** any commit body contains `BREAKING CHANGE:` → `major`.
2. First commit's subject starts with `feat:` or `feat(<scope>):` → `minor`.
3. Otherwise → `patch`.

If your project uses different commit conventions, edit `deriveBump` in `derive-changeset.mjs` and update the matching test cases in `selfTest`.
