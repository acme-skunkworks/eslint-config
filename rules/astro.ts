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
  // eslint-plugin-astro flat/recommended — upstream preset (parser, env, core astro rules).
  // https://github.com/ota-meshi/eslint-plugin-astro#configuration
  ...configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    rules: {
      // astro/no-set-html-directive — disallows `set:html` (XSS risk) in favour of safer patterns.
      // Error: we treat unsanitised HTML injection as a hard failure in Astro templates.
      // https://ota-meshi.github.io/eslint-plugin-astro/rules/no-set-html-directive/
      "astro/no-set-html-directive": "error",
      // import/no-unresolved — reports imports that cannot be resolved to a file on disk.
      // Error with ignore patterns: Astro virtual modules, path aliases, and .astro imports are valid but opaque to the resolver.
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-unresolved.md
      "import/no-unresolved": [
        "error",
        {
          ignore: ["^astro:", "^@/", "\\.astro$"],
        },
      ],
    },
  } satisfies Linter.Config,
];
