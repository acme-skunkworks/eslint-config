import type { Linter } from "eslint";

/**
 * ESLint configuration for Sanity schema files (*.schema.ts)
 *
 * Enforces consistent property ordering in defineField() and defineType() calls
 * using eslint-plugin-perfectionist's sort-objects rule.
 *
 * Property ordering follows a logical grouping:
 * 1. Identity: name, title, type, icon
 * 2. Organization: fieldset, group, groups, fieldsets
 * 3. Behavior: hidden, readOnly
 * 4. Type-specific: options, rows, to, of, marks, styles
 * 5. Content defaults: initialValue, description
 * 6. Document-level: preview, orderings
 * 7. Validation: validation
 * 8. Fields: fields (always last for document types)
 * @see https://perfectionist.dev/rules/sort-objects
 * @see https://www.sanity.io/docs/schema-field-types
 */
const sanitySchemaPropertyOrdering = {
  files: ["**/*.schema.ts"],
  rules: {
    "perfectionist/sort-objects": [
      "error",
      {
        customGroups: [
          // 1. Identity - what is this field/type?
          { elementNamePattern: "^name$", groupName: "name" },
          { elementNamePattern: "^title$", groupName: "title" },
          { elementNamePattern: "^type$", groupName: "type" },
          { elementNamePattern: "^icon$", groupName: "icon" },

          // 2. Fields array (always last for document types - it's the bulk of the schema)
          { elementNamePattern: "^fields$", groupName: "fields" },

          // 3. Organization - where does it go?
          { elementNamePattern: "^fieldset$", groupName: "fieldset" },
          { elementNamePattern: "^group$", groupName: "group" },
          { elementNamePattern: "^groups$", groupName: "groups" },
          { elementNamePattern: "^fieldsets$", groupName: "fieldsets" },

          // 4. Behavior - how does it behave?
          { elementNamePattern: "^hidden$", groupName: "hidden" },
          { elementNamePattern: "^readOnly$", groupName: "readOnly" },

          // 5. Type-specific options
          { elementNamePattern: "^options$", groupName: "options" },
          { elementNamePattern: "^rows$", groupName: "rows" },
          { elementNamePattern: "^to$", groupName: "to" },
          { elementNamePattern: "^of$", groupName: "of" },
          { elementNamePattern: "^marks$", groupName: "marks" },
          { elementNamePattern: "^styles$", groupName: "styles" },

          // 6. Content defaults
          { elementNamePattern: "^initialValue$", groupName: "initialValue" },
          { elementNamePattern: "^description$", groupName: "description" },

          // 7. Validation (often longest, so near the end)
          { elementNamePattern: "^validation$", groupName: "validation" },

          // 8. Document-level
          { elementNamePattern: "^preview$", groupName: "preview" },
          { elementNamePattern: "^orderings$", groupName: "orderings" },
        ],
        groups: [
          // Identity
          "name",
          "title",
          "type",
          "icon",
          // Fields
          "fields",
          // Organization
          "fieldset",
          "group",
          "groups",
          "fieldsets",
          // Behavior
          "hidden",
          "readOnly",
          // Type-specific
          "options",
          "rows",
          "to",
          "of",
          "marks",
          "styles",
          // Content defaults
          "initialValue",
          "description",
          // Validation
          "validation",

          // Document-level
          "preview",
          "orderings",
          // Everything else (sorted alphabetically)
          "unknown",
        ],
        // Use alphabetical sorting within "unknown" group, but group ordering takes precedence
        type: "alphabetical",
      },
    ],
  },
} satisfies Linter.Config;

/**
 * ESLint configuration for Sanity Studio structure files
 *
 * Sanity structure files (structure.ts, deskStructure.ts) use specific conventions
 * that conflict with standard ESLint rules:
 *
 * 1. Arrow functions assigned to constants (standard Sanity pattern):
 *    export const structure: StructureResolver = (S) => S.list()...
 *
 * 2. Single-letter `S` parameter (Sanity StructureBuilder convention):
 *    The `S` parameter is universally used in Sanity documentation
 *    and examples to represent the StructureBuilder object.
 * @see https://github.com/RobEasthope/protomolecule/issues/365
 * @see https://www.sanity.io/docs/structure-builder-introduction
 */
const sanityStructure = {
  files: ["**/sanity.structure.ts", "**/deskStructure.ts"],
  rules: {
    "func-style": "off",
    "id-length": "off",
  },
} satisfies Linter.Config;

/**
 * Combined Sanity ESLint configurations
 *
 * Exports an array containing all Sanity-related ESLint configs:
 * - Schema property ordering for *.schema.ts files
 * - Structure file exceptions for structure.ts and deskStructure.ts
 */
export const sanity = [sanitySchemaPropertyOrdering, sanityStructure];
