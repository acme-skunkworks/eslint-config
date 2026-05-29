#!/usr/bin/env bats
# Tests for infrastructure/scripts/publish-to-github-packages.sh.
#
# Strategy: each test runs the script in an isolated cwd with a fake
# package.json and a fake `npm` on PATH that records its argv to a log file.
# `node` (used by the script for package.json parsing) is preserved by keeping
# the host PATH after the fake-npm dir. Unlike the npm leg, this script uses
# plain `npm` (token auth, no OIDC), so the fake lives on PATH rather than at
# $PNPM_HOME/npm.

setup() {
  SCRIPT_DIR="${BATS_TEST_DIRNAME}/../scripts"
  CALLS_LOG="${BATS_TEST_TMPDIR}/calls.log"
  FAKE_BIN="${BATS_TEST_TMPDIR}/bin"
  mkdir -p "$FAKE_BIN"
  : > "$CALLS_LOG"

  cd "${BATS_TEST_TMPDIR}"
  cat > package.json <<'EOF'
{ "name": "@test/pkg", "version": "1.0.0" }
EOF

  # Fake npm first on PATH; real PATH kept after it so `node` resolves.
  export PATH="$FAKE_BIN:$PATH"
  # Env the script requires (set by the workflow in production).
  export NODE_AUTH_TOKEN="fake-token"
  export GITHUB_PACKAGES_REGISTRY_URL="https://npm.pkg.github.com"
}

write_fake_npm() {
  # write_fake_npm <view-exit-code> [publish-exit-code]
  # `npm view` exits with the first code; `npm publish` exits with the second
  # (default 0). Both record their full argv to $CALLS_LOG.
  local view_exit_code=$1
  local publish_exit_code=${2:-0}
  cat > "$FAKE_BIN/npm" <<EOF
#!/usr/bin/env bash
echo "npm \$*" >> "$CALLS_LOG"
case "\$1" in
  view) exit ${view_exit_code} ;;
  publish) exit ${publish_exit_code} ;;
  *) exit 0 ;;
esac
EOF
  chmod +x "$FAKE_BIN/npm"
}

@test "already-published: npm view succeeds, script exits 0 without publishing" {
  write_fake_npm 0

  run bash "$SCRIPT_DIR/publish-to-github-packages.sh"
  [ "$status" -eq 0 ]
  grep -q "^npm view @test/pkg@1.0.0 version --registry https://npm.pkg.github.com$" "$CALLS_LOG"
  ! grep -q "^npm publish" "$CALLS_LOG"
  echo "$output" | grep -q "Already published to GitHub Packages: @test/pkg@1.0.0"
}

@test "not-published: npm view fails, script publishes to GH Packages without --provenance" {
  write_fake_npm 1

  run bash "$SCRIPT_DIR/publish-to-github-packages.sh"
  [ "$status" -eq 0 ]
  grep -q "^npm view @test/pkg@1.0.0 version --registry https://npm.pkg.github.com$" "$CALLS_LOG"
  grep -q "^npm publish --access public --registry https://npm.pkg.github.com$" "$CALLS_LOG"
  ! grep -q -- "--provenance" "$CALLS_LOG"
  echo "$output" | grep -q "Publishing @test/pkg@1.0.0 to GitHub Packages"
}

@test "publish-failure: npm publish fails, script exits non-zero" {
  write_fake_npm 1 1

  run bash "$SCRIPT_DIR/publish-to-github-packages.sh"
  [ "$status" -ne 0 ]
  grep -q "^npm publish --access public --registry https://npm.pkg.github.com$" "$CALLS_LOG"
}

@test "missing NODE_AUTH_TOKEN: script fails fast with documented error" {
  write_fake_npm 1
  unset NODE_AUTH_TOKEN

  run bash "$SCRIPT_DIR/publish-to-github-packages.sh"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "NODE_AUTH_TOKEN is not set"
  ! grep -q "^npm publish" "$CALLS_LOG"
}

@test "missing GITHUB_PACKAGES_REGISTRY_URL: script fails fast with documented error" {
  write_fake_npm 1
  unset GITHUB_PACKAGES_REGISTRY_URL

  run bash "$SCRIPT_DIR/publish-to-github-packages.sh"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "GITHUB_PACKAGES_REGISTRY_URL is not set"
  ! grep -q "^npm publish" "$CALLS_LOG"
}
