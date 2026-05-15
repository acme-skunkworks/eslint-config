#!/usr/bin/env bash
# Ensure the pinned `bats` is on PATH, installing bats-core from its GitHub
# release tarball under $HOME/.local if absent or at the wrong version. The
# GHA workflow caches $HOME/.local on the version key so the install branch
# is skipped on subsequent runs.
#
# Why pin: bats-core has had breaking syntax changes between majors. The
# previous `apt-get install -y bats` floated with the Ubuntu mirror and
# could break CI between green runs. ASW-169.
#
# Env:
#   BATS_VERSION  — pinned version (default 1.13.0). Match the cache key in
#                   .github/workflows/ci.yml when bumping.
#   GITHUB_PATH   — set by GHA; the export propagates $HOME/.local/bin to
#                   subsequent steps. Local invocations leave it unset.

set -euo pipefail

BATS_VERSION="${BATS_VERSION:-1.13.0}"

# Prepend $HOME/.local/bin BEFORE the version check so a cache-restored bats
# (under ~/.local/bin from a previous run) is discoverable to `command -v`.
# Otherwise needs_install treats every run as a cache miss and re-downloads.
export PATH="$HOME/.local/bin:$PATH"
if [ -n "${GITHUB_PATH:-}" ]; then
  echo "$HOME/.local/bin" >> "$GITHUB_PATH"
fi

needs_install() {
  if ! command -v bats >/dev/null 2>&1; then
    return 0
  fi
  # `grep -Fqx "Bats X.Y.Z"` so e.g. `1.13.0` doesn't substring-match `11.13.0`.
  if ! bats --version 2>/dev/null | grep -Fqx "Bats ${BATS_VERSION}"; then
    return 0
  fi
  return 1
}

if needs_install; then
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT

  TARBALL_URL="https://github.com/bats-core/bats-core/archive/refs/tags/v${BATS_VERSION}.tar.gz"
  curl -fsSL "$TARBALL_URL" -o "$TMP/bats.tar.gz"
  tar -xzf "$TMP/bats.tar.gz" -C "$TMP"
  "$TMP/bats-core-${BATS_VERSION}/install.sh" "$HOME/.local"
fi

bats --version
