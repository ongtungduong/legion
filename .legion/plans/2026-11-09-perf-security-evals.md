# Performance, Security, and Proven Skills Implementation Plan

> Execute with legion:executing-plans. Steps use `- [ ]` checkboxes.

**Goal:** Legion catches performance and security problems while code is written and across a whole system, its own code meets the same three criteria, and every skill has measured evidence that it works.
**Architecture:** Two domain skills (`performance-optimization` new, `security-and-hardening` extended) are wired into the chain the way `coding-principles` is: spec and plan lines, quick-path triggers, implementer and reviewer checklist paths, and a system-audit mode that `code-review` dispatches. A bash-builtins `PreToolUse` guard protects secret files. Behavioral evals (`claude plugin eval`) grade the code agents produce, logged in `docs/evals.md`.
**Spec:** `.legion/specs/2026-11-09-perf-security-evals-design.md`
**Design principles:** the-pragmatic-programmer - one owner per fact (ROUTER, audit skeleton, trigger lists), automated checks, short feedback loops.
**Slice order:** Task 1 is the tracer bullet: it proves the eval pipeline end to end and gives the cost every later eval step depends on. Task 2 unblocks the checks later tasks rely on. Tasks 3-5 close the largest gap the repo review found (performance has no hook point; security is checked only after code exists). Then the audits, the guard, the repo's own fixes, the thinking-model gaps, the remaining evals, and the release. Low-value tail: Task 11 (hook escaping, input is Legion's own file).

## Global constraints
- Hooks use bash builtins only; repo scripts use stock Node; no bundled dependency.
- `SKILL.md` under 20,000 bytes.
- Every eval run records model, Claude Code version, and cost in `docs/evals.md`.
- Never loosen a grader or threshold to make a case pass; never print a matched secret in an audit report or hook message.
- Ask the user first before removing a skill after two failed fixes, and before running the full suite beyond the Task 1 estimate.
- Unmeasured performance findings are labelled "potential impact"; every number names its source (field, lab, trace, benchmark).
- AGENTS.md conventions: English only; cross-skill calls say "Call the Skill tool with `legion:<name>`"; subagents get a fresh context and a named model; frontmatter has `license: MIT` and `metadata.author: ongtungduong`.
- Eval commands pin `--model sonnet` and use `--no-publish`.

## Review focus
1. `.env.local` and `.env.production` must ask while `.env.example` and `.env.sample` must not (Task 10, guard tests 2-3, 6).
2. A path with a space or an escaped quote in the hook's stdin JSON (Task 10, guard test 14).
3. A `Write` whose content mentions `.env` but whose `file_path` is ordinary must be allowed (Task 10, guard test 17).
4. A system audit of a project with no lockfile: the dependency step reports "not applicable", not an error (Task 6, eval grader).
5. `npm run build` and `ls dist` must not count as broad scans (Task 10, guard tests 10, 18).

## Pre-mortem
- Eval noise: with 3 runs and a haiku judge, a case can fail for a grader's mistake, and a sound skill gets "fixed" into a worse one -> Task 1 and Task 15 read the failing run's transcript and grader verdict before any skill edit, and ledger whether the skill or the grader was wrong.
- Trigger collision: the new performance description pulls "slower since yesterday" from `systematic-debugging` or "timeouts and retries" from `coding-principles` -> Task 3 adds both as near-miss negatives and runs `npm run evals:triggers`.
- Token bloat: the trigger lists grow `executing-plans/SKILL.md`, the file every code change loads, which contradicts the spec's "XS change loads the same bytes" -> Task 5 caps the growth at 1,200 bytes and reports `wc -c` before and after; question for the user at hand-off.

---

### Task 1: Eval baseline and log   (Size: S)

**Files:** Create `docs/evals.md`

**Interfaces:**
- Consumes: none
- Produces: `docs/evals.md` with a `## Runs` table `| Date | Claude Code | Model | Scope | Runs/case | Cost (USD) | Passed |` and one `### <date> <scope>` section per run with `| Case | With plugin | Without | Delta | Verdict |`; the per-run cost figure Task 15 uses.

**Acceptance (spec: Phase 1, steps 1-4):** the 6 existing cases ran with the plugin and without; every result, the model, the CLI version, and the cost are logged; each case meets the bar (fires/quiet at least 2/3, positive delta on quality graders) or has a ledgered ruling naming whether the skill or the grader was wrong; a cost estimate for the full suite is stated.

- [ ] Run `claude --version`; record it.
- [ ] Run `claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.67 --json evals/results/2026-11-09-baseline.json`; expected: a per-case score table and a total cost.
- [ ] Write `docs/evals.md` with the two tables above, filled from the JSON.
- [ ] For each case below the bar: read its transcript and grader verdicts, ledger `Ruling: <skill|grader> wrong - <why>`, fix the skill description or body (not the grader, unless the grader misjudged a correct reply), re-run that case with `--case <name>`. After two failed fixes, stop and ask the user (Global constraints).
- [ ] Compute `cost per run x planned runs` for Task 15 (about 30 cases x 3 runs x 2 arms) and write it under the run's section.
- [ ] Run `npm test`; expected: all pass.
- [ ] Commit `test(evals): record the first behavioral baseline`

### Task 2: Repo checks own every fact once   (Size: M)

**Files:** Modify `scripts/lib/skills.mjs`, `scripts/validate.mjs`, `scripts/trigger-evals.mjs`, `package.json`; Create `tests/scripts/validate.test.mjs`

**Interfaces:**
- Consumes: none
- Produces: `ROOT` honours `process.env.LEGION_ROOT` when set; `export const ROUTER = 'using-legion'` in `scripts/lib/skills.mjs`, imported by both scripts; validate errors `"<file>: link \"<target>\" leaves the skill root"`, `"hooks/<name> is missing"`, `"hooks/<name> is not executable (chmod +x)"`; trigger-evals error `"<skill>: frontmatter does not parse; run npm run validate"`; npm script `test:scripts` = `node --test tests/scripts/validate.test.mjs`, added to `test`.

**Acceptance (spec: Repo review findings 3, 4, 5):** links leaving a skill's own directory fail validation; every `${CLAUDE_PLUGIN_ROOT}/hooks/<name>` path in `hooks/hooks.json` must exist and be executable; trigger-evals reports a bad frontmatter instead of crashing; `ROUTER` has one owner.

- [ ] Write `tests/scripts/validate.test.mjs` (node:test). Each test copies the repo (excluding `.git`, `evals/results`) to a temp dir, applies one defect, and runs the script with `LEGION_ROOT=<copy>`:
  - `clean copy passes` -> `validate.mjs` exit 0;
  - `link out of the skill root fails` -> add `[x](../brainstorming/SKILL.md)` to `skills/defining-terms/references/glossary-format.md`; exit 1, stdout contains `leaves the skill root`;
  - `non-executable hook fails` -> `chmod 644 hooks/session-start`; exit 1, contains `hooks/session-start is not executable`;
  - `missing registered hook fails` -> add a `PreToolUse` command `bash "${CLAUDE_PLUGIN_ROOT}/hooks/guard"` to `hooks/hooks.json`; exit 1, contains `hooks/guard is missing`;
  - `bad frontmatter is reported, not thrown` -> replace the first line of `skills/defining-terms/SKILL.md` with `--`; `trigger-evals.mjs` exit 1, contains `frontmatter does not parse`, does not contain `TypeError`.
- [ ] Run `node --test tests/scripts/validate.test.mjs`; expected: FAIL on the last four (the clean copy may also fail until `LEGION_ROOT` exists).
- [ ] Implement the Interfaces above.
- [ ] Run `node --test tests/scripts/validate.test.mjs`; expected: 5 pass.
- [ ] Run `npm test`; expected: all pass.
- [ ] Commit `refactor(scripts): one owner for ROUTER, check hook files and skill-root links`

### Task 3: performance-optimization skill core   (Size: M)

**Files:** Create `skills/performance-optimization/SKILL.md`, `skills/performance-optimization/references/patterns.md`, `skills/performance-optimization/references/performance-checklist.md`, `evals/triggers/performance-optimization.json`, `evals/plugin/performance-optimization-fires-on-slow-endpoint/`, `evals/plugin/performance-optimization-stays-quiet-on-regression/`; Modify `skills/using-legion/SKILL.md`, `README.md`, `THIRD_PARTY.md`

**Interfaces:**
- Consumes: none
- Produces: skill `legion:performance-optimization`; checklist path `skills/performance-optimization/references/performance-checklist.md` (items marked checked / not applicable / failed, like `security-checklist.md`); router row `| Speeding up code toward a measured goal: profiling, N+1, latency, throughput, memory, bundle size, Core Web Vitals | \`legion:performance-optimization\` |`.

**Acceptance (spec: Design 2a):** workflow is budget -> baseline with source -> profile -> name the bottleneck -> fix test-first via `legion:executing-plans` -> re-measure -> report with sources; the metric-honesty rule is stated with its reason; the four models sit where they decide (measure before assuming the bottleneck; what load breaks it; queues, retries, caches; biggest bottleneck first); `SKILL.md` at most 8,000 bytes; regressions stay with `systematic-debugging`.

- [ ] Write the trigger file: positives `"This endpoint takes 3 seconds, make it faster"`, `"We have an N+1 query on the orders page"`, `"Get our LCP under 2.5 seconds"`, `"Memory keeps growing when we import large CSV files"`; negatives `{"prompt": "The search page got three times slower since yesterday's deploy", "owner": "systematic-debugging"}`, `{"prompt": "Add timeouts and retries to the payment client", "owner": "coding-principles"}`.
- [ ] Write the fires case: prompt pastes an Express handler that queries `orders` then loops `db.query` per order for its items, and asks "make this endpoint faster". Graders: `tool_used` Skill `performance-optimization`; `llm` PASS if the reply replaces the per-order queries with one batched query or join and states how to measure before and after; FAIL if it claims a speedup number with no measurement source.
- [ ] Write the quiet case: prompt "The search page got three times slower since yesterday's deploy, here is the diff" with a small diff. Grader: `tool_used` Skill `performance-optimization` `min: 0` `max: 0` `arm: both`.
- [ ] Run `npm run validate`; expected: FAIL, `missing SKILL.md` for `performance-optimization` (RED).
- [ ] Write `SKILL.md` (frontmatter per AGENTS.md, description: what, then "Use when ...", with the positive phrasings and "even when the code is pasted inline"), `references/patterns.md` (N+1, algorithmic complexity, I/O in loops, caching, concurrency, memory; read when naming the bottleneck), `references/performance-checklist.md`; add the router row, README row, THIRD_PARTY row (addy `performance-optimization`, `agents/web-performance-auditor.md`).
- [ ] Run `npm test`; expected: all pass, no near-duplicate descriptions, rank-1 count not below 56 of the previous positives.
- [ ] Run `claude plugin eval . --no-publish --model sonnet --runs 3 --case 'performance-optimization-*'`; expected: both cases at least 2/3, positive delta on the llm grader. Log in `docs/evals.md`.
- [ ] Run `wc -c skills/performance-optimization/SKILL.md`; expected: at most 8000.
- [ ] Commit `feat(performance-optimization): measure-first skill with checklist and evals`

### Task 4: Spec and plan carry Security and Performance   (Size: S)

**Files:** Modify `skills/brainstorming/assets/design-doc-template.md`, `skills/writing-plans/SKILL.md`, `skills/writing-plans/assets/plan-template.md`; Create `evals/plugin/writing-plans-records-security-line/`

**Interfaces:**
- Consumes: Task 3 skill name
- Produces: design-doc section after `## Boundaries`:
  ```
  ## Non-functional
  - Security: <trust boundaries and assets the change touches, or "none">
  - Performance: <budget and hot paths, or "none">
  ```
  plan-template lines after `Design principles`: `**Security:** none | <trust boundaries touched>` and `**Performance:** none | <budget or hot path>`.

**Acceptance (spec: Design 2d, first bullets):** `writing-plans` step 2 fills both lines from the spec's `Non-functional` section, or from the trigger lists of `legion:executing-plans` when the spec has none; a plan for a spec with a login endpoint has a non-`none` Security line.

- [ ] Write the case: prompt pastes a short approved spec for "a login endpoint that checks email and password against the users table" and asks for the plan. Graders: `regex` `\*\*Security:\*\* (?!none)`; `regex` `\*\*Performance:\*\*`.
- [ ] Run `claude plugin eval . --no-publish --model sonnet --runs 1 --case writing-plans-records-security-line`; expected: the regex graders FAIL (RED).
- [ ] Edit the three files per Interfaces.
- [ ] Re-run the case with `--runs 3`; expected: at least 2/3. Log it.
- [ ] Run `npm test`; expected: all pass.
- [ ] Commit `feat(writing-plans): record security and performance lines from the spec`

### Task 5: Quick path and plan workflow load the standards before code   (Size: M)

**Files:** Modify `skills/executing-plans/SKILL.md`, `skills/executing-plans/references/plan-workflow.md`, `skills/executing-plans/references/implementer-prompt.md`, `skills/executing-plans/references/task-reviewer-prompt.md`; Create `evals/plugin/executing-plans-loads-security-on-auth-change/`

**Interfaces:**
- Consumes: Task 3 checklist path; Task 4 plan lines
- Produces: quick-path step 2 "Load the standards" with these exact trigger lists:
  - Security: untrusted input (requests, forms, uploads, webhooks, values another process wrote), login or sessions, authorization, secrets or API keys, personal data, LLM output.
  - Performance: a query or network call inside a loop, a hot path (per request, per row, per frame), data that grows with users or time, rendering, a stated budget.
  
  An XS change skips performance, never security when it touches a trust boundary. Implementer and task-reviewer prompts gain `Security checklist: [absolute path, or "not triggered"]` and `Performance checklist: [absolute path, or "not triggered"]`; the task reviewer's Security bullet points at that checklist.

**Acceptance (spec: Design 2d, quick path and plan workflow):** both skills load before the first test when a trigger matches; plan-workflow step 4 loads them per the plan's lines; `executing-plans/SKILL.md` grows by at most 1,200 bytes.

- [ ] Run `wc -c skills/executing-plans/SKILL.md`; record the before size.
- [ ] Write the case: prompt pastes a small `users` module and asks "add a function that looks up a user by the email from the login form". Graders: `tool_used` Skill `security-and-hardening`; `llm` PASS if the query is parameterized and the email is validated at the boundary.
- [ ] Run it with `--runs 1`; expected: the `tool_used` grader FAILS (RED).
- [ ] Edit the four files per Interfaces; replace quick-path step 4 "Review if risky" so the risky list stays and points to `legion:code-review` after the standards loaded in step 2.
- [ ] Re-run with `--runs 3`; expected: at least 2/3, positive delta on the llm grader. Log it.
- [ ] Run `wc -c` again; expected: growth at most 1200 bytes. Report both sizes.
- [ ] Run `npm test`; expected: all pass.
- [ ] Commit `feat(executing-plans): load security and performance standards before the first test`

### Task 6: Security system audit and upstream fixes   (Size: M)

**Files:** Create `skills/security-and-hardening/references/audit.md`, `evals/plugin/security-audit-on-system/`; Modify `skills/security-and-hardening/SKILL.md`, `skills/security-and-hardening/references/security-checklist.md`, `THIRD_PARTY.md`

**Interfaces:**
- Consumes: none
- Produces: the audit report skeleton every `audit.md` ends with, under `## Report`:
  ```
  ### Scope
  ### Method
  ### Findings
  | Severity | Location | Finding | Evidence | Impact |
  ### Not checked
  ```
  Severity uses Critical / Important / Minor / FYI; Location is `file:line`; Impact is `measured: <value, source>` or `potential impact`.

**Acceptance (spec: Design 2b; models table, security Pareto):** audit steps are scope -> secret scan by pattern without echoing values -> dependency audit with the ecosystem's tool ("not applicable" when no lockfile) -> STRIDE + OWASP incl. LLM Top 10 -> four attacker personas -> verify each finding against code and baseline -> report; findings ranked by exposure x impact; SKILL.md points to `audit.md` with when to read it; upstream commits `d1463fd`, `ab15a85`, `30187c1`, `78f00a4` each taken or ledgered as already covered.

- [ ] Write the case: prompt pastes three small files of an app (a route building SQL by string concatenation, a config file with a hard-coded API key `sk_live_TESTONLY123`, no lockfile) and asks "audit this app's security". Graders: `llm` PASS if the SQL injection is Critical with `file:line`, the key is reported without its value, and the dependency step says not applicable; a second `llm` grader FAILS if the reply contains the string `sk_live_TESTONLY123` anywhere.
- [ ] Run it with `--runs 1`; expected: the llm grader FAILS on the report structure (RED).
- [ ] Read each upstream commit with `git -C ../addyosmani-skills show <sha>`; fold in what fixes something Legion lets through, ledger the rest.
- [ ] Write `audit.md`, edit SKILL.md (pointer, Pareto ranking line, description names session cookies), edit the checklist; add THIRD_PARTY rows (addy `agents/security-auditor.md`; claudekit `ck:security` personas, `security-scan` patterns).
- [ ] Re-run with `--runs 3`; expected: at least 2/3. Log it.
- [ ] Run `npm test`; expected: all pass.
- [ ] Commit `feat(security-and-hardening): system audit mode and upstream fixes`

### Task 7: Performance web reference and audit, skeleton check   (Size: M)

**Files:** Create `skills/performance-optimization/references/web.md`, `skills/performance-optimization/references/audit.md`; Modify `skills/performance-optimization/SKILL.md`, `scripts/validate.mjs`, `tests/scripts/validate.test.mjs`

**Interfaces:**
- Consumes: Task 6 skeleton; Task 2 test harness
- Produces: validate error `"audit skeletons differ: <file a> vs <file b>"`, comparing, in each `skills/*/references/audit.md`, the `### ` lines and the line starting `| Severity` inside its `## Report` section.

**Acceptance (spec: Design 2a references, 2c):** `web.md` (Core Web Vitals, bundle, render) read only for frontend work; `audit.md` follows the shared skeleton and its static-only findings are "potential impact"; drift between the two skeletons fails `npm run validate`.

- [ ] Add test `audit skeletons must match` -> in the copy, rename `### Not checked` to `### Gaps` in the security `audit.md`; exit 1, contains `audit skeletons differ`.
- [ ] Run `node --test tests/scripts/validate.test.mjs`; expected: the new test FAILS.
- [ ] Implement the check; write `web.md` and `audit.md`; add their pointers to SKILL.md with when to read each.
- [ ] Run `node --test tests/scripts/validate.test.mjs`; expected: 6 pass.
- [ ] Run `npm test`; expected: all pass; `wc -c skills/performance-optimization/SKILL.md` at most 8000.
- [ ] Commit `feat(performance-optimization): web reference, audit mode, shared skeleton check`

### Task 8: code-review checks performance and runs system audits   (Size: M)

**Files:** Modify `skills/code-review/SKILL.md`, `skills/code-review/references/reviewer-prompts.md`, `skills/code-review/references/review-checklists.md`; Create `evals/plugin/code-review-flags-n-plus-one/`, `evals/plugin/code-review-runs-system-audit/`

**Interfaces:**
- Consumes: Task 3 checklist path; Task 6 and Task 7 `audit.md` paths
- Produces: Standards checklist item `**Performance:** no query or network call inside a loop over data that grows; no unbounded read into memory; hot-path changes come with a measurement. Hand the reviewer skills/performance-optimization/references/performance-checklist.md when the diff touches a performance trigger.`; the Security item hands over `security-checklist.md` the same way; the Standards reviewer prompt gains `Security checklist:` and `Performance checklist:` lines. System target (a path or "the whole repo", no diff): dispatch two fresh `general-purpose` subagents in parallel, `model: "opus"` reading the security `audit.md`, `model: "sonnet"` reading the performance `audit.md`, each report under 600 words; the controller merges them under `## Security audit` and `## Performance audit` with one summary line.

**Acceptance (spec: Design 2d, code-review bullets):** a diff with a query in a loop gets a Performance finding at Important or above on the Standards axis; a system target runs both audits and never the Spec/Standards pair.

- [ ] Write the N+1 case: a diff adding a per-item `db.query` inside `for (const order of orders)`. Graders: `llm` PASS if Standards files it Important or Critical with `file:line`.
- [ ] Write the audit case: prompt "audit the whole repo for performance and security" with three pasted files. Graders: `regex` `#{1,6} *Security audit[\s\S]*#{1,6} *Performance audit`; `tool_used` Skill `code-review`.
- [ ] Run both with `--runs 1`; expected: FAIL (RED).
- [ ] Edit the three files per Interfaces.
- [ ] Re-run with `--runs 3`; expected: at least 2/3 each. Log it.
- [ ] Run `npm test`; expected: all pass.
- [ ] Commit `feat(code-review): performance item, checklist hand-off, system audit mode`

### Task 9: CI least privilege and full shellcheck   (Size: XS)

**Files:** Modify `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: none
- Produces: top-level `permissions: contents: read`; `actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6.1.0`, `actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6.5.0`; shellcheck step `shellcheck hooks/session-start hooks/guard $(git ls-files '*.sh')`.

**Acceptance (spec: Repo review findings 1, 6):** the token is read-only; actions are pinned to commit SHAs; every shipped shell script is shellchecked.

- [ ] Verify both SHAs: `git ls-remote https://github.com/actions/checkout refs/tags/v6.1.0 'refs/tags/v6.1.0^{}'` and the same for `actions/setup-node v6.5.0`; use the `^{}` value when present. If a later v6 tag exists, use it and ledger the change.
- [ ] Edit the workflow per Interfaces (the `hooks/guard` entry lands in Task 10; until then omit it).
- [ ] Run the shellcheck command locally; expected: exit 0.
- [ ] Report under `Unverified:` that the workflow runs only after a push.
- [ ] Commit `ci: read-only token, SHA-pinned actions, shellcheck every shell script`

### Task 10: Guard hook   (Size: M)

**Files:** Create `hooks/guard`, `tests/hooks/test-guard.sh`; Modify `hooks/hooks.json`, `package.json`, `.github/workflows/ci.yml`, `THIRD_PARTY.md`

**Interfaces:**
- Consumes: Task 2 hook checks; Task 9 shellcheck line
- Produces: `hooks.json` entry `"PreToolUse": [{"matcher": "Read|Edit|Write|Grep|Glob|Bash", "hooks": [{"type": "command", "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/guard\""}]}]`. Output on ask: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Legion guard: <basename> may contain secrets. Allow this <tool> call?"}}`. On deny: same envelope, `"deny"`, reason `"Legion guard: broad scan of <dir>/ blocked; search a narrower path or read the file directly. Set LEGION_GUARD=off to disable."`. Allow: exit 0, no output. Fields read: `file_path` (Read, Edit, Write), `path` and `glob` (Grep), `pattern` and `path` (Glob), `command` (Bash). npm `test:hooks` runs both hook tests.

**Acceptance (spec: Design 2e; Success criteria guard tests):** secret files ask; broad scans of `node_modules`, `dist`, `build` deny; one named file inside them is allowed; `LEGION_GUARD=off` and unparseable input allow; no external process is forked; matched content is never printed.

- [ ] Write `tests/hooks/test-guard.sh` (same style as `test-session-start.sh`: pipe JSON in, parse output with node). Expected decision per input:
  1. Read `/p/.env` -> ask
  2. Read `/p/.env.example` -> allow
  3. Read `/p/.env.local` -> ask
  4. Read `/p/certs/server.pem` -> ask
  5. Bash `cat .env` -> ask
  6. Bash `cat .env.sample` -> allow
  7. Grep `path` `/p/node_modules` -> deny
  8. Glob `pattern` `**/node_modules/**` -> deny
  9. Bash `grep -rn foo node_modules` -> deny
  10. Bash `npm run build` -> allow
  11. Read `/p/node_modules/lodash/package.json` -> allow
  12. `LEGION_GUARD=off`, Read `/p/.env` -> allow
  13. stdin `not json` -> allow, exit 0
  14. Read `/p/my dir/.env` -> ask
  15. every ask/deny output parses as JSON with `hookEventName` `PreToolUse`
  16. Edit `/p/id_rsa` -> ask
  17. Write `file_path` `/p/README.md`, `content` `copy .env.example to .env` -> allow
  18. Bash `ls dist` -> allow
- [ ] Run `bash tests/hooks/test-guard.sh`; expected: FAIL, hook missing (RED).
- [ ] Write `hooks/guard` with bash builtins only (`[[ =~ ]]`, parameter expansion, `printf`); `chmod +x`; register it in `hooks.json`; add it to `test:hooks` and the CI shellcheck line; THIRD_PARTY row (claudekit `privacy-block`, `scout-block`: idea only, rewritten).
- [ ] Run `bash tests/hooks/test-guard.sh`; expected: 18 PASS.
- [ ] Time 100 calls of case 1 (`time for i in {1..100}; do ...; done`); expected: under 2 s; report the figure.
- [ ] Run `npm test` and the shellcheck command; expected: all pass.
- [ ] Commit `feat(hooks): guard asks before secret files and denies broad dependency scans`

### Task 11: Session-start hook escapes every control character   (Size: XS)

**Files:** Modify `hooks/session-start`, `tests/hooks/test-session-start.sh`

**Interfaces:**
- Consumes: none
- Produces: `escape_for_json` emits `\u00XX` for every U+0000-U+001F other than `\n`, `\r`, `\t`.

**Acceptance (spec: Repo review finding 2):** the hook's output is valid JSON when the router contains `\x07` or `\x0c`.

- [ ] Add check `control characters stay valid JSON`: fixture plugin root in a temp dir whose `skills/using-legion/SKILL.md` body contains `bell\x07 ff\x0c end`; expect valid JSON whose context contains `bell`.
- [ ] Run `bash tests/hooks/test-session-start.sh`; expected: the new check FAILS.
- [ ] Fix `escape_for_json` with a loop over the 29 remaining code points using `printf -v` (bash builtins only).
- [ ] Run the test, `npm test`, and shellcheck; expected: all pass.
- [ ] Commit `fix(hooks): escape every control character in the session-start JSON`

### Task 12: Thinking-model gaps and the matrix   (Size: M)

**Files:** Modify `skills/executing-plans/SKILL.md`, `skills/systematic-debugging/SKILL.md`, `skills/skill-creator/SKILL.md`, `docs/architecture.md`

**Interfaces:**
- Consumes: Task 5's quick-path numbering
- Produces: quick-path step "List the reach" before the TDD cycle: when the change alters a public signature, behavior other code relies on, or persisted data, list its callers, consumers, and the data it reaches, and add a test for each one the change can break; debugging step 4 orders hypotheses by likelihood for the cost of checking; skill-creator step 6 writes near-miss prompts where the skill must not fire, and its checklist gains `- [ ] Names which of first principles, inversion, systems thinking, Pareto the skill applies, and at which step`; `docs/architecture.md` section `## Thinking-model matrix` with a skill x model table, each cell a step name or "n/a".

**Acceptance (spec: Repo review, models table):** the four gaps closed; the matrix covers every skill; `executing-plans/SKILL.md` stays within Task 5's 1,200-byte budget plus 400 bytes for this step.

- [ ] Run `npm test`; record the baseline (no behavioral RED: these edits are judged by the task reviewer against the models table).
- [ ] Make the four edits and write the matrix.
- [ ] Run `npm test` and `wc -c skills/executing-plans/SKILL.md`; expected: all pass, size within budget.
- [ ] Commit `docs(skills): close thinking-model gaps and map each model to its step`

### Task 13: Evals that grade generated code   (Size: M)

**Files:** Create `evals/plugin/coding-principles-shapes-new-module/`, `evals/plugin/executing-plans-batches-queries/`, `evals/plugin/security-and-hardening-holds-under-internal-pressure/`, `evals/plugin/systematic-debugging-holds-under-quick-fix-pressure/`

**Interfaces:**
- Consumes: Tasks 3-8
- Produces: one generated-code case per criterion plus two pressure cases.

**Acceptance (spec: Phase 3, generated-code graders; Success criteria):** coding principles: reply names a rule set and answers its checklist (`regex` `Principles:`, `llm` on the shape); performance: a feature request whose natural code loops queries ends in one batched query; security pressure: "it's internal, skip the validation" still gets boundary validation; debugging pressure: "just try a quick fix" still builds a reproduction first.

- [ ] Write the four cases with graders as above.
- [ ] Run them with `--runs 1` against the plugin; record which arm passes (the no-plugin arm is the RED).
- [ ] Run with `--runs 3`; expected: at least 2/3 and a positive delta each. Log it; fix per Task 1's loop.
- [ ] Commit `test(evals): grade the code agents write for principles, security, performance`

### Task 14: Fires and quiet cases for the remaining skills   (Size: M)

**Files:** Create `evals/plugin/<skill>-fires-*/` and `evals/plugin/<skill>-stays-quiet-*/` for `brainstorming`, `writing-plans`, `defining-terms`, `coding-principles`, `security-and-hardening`, `skill-creator`

**Interfaces:**
- Consumes: none
- Produces: twelve cases; each fires case has a `tool_used` grader for its skill, each quiet case `min: 0 max: 0 arm: both`.

**Acceptance (spec: Phase 3; Success criteria "every skill has at least one fires and one stays-quiet case"):** the quiet prompts are near misses taken from each skill's `evals/triggers/<skill>.json` negatives.

- [ ] Write the twelve cases.
- [ ] Smoke-run them: `claude plugin eval . --no-publish --model sonnet --runs 1 --case '*-fires-*'`, then the same with `--case '*-stays-quiet-*'`; expected: every case executes (scores are judged in Task 15).
- [ ] Commit `test(evals): fires and stays-quiet cases for every skill`

### Task 15: Full suite run and fix loop   (Size: S)

**Files:** Modify `docs/evals.md`, and skill files only as the fix loop requires

**Interfaces:**
- Consumes: Task 1 cost estimate; every case
- Produces: the 0.11.0 baseline in `docs/evals.md`.

**Acceptance (spec: Phase 1 step 3-4, Success criteria):** the user approved the cost first; every case meets the bar or is resolved by the fix loop or a user decision.

- [ ] Report the case count and estimated cost to the user; wait for approval (Global constraints).
- [ ] Run `claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.67 --json evals/results/2026-11-09-full.json`.
- [ ] Log every case; for each miss apply Task 1's loop.
- [ ] Run `npm test`; expected: all pass.
- [ ] Commit `test(evals): full 0.11.0 behavioral baseline`

### Task 16: Release 0.11.0   (Size: S)

**Files:** Modify `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CHANGELOG.md`, `README.md`, `docs/architecture.md`, `docs/roadmap.md`

**Interfaces:**
- Consumes: everything above
- Produces: version `0.11.0` in all three manifests.

**Acceptance (spec: Release):** versions match; CHANGELOG `## 0.11.0 - <date>` lists every change; architecture gains a `## Performance, security, and proven skills (0.11.0)` section with decisions and reasons; roadmap items 1 and 8 closed, 7 marked partly done; README links `docs/evals.md`.

- [ ] Run `npm run validate` after bumping only `package.json`; expected: FAIL, version mismatch (RED).
- [ ] Bump the other two and write the docs.
- [ ] Run `npm test` and `claude plugin validate . --strict`; expected: all pass.
- [ ] Commit `chore(release): 0.11.0`
