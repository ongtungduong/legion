#!/usr/bin/env bash
# Human-in-the-loop reproduction loop, for a bug only a person can trigger.
# Copy this file to .legion/, edit the steps between the markers, and ask the
# user to run it from the Claude Code prompt with `! bash .legion/<copy>.sh`.
# The agent's Bash tool has no terminal to read from, so it cannot run this
# itself; the `!` prefix runs it in the user's terminal and puts the output
# in the conversation.
#
# Helpers:
#   step "<instruction>"       show an instruction, wait for Enter
#   capture VAR "<question>"   show a question, read the answer into VAR
#
# Captured values print at the end as KEY=VALUE. Capture observations only;
# signing in or entering secrets stays a `step`, so nothing secret is echoed.

set -euo pipefail

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter when done] " _
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer
  printf -v "$var" '%s' "$answer"
}

# --- edit below ---------------------------------------------------------

step "Open the app at http://localhost:3000 and sign in."
capture ERRORED "Click 'Export'. Did it show an error? (y/n)"
capture ERROR_MSG "Paste the error message, or 'none':"

# --- edit above ---------------------------------------------------------

printf '\n--- Captured ---\n'
printf 'ERRORED=%s\n' "$ERRORED"
printf 'ERROR_MSG=%s\n' "$ERROR_MSG"
