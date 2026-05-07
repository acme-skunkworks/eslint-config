---
"@acme-skunkworks/eslint-config": patch
---

Add local git hooks (husky + lint-staged) covering pre-commit auto-fix (prettier, eslint on TS and `package.json`, sort-package-json, markdownlint), a `Co-Authored-By: Claude` commit-message trailer strip, and a direct-push-to-`main` block. Each pre-commit task is now scoped to staged files only. Also adds `sort-package-json` as an explicit devDep so the hook works offline, and ignores `CHANGELOG.md` in prettier so the hook doesn't ping-pong against markdownlint. Tooling only — no runtime change for consumers.
