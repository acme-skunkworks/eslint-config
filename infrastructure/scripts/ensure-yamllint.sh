#!/usr/bin/env bash
# Ensure `yamllint` is on PATH, install it via pip --user if not, then run it
# against the repo root. Designed to be portable across:
#   - real `ubuntu-latest` GHA runners (yamllint not pre-installed; --user
#     installs are whitelisted; ~/.local/bin pre-added to PATH)
#   - catthehacker/ubuntu (used by `act` locally; Ubuntu 24.04 / Python 3.12
#     enforces PEP 668 — hence --break-system-packages — and runs as root, so
#     ~/.local/bin is not on PATH by default).
#
# Cache: the GHA workflow caches ~/.local on the yamllint version key. When
# the cache hits, `yamllint` is already on disk under ~/.local/bin, so the
# install branch is skipped on the second run onwards.
#
# Env:
#   YAMLLINT_VERSION  — pinned version (default 1.37.1). Match the cache key
#                       in .github/workflows/ci.yml.
#   GITHUB_PATH       — set by GHA; the export propagates ~/.local/bin to
#                       subsequent steps. Local invocations leave it unset.

set -euo pipefail

YAMLLINT_VERSION="${YAMLLINT_VERSION:-1.37.1}"

if ! command -v yamllint >/dev/null 2>&1; then
  pip install --user --break-system-packages "yamllint==${YAMLLINT_VERSION}"
  if [ -n "${GITHUB_PATH:-}" ]; then
    echo "$HOME/.local/bin" >> "$GITHUB_PATH"
  fi
  export PATH="$HOME/.local/bin:$PATH"
fi

yamllint .
