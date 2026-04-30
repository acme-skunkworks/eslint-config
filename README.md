# @acme-skunkworks/eslint-config

Single npm package providing named-export ESLint rule sets. WIP — see Linear project `eslint-config` for the build-out.

```js
// consumer eslint.config.js
import { base, react, sanity } from '@acme-skunkworks/eslint-config'
export default [...base, ...react, ...sanity]
```

## `/send-it` Claude slash command

This repo is also the canonical home for the `/send-it` Claude slash command — the developer-tooling command that bundles uncommitted work, writes a changeset, opens (or updates) a PR, and transitions linked Linear issues to **In Review**.

- Command spec: [`.claude/commands/send-it.md`](./.claude/commands/send-it.md)
- Supporting scripts: [`scripts/send-it/`](./scripts/send-it/)

### Vendoring `/send-it` into another project

`/send-it` is **not** an npm-published package. To consume it in another repo, copy the files in:

```sh
# from another project's root, with this repo checked out alongside
cp -r ../eslint-config/.claude/commands/send-it.md   ./.claude/commands/send-it.md
cp -r ../eslint-config/scripts/send-it               ./scripts/send-it
```

Then adapt the per-project specifics:

- The package name in the changeset frontmatter (default: `@acme-skunkworks/eslint-config`).
- The Linear team name (default: `ACME Skunkworks`) and team key prefix (default: `ASW`) used to extract issue references from branch names and commits.
- The bump-level mapping if your project uses different commit conventions.

Re-vendor periodically by re-copying. Cross-repo symlinks are fragile and not recommended.
