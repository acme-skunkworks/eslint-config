#!/usr/bin/env bash
# Publish the current package to npm via the upgraded npm at $PNPM_HOME/npm,
# bypassing `pnpm changeset publish`. Diagnosed in ASW-174: pnpm's publish
# path from inside `changesets/action` ends up failing OIDC Trusted Publishing
# even when `$PNPM_HOME` is on $PATH and `which npm` correctly resolves to
# npm 11.x. Calling npm directly works (PR #19 proved the npm-side flow when
# the workflow filename matches the TP allowlist on npmjs.com).
#
# Idempotent: if the package@version already exists on npm, exit 0 instead
# of re-publishing (which would 403/409). Lets release.yml retry safely
# after the version commit lands but before npm has the artifact.
#
# Inputs (all from env, set by the workflow):
#   PNPM_HOME — directory containing the upgraded npm binary
#
# Reads ./package.json for the package name and version.
set -euo pipefail

: "${PNPM_HOME:?PNPM_HOME is not set; pnpm/action-setup must run first}"

NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")

if "$PNPM_HOME/npm" view "$NAME@$VERSION" version >/dev/null 2>&1; then
  echo "Already published: $NAME@$VERSION — skipping."
  exit 0
fi

echo "Publishing $NAME@$VERSION via $PNPM_HOME/npm..."
"$PNPM_HOME/npm" publish --access public --provenance
