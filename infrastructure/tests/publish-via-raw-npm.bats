#!/usr/bin/env bats
# Tests for infrastructure/scripts/publish-via-raw-npm.sh.
#
# Strategy: each test runs the script in an isolated cwd with a fake
# package.json and a fake npm binary at $PNPM_HOME/npm that records its
# argv to a log file. The host PATH is preserved so `node` (used by the
# script for package.json parsing) resolves normally.

setup() {
  SCRIPT_DIR="${BATS_TEST_DIRNAME}/../scripts"
  CALLS_LOG="${BATS_TEST_TMPDIR}/calls.log"
  FAKE_PNPM_HOME="${BATS_TEST_TMPDIR}/pnpm-home"
  mkdir -p "$FAKE_PNPM_HOME"
  : > "$CALLS_LOG"

  cd "${BATS_TEST_TMPDIR}"
  cat > package.json <<'EOF'
{ "name": "@test/pkg", "version": "1.0.0" }
EOF

  export PNPM_HOME="$FAKE_PNPM_HOME"
}

write_fake_npm() {
  # write_fake_npm <view-exit-code>
  # `npm view` exits with the given code; `npm publish` always succeeds.
  # Both record their full argv to $CALLS_LOG.
  local view_exit_code=$1
  cat > "$FAKE_PNPM_HOME/npm" <<EOF
#!/usr/bin/env bash
echo "npm \$*" >> "$CALLS_LOG"
case "\$1" in
  view) exit ${view_exit_code} ;;
  publish) exit 0 ;;
  *) exit 0 ;;
esac
EOF
  chmod +x "$FAKE_PNPM_HOME/npm"
}

@test "already-published: npm view succeeds, script exits 0 without publishing" {
  write_fake_npm 0

  run bash "$SCRIPT_DIR/publish-via-raw-npm.sh"
  [ "$status" -eq 0 ]
  grep -q "^npm view @test/pkg@1.0.0 version$" "$CALLS_LOG"
  ! grep -q "^npm publish" "$CALLS_LOG"
  echo "$output" | grep -q "Already published: @test/pkg@1.0.0"
}

@test "not-published: npm view fails, script calls npm publish with TP flags" {
  write_fake_npm 1

  run bash "$SCRIPT_DIR/publish-via-raw-npm.sh"
  [ "$status" -eq 0 ]
  grep -q "^npm view @test/pkg@1.0.0 version$" "$CALLS_LOG"
  grep -q "^npm publish --access public --provenance$" "$CALLS_LOG"
  echo "$output" | grep -q "Publishing @test/pkg@1.0.0"
}

@test "missing PNPM_HOME: script fails fast with documented error" {
  unset PNPM_HOME

  run bash "$SCRIPT_DIR/publish-via-raw-npm.sh"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "PNPM_HOME is not set"
}
