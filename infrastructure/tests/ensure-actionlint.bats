#!/usr/bin/env bats
# Tests for infrastructure/scripts/ensure-actionlint.sh.
#
# Cache-hit: an executable ./actionlint exists in cwd → no download.
# Cache-miss: ./actionlint absent → download via bash <(curl ...).

setup() {
  SCRIPT_DIR="${BATS_TEST_DIRNAME}/../scripts"
  FIXTURES="${BATS_TEST_DIRNAME}/fixtures"
  FAKE_BIN="${BATS_TEST_TMPDIR}/fake-bin"
  WORK="${BATS_TEST_TMPDIR}/work"
  mkdir -p "$FAKE_BIN" "$WORK"

  # Exported so the stub actionlint inherits it via `bash <(curl ...)`.
  export CALLS_LOG="${BATS_TEST_TMPDIR}/calls.log"
  : > "$CALLS_LOG"

  export PATH="$FAKE_BIN:/usr/bin:/bin"
  cd "$WORK"
}

# Writes a fake command on PATH that records its argv to $CALLS_LOG and then
# runs the body in $2.
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

@test "cache-hit: existing ./actionlint is invoked, no curl download" {
  {
    printf '#!/usr/bin/env bash\n'
    printf 'echo "actionlint $*" >> "%s"\n' "$CALLS_LOG"
  } > "$WORK/actionlint"
  chmod +x "$WORK/actionlint"
  write_fake curl "echo 'curl should not have been called' >&2; exit 1"

  run bash "$SCRIPT_DIR/ensure-actionlint.sh"
  [ "$status" -eq 0 ]
  grep -q "^actionlint -color$" "$CALLS_LOG"
  ! grep -q "^curl" "$CALLS_LOG"
}

@test "cache-miss: curl downloads a bootstrap that drops ./actionlint, then it is invoked" {
  # Fake `curl` emits the contents of the fixture bootstrap script. The
  # script's `bash <(curl ...)` evaluates that bootstrap, which writes
  # ./actionlint that logs its argv to $CALLS_LOG when invoked.
  write_fake curl "cat \"$FIXTURES/fake-actionlint-bootstrap.sh\""

  run bash "$SCRIPT_DIR/ensure-actionlint.sh"
  [ "$status" -eq 0 ]
  grep -q "^curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/v1.7.5/" "$CALLS_LOG"
  grep -q "^actionlint -color$" "$CALLS_LOG"
}

@test "honours ACTIONLINT_VERSION env override in the download URL" {
  export ACTIONLINT_VERSION="1.99.0"
  write_fake curl "cat \"$FIXTURES/fake-actionlint-bootstrap.sh\""

  run bash "$SCRIPT_DIR/ensure-actionlint.sh"
  [ "$status" -eq 0 ]
  grep -q "rhysd/actionlint/v1.99.0/" "$CALLS_LOG"
}
