---
"@acme-skunkworks/eslint-config": patch
---

Ship `eslint-import-resolver-typescript` and `prettier-plugin-tailwindcss` as runtime `dependencies`. Both are referenced statically by the default `preferences` preset, so consumers were crashing at lint time with `Cannot find module` when the package was installed without dev dependencies.
