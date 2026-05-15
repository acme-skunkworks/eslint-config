# `infrastructure/`

Workflow logic extracted from `.github/workflows/*.yml` plus shared dev-tooling helpers. The goal is to make the non-trivial bits of CI runnable, testable, and reviewable in isolation — `act` exercises workflow _wiring_; this directory exercises workflow _logic_.

## Layout

```
infrastructure/
  scripts/                          # executable logic. one file = one purpose
    retitle-release-pr.ts           # extracted from .github/workflows/release.yml
    ensure-yamllint.sh              # extracted from .github/workflows/ci.yml
    ensure-actionlint.sh            # extracted from .github/workflows/ci.yml
    derive-changeset.ts             # used by /send-it (.claude/commands/send-it.md)
    publish-via-raw-npm.sh          # release.yml publish step (bypasses pnpm)
  tests/
    *.test.ts                       # vitest, run via `pnpm test`
    *.bats                          # bats-core, run via `pnpm test:sh`
    fixtures/                       # static inputs shared by tests
```

## Per-script language rule

- **Shell + bats** for CLI orchestration: `git`, `gh`, `jq`, `curl`, `pip`. No parsing, no branching beyond "does the tool exist / is the file there".
- **TypeScript + vitest** for parsing, branching, anything touching octokit, or anywhere types meaningfully reduce error surface.

If a script grows beyond ~20 lines of shell with conditionals, port it to TS.

## Conventions

- **Inputs via env, not argv.** Workflows pass values through `env:`; tests mock by passing an env object. Avoids shell quoting drama and keeps the test seam clean.
- **Pure functions exported for tests.** Each TS script exports the pure logic; `main()` wires it to real subprocesses. Tests import the pure function with a fake runner.
- **Scripts are idempotent.** Re-running them with the same inputs is safe (and is what the CI cache-hit path exercises).
- **Pinned versions live in env defaults**, not hard-coded. The workflow's cache key still hard-codes the version separately — match them.

## Running tests

```bash
pnpm test          # vitest run (CI)
pnpm test:watch    # vitest in watch mode
pnpm test:sh       # bats; locally prints install hint and exits 0 if bats is missing
pnpm lint:sh       # shellcheck; same skip-with-hint contract locally
```

CI runs all four unconditionally in the `infra` job.

## Adding a new script

1. Pick the language per the rule above.
2. Write it to `scripts/<name>.{ts,sh}`. For TS, export pure functions; for shell, keep it under ~20 lines.
3. Write the test in `tests/<name>.{test.ts,bats}`. Tests should cover every meaningful branch, not just the happy path.
4. `pnpm tsc` + `pnpm lint` + `pnpm test` + `pnpm test:sh` + `pnpm lint:sh` all green.
5. Wire it from the workflow as a one-liner: `run: pnpm tsx infrastructure/scripts/<name>.ts` or `run: bash infrastructure/scripts/<name>.sh`.

## Out of scope

- Sharing this directory across repos (e.g. with `markdownlint-config`). Decision deferred — establish the pattern first.
- Husky hooks. They stay in `.husky/`; non-trivial logic _inside_ them can be extracted here and called via a thin shim. None qualifies today.
