import type { Linter } from "eslint";

/**
 * Opt-in. Pull in for repos with orchestration / maintenance scripts under
 * `scripts/**`.
 *
 * Complexity overrides for file patterns where a cyclomatic-complexity exemption
 * is structural rather than a code smell.
 *
 * Currently only covers maintenance/orchestration scripts, which tend to run many
 * steps linearly; splitting them obscures flow more than it helps. Threshold raised to 40.
 *
 * Consumers with their own structural-complexity hot spots (e.g. file-routed view
 * components that mirror a sibling) can extend this preset locally.
 *
 * Ported from Tempest's `studioTables` + `complexity` lineage. See the eslint-config
 * repo's `MIGRATION_FROM_PROTOMOLECULE.md` "Tempest fold-in deltas" section.
 */
export const complexity: Linter.Config[] = [
  {
    files: ["**/scripts/**/*.{ts,tsx,js,mjs}"],
    rules: {
      complexity: ["error", 40],
    },
  } satisfies Linter.Config,
];
