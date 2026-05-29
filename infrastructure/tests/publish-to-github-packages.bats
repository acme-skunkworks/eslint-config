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
}

write_fake_npm() {
  # write_fake_npm <view-exit-code>
  # `npm view` exits with the given code; `npm publish` always succeeds.
  # Both record their full argv to $CALLS_LOG.
  local view_exit_code=$1
  cat > "$FAKE_BIN/npm" <<EOF
#!/usr/bin/env bash
echo "npm \$*" >> "$CALLS_LOG"
case "\$1" in
  view) exit ${view_exit_code} ;;
  publish) exit 0 ;;
  *) exit 0 ;;
esac
EOF
  chmod +x "$FAKE_BIN/npm"
}

@test "already-published: npm view succeeds, script exits 0 without publishing" {
  write_fake_npm 0

  run bash "$SCRIPT_DIR/publish-to-github-packages.sh"
  [ "$status" -eq 0 ]
  grep -q "^npm view @test/pkg@1.0.0 version$" "$CALLS_LOG"
  ! grep -q "^npm publish" "$CALLS_LOG"
  echo "$output" | grep -q "Already published to GitHub Packages: @test/pkg@1.0.0"
}

@test "not-published: npm view fails, script publishes without --provenance" {
  write_fake_npm 1

  run bash "$SCRIPT_DIR/publish-to-github-packages.sh"
  [ "$status" -eq 0 ]
  grep -q "^npm view @test/pkg@1.0.0 version$" "$CALLS_LOG"
  grep -q "^npm publish --access public$" "$CALLS_LOG"
  ! grep -q -- "--provenance" "$CALLS_LOG"
  echo "$output" | grep -q "Publishing @test/pkg@1.0.0 to GitHub Packages"
}
