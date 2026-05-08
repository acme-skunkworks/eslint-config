import type { Linter } from "eslint";
import { configs } from "eslint-plugin-astro";

/**
 * Opt-in. Pull in for projects using Astro (`astro` dep, `*.astro` files).
 *
 * Spreads `eslint-plugin-astro/flat/recommended` and adds an Astro-specific
 * import-resolver allowlist for the patterns ESLint's static resolver can't
 * follow: `astro:*` virtual modules (`astro:content`, `astro:assets`), the
 * `@/` tsconfig path alias, and direct `.astro` file imports.
 */
export const astro: Linter.Config[] = [
  ...configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    rules: {
      "astro/no-set-html-directive": "error",
      // Ignore imports that ESLint's static resolver can't handle in Astro files
      "import/no-unresolved": [
        "error",
        {
          ignore: [
            "^astro:", // Astro virtual modules (astro:content, astro:assets, etc.)
            "^@/", // Path aliases defined in tsconfig (e.g., @/components)
            "\\.astro$", // .astro file imports (Astro's custom file format)
          ],
        },
      ],
    },
  } satisfies Linter.Config,
];
