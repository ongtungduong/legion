#!/usr/bin/env bash
# Verifies hooks/guard: asks before secret files are touched, denies broad
# scans of dependency and build folders, allows everything else, and never
# blocks on input it cannot read.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOOK="$REPO_ROOT/hooks/guard"
fail=0

# $1 expected decision (allow|ask|deny), $2 label, $3 stdin JSON,
# $4 optional string the output must not contain. LEGION_GUARD is inherited.
expect() {
  local out code
  set +e
  out="$(printf '%s' "$3" | bash "$HOOK" 2>/dev/null)"
  code=$?
  set -e
  if [ "$1" = allow ]; then
    if [ "$code" -eq 0 ] && [ -z "$out" ]; then echo "PASS: $2"; else echo "FAIL: $2 (exit $code, output: $out)" >&2; fail=1; fi
    return
  fi
  if [ "$code" -eq 0 ] && printf '%s' "$out" | node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      const h = JSON.parse(s).hookSpecificOutput;
      if (!h || h.hookEventName !== "PreToolUse") throw new Error("wrong envelope");
      if (h.permissionDecision !== process.argv[1]) throw new Error("decision " + h.permissionDecision);
      if (!h.permissionDecisionReason) throw new Error("no reason");
      if (process.argv[2] && s.includes(process.argv[2])) throw new Error("output echoes " + process.argv[2]);
    });' "$1" "${4:-}"; then
    echo "PASS: $2"
  else
    echo "FAIL: $2 (exit $code, output: $out)" >&2; fail=1
  fi
}

read_json() { printf '{"hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"%s"}}' "$1"; }
bash_json() { printf '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"%s","description":"x"}}' "$1"; }

expect ask   "Read .env asks"                          "$(read_json /p/.env)"
expect allow "Read .env.example is allowed"            "$(read_json /p/.env.example)"
expect ask   "Read .env.local asks"                    "$(read_json /p/.env.local)"
expect ask   "Read a .pem file asks"                   "$(read_json /p/certs/server.pem)"
expect ask   "Bash cat .env asks"                      "$(bash_json 'cat .env')"
expect allow "Bash cat .env.sample is allowed"         "$(bash_json 'cat .env.sample')"
expect deny  "Grep in node_modules is denied"          '{"tool_name":"Grep","tool_input":{"pattern":"foo","path":"/p/node_modules"}}'
expect deny  "Glob over node_modules is denied"        '{"tool_name":"Glob","tool_input":{"pattern":"**/node_modules/**"}}'
expect deny  "Bash grep -rn in node_modules is denied" "$(bash_json 'grep -rn foo node_modules')"
expect allow "Bash npm run build is allowed"           "$(bash_json 'npm run build')"
expect allow "Read one file in node_modules is allowed" "$(read_json /p/node_modules/lodash/package.json)"
LEGION_GUARD=off expect allow "LEGION_GUARD=off allows .env" "$(read_json /p/.env)"
expect allow "unparseable input is allowed"            'not json'
expect ask   "path with a space still asks"            "$(read_json '/p/my dir/.env')"
expect ask   "Edit id_rsa asks"                        '{"tool_name":"Edit","tool_input":{"file_path":"/p/id_rsa","old_string":"a","new_string":"b"}}'
expect allow "Write mentioning .env in content is allowed" '{"tool_name":"Write","tool_input":{"file_path":"/p/README.md","content":"copy .env.example to .env"}}'
expect allow "Bash ls dist is allowed"                 "$(bash_json 'ls dist')"
expect ask   "Write to .env asks without echoing content" '{"tool_name":"Write","tool_input":{"file_path":"/p/.env","content":"API_KEY=sk_live_TESTONLY123"}}' 'sk_live_TESTONLY123'
expect ask   "path with an escaped quote still asks"   '{"tool_name":"Read","tool_input":{"file_path":"/p/a\"b/.env"}}'
expect deny  "Bash find over dist is denied"           "$(bash_json 'find dist -name *.js')"

# Review findings: ordinary work must not be blocked.
expect allow "Grep under an ancestor named build is allowed" '{"tool_name":"Grep","tool_input":{"pattern":"foo","path":"/Users/x/build/app/src"}}'
expect allow "Grep in a monorepo package named build is allowed" '{"tool_name":"Grep","tool_input":{"pattern":"foo","path":"/p/packages/build/src"}}'
expect allow "Glob inside a source folder named build is allowed" '{"tool_name":"Glob","tool_input":{"pattern":"src/build/**/*.ts"}}'
expect allow "Grep in one package inside node_modules is allowed" '{"tool_name":"Grep","tool_input":{"pattern":"foo","path":"/p/node_modules/lodash"}}'
expect allow "Grep with a glob that excludes dist is allowed" '{"tool_name":"Grep","tool_input":{"pattern":"foo","path":"/p","glob":"!**/dist/**"}}'
expect allow "Bash grep --exclude-dir=node_modules is allowed" "$(bash_json 'grep --exclude-dir=node_modules -rn foo .')"
expect allow "Bash find with -not -path node_modules is allowed" "$(bash_json "find . -not -path './node_modules/*' -name x")"
expect allow "Bash grep -r inside one package is allowed" "$(bash_json 'grep -r foo node_modules/lodash/lib')"
expect allow "Bash make build then rg in src is allowed" "$(bash_json 'make build && rg foo src')"
expect allow "Bash grep --color in one dist file is allowed" "$(bash_json 'grep --color=never foo dist/app.js')"
expect deny  "Bash rg after cd into the repo still denies node_modules" "$(bash_json 'cd /p; rg foo node_modules')"
expect ask   "Grep with a .env glob asks"              '{"tool_name":"Grep","tool_input":{"pattern":"KEY","path":"/p","glob":".env*"}}'
expect ask   "Read an ed25519 key asks"                "$(read_json /p/.ssh/id_ed25519)"
expect allow "Read a public key is allowed"            "$(read_json /p/.ssh/id_rsa.pub)"
expect allow "Read .env.template is allowed"           "$(read_json /p/.env.template)"
expect ask   "Windows path to .env asks"               '{"tool_name":"Read","tool_input":{"file_path":"C:\\p\\.env"}}'
expect allow "empty Bash command is allowed"           "$(bash_json '')"

# Re-review: the search pattern is not a folder.
expect allow "Bash rg for the word build in scripts is allowed" "$(bash_json 'rg build scripts')"
expect allow "Bash grep -rn for dist in .github is allowed" "$(bash_json 'grep -rn dist .github')"
expect allow "Bash rg -n for node_modules in docs is allowed" "$(bash_json 'rg -n node_modules docs')"
expect allow "Bash grep -r -e build in src is allowed"  "$(bash_json 'grep -r -e build src')"
expect deny  "Bash rg -e foo in node_modules is denied" "$(bash_json 'rg -e foo node_modules')"
expect deny  "Bash grep -rn in node_modules/. is denied" "$(bash_json 'grep -rn foo node_modules/.')"
# Final review: numeric option values are not the pattern.
expect allow "Bash rg -C 2 for dist in src is allowed" "$(bash_json 'rg -C 2 dist src')"
expect allow "Bash grep -rn -m 1 for build in scripts is allowed" "$(bash_json 'grep -rn -m 1 build scripts')"
expect deny  "Bash rg -A 3 foo in node_modules is denied" "$(bash_json 'rg -A 3 foo node_modules')"
expect allow "Bash fd for the word build is allowed"   "$(bash_json 'fd build')"
expect deny  "Bash rg --files over dist is denied"     "$(bash_json 'rg --files dist')"

# Bash builtins only: the hook must work with no PATH at all.
out="$(printf '%s' "$(read_json /p/.env)" | env PATH=/nonexistent "$BASH" "$HOOK" 2>&1)" || true
case "$out" in
  *'"permissionDecision":"ask"'*) echo "PASS: works with no PATH (no external command)" ;;
  *) echo "FAIL: works with no PATH (no external command) (output: $out)" >&2; fail=1 ;;
esac

exit "$fail"
