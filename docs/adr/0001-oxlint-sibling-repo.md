# Investigate oxlint-based sibling repo

**Status:** proposed
**Linear:** [ASW-223](https://linear.app/acme-skunkworks/issue/ASW-223)

This ADR investigates whether to spin up a sibling repository derived from `@acme-skunkworks/eslint-config` that replaces ESLint with [oxlint](https://oxc.rs/docs/guide/usage/linter.html). It documents the trade-offs and considered options; the proceed / defer / reject decision is deferred to PR review on this ADR.

## Context

`@acme-skunkworks/eslint-config` is a thin ESLint v9 flat-config composer. Its value is not the lint engine but the **curation**: which rules are on, which are off, and the composition order that makes them play together. Concretely:

- The `base` preset stacks a plugin-alias hack, global ignores, `eslint-config-canonical/auto` (which transitively wires `eslint-plugin-import-x`, `react`, `react-hooks`, `jsx-a11y`, `unicorn`, `regexp`, `n`, `promise`, `jsdoc`), then `packageJson`, `commonjs`, and `preferences` (`index.ts:35-44`).
- Composition order is load-bearing: `reactRouterExceptions` must come after `preferences` for React Router 7's typed exports, and `eslint-plugin-import-x` is registered under both `import` and `import-x` so canonical's rule references resolve (`index.ts:22-27`, `index.ts:60-63`).
- The repo is itself a recent extraction (May 2026, from `RobEasthope/protomolecule`). The question "should we extract again, this time for oxlint" is live, but the extraction tax was just paid; doing it again has real cost.

Oxlint is a Rust-based linter (Oxc project, v1.0 stable since August 2025, VoidZero-backed). It markets ~50–100× speed over ESLint, ships ~800 rules across ported plugins (TS, React, Vitest, import, jsx-a11y, unicorn, etc.), has a maintained VS Code extension, and introduced an alpha JS Plugins API in March 2026 for custom rules.

## Capability matrix

| Surface                                                         | Oxlint coverage | Notes                                                                                                                                                                   | Partition verdict (Option D)                         |
| --------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `eslint-config-canonical` (~47 curated rules)                   | ❌              | No port; rules unique to canonical have no oxlint equivalent                                                                                                            | **ESLint-owns**                                      |
| `eslint-plugin-import-x` (incl. `import` alias hack)            | ✅              | Oxlint ships an `import` plugin with broad parity                                                                                                                       | Oxlint-owns (overlap to dedupe)                      |
| `eslint-plugin-react` / `react-hooks`                           | ✅              | Both ported natively                                                                                                                                                    | Oxlint-owns                                          |
| `eslint-plugin-jsx-a11y`                                        | ✅              | Ported                                                                                                                                                                  | Oxlint-owns                                          |
| `eslint-plugin-unicorn`, `regexp`, `n`, `promise`, `jsdoc`      | ✅ partial      | Most rules ported; gaps exist per plugin — needs per-rule audit                                                                                                         | Oxlint-owns (with ESLint fallback for missing rules) |
| `typescript-eslint`                                             | ✅              | Type-aware checks via `oxlint-tsgolint`; non-type-aware native                                                                                                          | Oxlint-owns                                          |
| `eslint-plugin-package-json`                                    | ❌              | No oxlint equivalent for `**/package.json` linting                                                                                                                      | **ESLint-owns**                                      |
| `eslint-plugin-astro` (`.astro` template body)                  | ⚠️              | Only embedded `<script>` JS lints; template not parsed ([discussion #19249](https://github.com/oxc-project/oxc/discussions/19249))                                      | **ESLint-owns**                                      |
| MDX template bodies                                             | ⚠️              | Same shape as Astro: JS portions only                                                                                                                                   | **ESLint-owns**                                      |
| Storybook / Sanity / e2e / tableComponents / complexity opt-ins | ⚠️              | Most are rule-level disables / file-glob overrides — possible in oxlint config, but per-rule mapping required                                                           | Either                                               |
| Composition order (`reactRouterExceptions` after `preferences`) | ⚠️              | Oxlint config uses `extends` + override blocks; not flat-config; semantics differ                                                                                       | **ESLint-owns** (in any partition that retains it)   |
| Plugin alias (`import` ⇄ `import-x`)                            | n/a             | Oxlint's `import` plugin doesn't have the dual-name problem                                                                                                             | Resolved by partition                                |
| `eslint --fix --cache` (used by `lint-staged`)                  | ✅              | `oxlint --fix` works; cache behaviour differs (no `.eslintcache` equivalent — oxlint is fast enough that caching is less relevant)                                      | Oxlint-owns                                          |
| VS Code extension                                               | ✅              | `oxc.oxc-vscode`, LSP-based, maintained                                                                                                                                 | n/a                                                  |
| Custom rule authoring (porting canonical)                       | ⚠️ alpha        | JS Plugins API entered alpha March 2026; ESLint-compatible plugin shape; explicitly unstable                                                                            | Avoided in Option D                                  |
| Rule-overlap deduplication                                      | ❓ open         | Oxlint supports rule-level disable; needs verification that disabling oxlint's React rules in favour of ESLint's (or vice versa) works cleanly without double-reporting | Open question for Option D                           |

## Considered Options

### A. New oxlint sibling repo (e.g. `@acme-skunkworks/oxlint-config`)

Fork the intent — shared org lint standards — into an independent repo with its own `.oxlintrc.json` presets, semver, and Trusted Publisher. ESLint config stays canonical for existing consumers. The published bootstrap docs in `CLAUDE.md` (recovery codes, first-publish 2FA dance) apply unchanged.

**Cost concentrates in custom-rule porting.** Canonical's ~47 rules would either need to be re-implemented via oxlint's JS Plugins API (alpha) or dropped. Without canonical's curation, an oxlint preset would be "oxlint defaults + a few overrides" — a thinner value proposition than the ESLint repo offers today.

### B. Defer

No sibling repo, no migration. Revisit when (a) JS Plugins reaches stable, (b) something covers `package.json` linting, and (c) `.astro` template parsing lands. Track those gates in a follow-up issue.

### C. Reject outright

Treat curation as the durable moat and oxlint as an engine swap that doesn't address our value driver. Closes the door on revisiting unless market conditions shift materially.

### D. Hybrid — partition by capability (oxlint primary, ESLint for gaps)

Oxlint becomes the **primary linter** for everything it already covers natively (TS, React, hooks, jsx-a11y, import, unicorn, regexp, the bulk of the JS/TS hot path). ESLint stays in place only for what oxlint can't do today:

- canonical's ~47 curated rules (keep the moat without porting),
- `eslint-plugin-package-json`,
- `.astro` template bodies and MDX templates,
- the framework-routing overrides that depend on flat-config composition order.

**Pros.** Captures the perf win on the bulk of code without depending on alpha JS Plugins. Preserves canonical's curation where it works. Incremental: consumers can adopt oxlint piecewise and the ESLint preset shrinks naturally as oxlint closes gaps.

**Cons.** Two configs to maintain. Rule overlap must be deduplicated (oxlint's `react/*` vs ESLint's `react/*` — pick one source of truth per rule). Consumer DX: `pnpm lint` chains both; lint-staged needs an explicit order; editors need both extensions installed. Possibly two npm packages (one preset per linter) or one package exporting two preset surfaces.

**Open questions for Option D specifically.**

- Does oxlint's `disable` mechanism cleanly suppress rules we want ESLint to own, without re-enabling them via `extends`? Needs a smoke test.
- Lives in this repo (export an `oxlint` preset alongside the ESLint presets) or in a sibling repo? The former lets shared rule docs and `MIGRATION_FROM_PROTOMOLECULE.md` stay co-located; the latter keeps the two surfaces independently versioned.
- What's the editor story when both linters run? VS Code surfacing both diagnostics is fine; the risk is users disabling one for noise and silently losing coverage.

### D-alt. Hybrid — dual-run for confidence

Run oxlint and ESLint over the same files during a transition, accepting the operational cost in exchange for catching regressions. Worth naming, but only as a transitional posture toward eventual oxlint-only — not a steady state.

## Decision

**Open.** This ADR documents the trade-offs; the proceed / defer / reject call is made at PR review. The capability matrix above and the per-option trade-offs are the gating evidence. Option D (partition by capability) is the most concrete and most attractive variant on current evidence; Options A and B are the next most defensible; C is the strongest position if curation is treated as the durable moat.

## Consequences

- **For consumers:** nothing changes; this is investigation only.
- **If we proceed (A or D):** follow-up issues to scope are at minimum (1) sibling repo or in-repo `oxlint` preset bootstrap; (2) per-rule overlap audit deciding `oxlint-owns` vs `ESLint-owns` for each shared rule; (3) consumer migration / dual-linter ergonomics; (4) lint-staged + editor extension story; (5) if A specifically, npm Trusted Publisher setup and bootstrap publish following the existing `CLAUDE.md` recipe.
- **If we defer (B):** gating conditions to watch are JS Plugins stable, `package.json` linting parity, `.astro` template support.
- **If we reject (C):** none — this repo continues unchanged.

## References

- Repo architecture: `CLAUDE.md`, `index.ts`, `rules/`, `MIGRATION_FROM_PROTOMOLECULE.md`
- ADR format: `.claude/skills/grill-with-docs/ADR-FORMAT.md`
- Oxlint overview: <https://oxc.rs/docs/guide/usage/linter.html>
- Oxlint rules index: <https://oxc.rs/docs/guide/usage/linter/rules.html>
- Oxlint config: <https://oxc.rs/docs/guide/usage/linter/config.html>
- JS Plugins alpha announcement (March 2026): <https://oxc.rs/blog/2026-03-11-oxlint-js-plugins-alpha>
- Astro support tracking: <https://github.com/oxc-project/oxc/discussions/19249>
- VS Code extension: <https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode>
