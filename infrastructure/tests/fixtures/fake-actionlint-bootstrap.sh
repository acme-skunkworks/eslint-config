#!/usr/bin/env bash
# Used by ensure-actionlint.bats. The cache-miss test's fake `curl` emits
# the contents of this file as a bootstrap script. `bash <(curl …)` then
# evaluates it, which writes a stub `./actionlint` that logs its argv to
# $CALLS_LOG when invoked.
cat > ./actionlint <<'ACTL'
#!/usr/bin/env bash
echo "actionlint $*" >> "${CALLS_LOG:?CALLS_LOG must be exported}"
ACTL
chmod +x ./actionlint
