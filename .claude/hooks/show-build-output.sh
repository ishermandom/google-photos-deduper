#!/usr/bin/env bash
# Copyright 2025 Ilya Sherman (ishermandom@)
# SPDX-License-Identifier: MIT
# PostToolUse hook: surfaces build script output as a user-visible system message.

input=$(cat)
command=$(jq -r '.tool_input.command // ""' <<< "$input")

# Only surface output for tools/build.sh invocations
if [[ "$command" != *"tools/build.sh"* ]]; then
  exit 0
fi

stdout=$(jq -r '.tool_response.stdout // ""' <<< "$input")
stderr=$(jq -r '.tool_response.stderr // ""' <<< "$input")
output="${stdout}${stderr}"

# Strip ANSI escape codes — system messages render as plain text
output=$(sed 's/\x1b\[[0-9;]*[mGKHF]//g' <<< "$output")

jq -n --arg msg "$output" '{"systemMessage": $msg}'
