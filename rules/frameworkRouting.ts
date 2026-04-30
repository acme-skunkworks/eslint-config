import type { Linter } from "eslint";

/**
 * ESLint configuration for framework-based file routing patterns.
 *
 * Modern meta-frameworks (Next.js, React Router, Remix, SvelteKit, Astro, Nuxt)
 * use file-based routing where filenames are determined by routing conventions
 * rather than exported component names.
 *
 * This configuration disables rules that conflict with these patterns for files
 * in framework routing directories.
 * @see https://github.com/RobEasthope/protomolecule/issues/299
 */
export const frameworkRouting = {
  files: [
    "**/routes/**/*.{ts,tsx,js,jsx}",
    "**/app/**/*.{ts,tsx,js,jsx}",
    "**/pages/**/*.{ts,tsx,js,jsx}", // Next.js legacy routing
    "**/src/routes/**/*.{ts,tsx,js,jsx}", // SvelteKit pattern
    "**/src/pages/**/*.{ts,tsx,js,jsx}", // Astro pattern
  ],
  rules: {
    // Disable filename-match-exported for framework routing directories
    // File-based routing requires specific filenames (e.g., root.tsx, home.tsx)
    // that don't match exported component names (e.g., Layout, Home, meta)
    "canonical/filename-match-exported": "off",
  },
} satisfies Linter.Config;
