#!/usr/bin/env bash
# Publish the current package to GitHub Packages (npm.pkg.github.com).
#
# Decoupled from the changesets `published` output, which is unreliable here:
# since ASW-174 we publish to npm via publish-via-raw-npm.sh (raw `npm publish`),
# whose stdout doesn't match the changesets "🦋  info Published" pattern, so
# changesets/action sets published=false and the old
# `if: steps.changesets.outputs.published == 'true'` gate skipped this leg on
# every run (ASW-307).
#
# Relies on the preceding actions/setup-node (GitHub Packages) step having
# written .npmrc with the scoped registry + auth token; auth comes from
# NODE_AUTH_TOKEN in the step env. Unlike the npm leg this needs no OIDC, so
# plain `npm` (token auth works on any npm version) and no --provenance.
#
# Idempotent: if package@version already exists on GitHub Packages, exit 0
# instead of re-publishing (which would 409). The gate is gone, so this runs on
# every push to main — idempotency keeps non-release pushes and retries safe.
#
# Reads ./package.json for the package name and version.
set -euo pipefail

NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")

if npm view "$NAME@$VERSION" version >/dev/null 2>&1; then
  echo "Already published to GitHub Packages: $NAME@$VERSION — skipping."
  exit 0
fi

echo "Publishing $NAME@$VERSION to GitHub Packages..."
npm publish --access public
