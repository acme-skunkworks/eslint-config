import type { Linter } from "eslint";

/**
 * Opt-in. Pull in for projects using TanStack Table or Refine (column-cell
 * renderers in `*Table.tsx` files).
 *
 * ESLint override for table cell-renderer components.
 *
 * TanStack Table / Refine column definitions require inline cell renderer
 * components by API design. The re-mount concern that
 * `react/no-unstable-nested-components` guards against does not apply here
 * because column defs are memoised by the library.
 *
 * Ported from Tempest's `studioTables` preset. Generalised: Studio-specific
 * filename globs (`list.tsx`, `duplicates.tsx`, `LookupList.tsx`) were dropped;
 * `**\/*Table.tsx` survives as the broadly-useful glob.
 */
export const tableComponents = {
  files: ["**/*Table.tsx"],
  rules: {
    "react/no-unstable-nested-components": "off",
  },
} satisfies Linter.Config;
