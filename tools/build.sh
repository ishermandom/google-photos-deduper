#!/usr/bin/env bash
# Copyright 2025 Ilya Sherman (ishermandom@)
# SPDX-License-Identifier: MIT
# Build the Chrome extension, printing a compact summary on success
# and full output on failure.

set -uo pipefail

log=$(mktemp)
trap 'rm -f "$log"' EXIT

# --silent suppresses npm's "> script-name" headers; 2>&1 captures stderr so
# failures include full output
if npm run build --silent >"$log" 2>&1; then
  grep -E "→|⚡|DONE|Finished" "$log"
  echo "Build succeeded."
else
  cat "$log"
  exit 1
fi
