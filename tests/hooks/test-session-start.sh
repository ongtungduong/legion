#!/usr/bin/env bash
# Verifies hooks/session-start emits valid Claude Code SessionStart JSON that
# carries the router, and still emits valid JSON when the skill
# file cannot be read.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOOK="$REPO_ROOT/hooks/session-start"
fail=0

check() { # $1 label, $2 plugin root, $3 substring the context must contain, $4 optional substring it must not contain
  local out
  out="$(CLAUDE_PLUGIN_ROOT="$2" bash "$HOOK")"
  if printf '%s' "$out" | node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      const j = JSON.parse(s);
      const h = j.hookSpecificOutput;
      if (!h || h.hookEventName !== "SessionStart") throw new Error("wrong envelope");
      if (!h.additionalContext.includes(process.argv[1])) throw new Error("context lacks: " + process.argv[1]);
      if (process.argv[2] && h.additionalContext.includes(process.argv[2])) throw new Error("context contains: " + process.argv[2]);
    });' "$3" "${4:-}"; then
    echo "PASS: $1"
  else
    echo "FAIL: $1" >&2; fail=1
  fi
}

check "injects the router" "$REPO_ROOT" "# Legion Router"
check "router table survives JSON escaping" "$REPO_ROOT" '| Situation | Skill |'
check "strips the YAML frontmatter" "$REPO_ROOT" "# Legion Router" "disable-model-invocation:"
check "falls back cleanly when the skill is missing" "/nonexistent-legion-root" "could not read"

# A router containing control characters must still yield valid JSON.
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT
mkdir -p "$fixture/skills/router"
printf -- '---\nname: router\n---\n# Legion Router\nbell\x07 ff\x0c vt\x0b end\n' > "$fixture/skills/router/SKILL.md"
check "control characters stay valid JSON" "$fixture" "bell"

exit "$fail"
