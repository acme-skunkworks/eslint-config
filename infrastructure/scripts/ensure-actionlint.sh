#!/usr/bin/env bash
# Ensure the pinned `actionlint` binary exists at ./actionlint, downloading it
# via the project's official bootstrap script if missing, then run it against
# .github/workflows/*. The GHA workflow caches ./actionlint on the version
# key so the download branch is normally skipped on subsequent runs.
#
# Env:
#   ACTIONLINT_VERSION  — pinned version (default 1.7.5). Match the cache key
#                         in .github/workflows/ci.yml.

set -euo pipefail

ACTIONLINT_VERSION="${ACTIONLINT_VERSION:-1.7.5}"

if [ ! -x ./actionlint ]; then
  DOWNLOAD_URL="https://raw.githubusercontent.com/rhysd/actionlint/v${ACTIONLINT_VERSION}/scripts/download-actionlint.bash"
  bash <(curl -fsSL "$DOWNLOAD_URL")
fi

./actionlint -color
