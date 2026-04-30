import type { Linter } from "eslint";
import { configs } from "eslint-plugin-astro";

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
