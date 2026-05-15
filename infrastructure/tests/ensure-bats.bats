#!/usr/bin/env bats
# Tests for infrastructure/scripts/ensure-bats.sh.
#
# Cache-hit: `bats` already on PATH at the pinned version → no curl/tar.
# Cache-miss: `bats` absent or wrong version → curl downloads, tar extracts,
#             install.sh runs.

setup() {
  SCRIPT_DIR="${BATS_TEST_DIRNAME}/../scripts"
  FAKE_BIN="${BATS_TEST_TMPDIR}/fake-bin"
  WORK="${BATS_TEST_TMPDIR}/work"
  mkdir -p "$FAKE_BIN" "$WORK"

  export CALLS_LOG="${BATS_TEST_TMPDIR}/calls.log"
  : > "$CALLS_LOG"

  # Isolate from any real $HOME so the install-target stays under tmpdir.
  export HOME="${BATS_TEST_TMPDIR}/home"
  mkdir -p "$HOME"

  export PATH="$FAKE_BIN:/usr/bin:/bin"
  cd "$WORK"
}

write_fake() {
  local name="$1"
  local body="$2"
  {
    printf '#!/usr/bin/env bash\n'
    printf 'echo "%s $*" >> "%s"\n' "$name" "$CALLS_LOG"
    printf '%s\n' "$body"
  } > "$FAKE_BIN/$name"
  chmod +x "$FAKE_BIN/$name"
}

@test "cache-hit: existing bats at pinned version skips download" {
  write_fake bats "echo 'Bats 1.13.0'"
  write_fake curl "echo 'curl should not have been called' >&2; exit 1"
  write_fake tar "echo 'tar should not have been called' >&2; exit 1"

  run bash "$SCRIPT_DIR/ensure-bats.sh"
  [ "$status" -eq 0 ]
  grep -q "^bats --version$" "$CALLS_LOG"
  ! grep -q "^curl" "$CALLS_LOG"
  ! grep -q "^tar" "$CALLS_LOG"
}

@test "cache-miss: missing bats triggers download from pinned version URL" {
  # Fake `curl` records the URL but produces no real tarball; fake `tar`
  # writes a stub install.sh that drops a bats stub into $HOME/.local/bin
  # so the final `bats --version` invocation succeeds.
  BATS_VERSION="${BATS_VERSION:-1.13.0}"
  EXTRACT_DIR="${BATS_TEST_TMPDIR}/extracted-bats-core-${BATS_VERSION}"
  mkdir -p "$EXTRACT_DIR"
  cat > "$EXTRACT_DIR/install.sh" <<'INSTALL'
#!/usr/bin/env bash
# Stub install.sh — receives a single PREFIX argument and creates a fake bats.
PREFIX="$1"
mkdir -p "$PREFIX/bin"
cat > "$PREFIX/bin/bats" <<'BATS'
#!/usr/bin/env bash
echo "Bats 1.13.0"
BATS
chmod +x "$PREFIX/bin/bats"
INSTALL
  chmod +x "$EXTRACT_DIR/install.sh"

  write_fake curl ""
  write_fake tar "cp -r '$EXTRACT_DIR' \"\$(echo \"\$*\" | awk -F'-C ' '{print \$2}')/bats-core-${BATS_VERSION}\""

  run bash "$SCRIPT_DIR/ensure-bats.sh"
  [ "$status" -eq 0 ]
  grep -q "^curl -fsSL https://github.com/bats-core/bats-core/archive/refs/tags/v1.13.0.tar.gz" "$CALLS_LOG"
  grep -q "^tar " "$CALLS_LOG"
}

@test "cache-miss: wrong bats version triggers reinstall" {
  write_fake bats "echo 'Bats 1.10.0'"
  write_fake curl "exit 1"

  run bash "$SCRIPT_DIR/ensure-bats.sh"
  # curl fails so script exits non-zero, but importantly curl WAS invoked,
  # proving the version mismatch took the install branch instead of skipping.
  [ "$status" -ne 0 ]
  grep -q "^curl -fsSL https://github.com/bats-core/bats-core/archive/refs/tags/v1.13.0.tar.gz" "$CALLS_LOG"
}

@test "honours BATS_VERSION env override in the download URL" {
  export BATS_VERSION="1.99.0"
  write_fake curl "exit 1"

  run bash "$SCRIPT_DIR/ensure-bats.sh"
  [ "$status" -ne 0 ]
  grep -q "bats-core/archive/refs/tags/v1.99.0.tar.gz" "$CALLS_LOG"
}

@test "cache-hit: bats restored to \$HOME/.local/bin (off-PATH) is discovered" {
  # Simulates GHA cache-restore: bats only exists under ~/.local/bin, which
  # is NOT pre-added to PATH. The script must prepend it BEFORE the version
  # check so command -v finds the cached binary instead of treating the run
  # as a cache miss and re-downloading.
  mkdir -p "$HOME/.local/bin"
  cat > "$HOME/.local/bin/bats" <<'BATS'
#!/usr/bin/env bash
echo "Bats 1.13.0"
BATS
  chmod +x "$HOME/.local/bin/bats"
  write_fake curl "echo 'curl should not have been called' >&2; exit 1"

  run bash "$SCRIPT_DIR/ensure-bats.sh"
  [ "$status" -eq 0 ]
  ! grep -q "^curl" "$CALLS_LOG"
}

@test "substring-safe: a version that contains BATS_VERSION as substring is not accepted" {
  # `1.13.0` is a substring of `11.13.0`; the version check must use
  # whole-line matching so the substring case still triggers reinstall.
  write_fake bats "echo 'Bats 11.13.0'"
  write_fake curl "exit 1"

  run bash "$SCRIPT_DIR/ensure-bats.sh"
  [ "$status" -ne 0 ]
  grep -q "^curl -fsSL https://github.com/bats-core/bats-core/archive/refs/tags/v1.13.0.tar.gz" "$CALLS_LOG"
}

@test "appends \$HOME/.local/bin to GITHUB_PATH even on cache hit" {
  # GHA pipeline must propagate ~/.local/bin to subsequent steps regardless
  # of whether this run installed or used a cached binary.
  write_fake bats "echo 'Bats 1.13.0'"
  export GITHUB_PATH="${BATS_TEST_TMPDIR}/github_path"
  : > "$GITHUB_PATH"

  run bash "$SCRIPT_DIR/ensure-bats.sh"
  [ "$status" -eq 0 ]
  grep -qF "$HOME/.local/bin" "$GITHUB_PATH"
}
