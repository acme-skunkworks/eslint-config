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
# written .npmrc with the auth token; auth comes from NODE_AUTH_TOKEN in the
# step env. Unlike the npm leg this needs no OIDC, so plain `npm` (token auth
# works on any npm version) and no --provenance.
#
# Idempotent: if package@version already exists on GitHub Packages, exit 0
# instead of re-publishing (which would 409). The gate is gone, so this runs on
# every push to main — idempotency keeps non-release pushes and retries safe.
#
# Inputs (all from env, set by the workflow):
#   NODE_AUTH_TOKEN              — GitHub Packages auth (the GITHUB_TOKEN); read
#                                  from .npmrc by npm
#   GITHUB_PACKAGES_REGISTRY_URL — registry to target, from
#                                  infrastructure/repo-config.yaml (ASW-176)
#
# Reads ./package.json for the package name and version.
set -euo pipefail

: "${NODE_AUTH_TOKEN:?NODE_AUTH_TOKEN is not set; actions/setup-node (GitHub Packages) must run first}"
: "${GITHUB_PACKAGES_REGISTRY_URL:?GITHUB_PACKAGES_REGISTRY_URL is not set; pass it from infrastructure/repo-config.yaml}"

NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")

# Pin the registry explicitly rather than leaning on setup-node's scoped
# .npmrc: a misconfigured scope would silently send `npm view` to public npm —
# where the version exists — so the skip path would fire forever and GitHub
# Packages would go permanently stale. ASW-307 review.
if npm view "$NAME@$VERSION" version --registry "$GITHUB_PACKAGES_REGISTRY_URL" >/dev/null 2>&1; then
  echo "Already published to GitHub Packages: $NAME@$VERSION — skipping."
  exit 0
fi

echo "Publishing $NAME@$VERSION to GitHub Packages..."
npm publish --access public --registry "$GITHUB_PACKAGES_REGISTRY_URL"
