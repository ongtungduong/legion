# Principles Merge and Three-Axis System Audit Implementation Plan

> Execute with legion:executing-plans. Steps use `- [ ]` checkboxes.

**Goal:** One standards skill (`principles`: system design, coding, performance, security) and one checking skill (`code-review`: diff review, security questions, and a whole-repo audit on system design, performance, and security), released as 0.13.0.
**Architecture:** `coding-principles` is renamed `principles` and absorbs the build-mode security standard as `references/security.md`. Everything that checks code (security review rules, attack classes, domain companions, audit phases, scripts, the performance audit) moves under `skills/code-review/`, which gains a system-design audit and one orchestration file for whole-repo audits. `security-principles` is deleted.
**Spec:** `.legion/specs/2026-11-12-principles-merge-design.md`
**Design principles:** coding + coding-existing-code (the only program change is the audit-skeleton rule in `scripts/validate.mjs`; the rest is moving and editing skill text under the repo's own conventions in `AGENTS.md`)
**Security:** none (no product trust boundary; the behavioral risk, weaker security triggering, is covered by the evals in Tasks 3 and 4)
**Performance:** token cost per task: an XS change with no trust boundary loads no more than in 0.12.5 (`skills/executing-plans/SKILL.md` at most 11,603 bytes); `skills/principles/SKILL.md` under 10,000 bytes
**Slice order:** Task 1 is the tracer: the rename touches every consumer of the standards skill and proves validate, spec, trigger, and eval tooling survive a skill rename. Task 2 widens the audit-skeleton rule so later moves stay checked. Tasks 3 and 4 deliver the core goal (one standard, one checker) and retire the largest risk (security triggering regresses). Task 5 adds the new system-design axis. Task 6 is the docs and release tail; it is required by `AGENTS.md`, so nothing is proposed for later.

## Global constraints
- `description` is at most 1024 characters (agentskills.io spec).
- `SKILL.md` under 20,000 bytes (`AGENTS.md`).
- Always: `git mv` for moved files so history follows; run `npm test` after each slice; keep every rule's text when moving it, unless the move makes it wrong.
- Ask first: dropping a rule or gotcha during the merge; deleting an eval case instead of renaming it; any grader change beyond the skill name and headings; spending more than the 0.12.0 full-suite cost on evals.
- Never: loosen a grader to pass; copy content from claudekit-engineer; leave `security-principles` or `coding-principles` named outside history (`CHANGELOG.md`, `docs/architecture.md` past sections, `.legion/` specs and plans).
- Skill edits follow `legion:skill-creator` (call the Skill tool with it before the first skill edit); everything in English; cross-skill instructions say "Call the Skill tool with `legion:<name>`"; the three version fields match.
- The 0.12.0 full-suite eval cost is $10.16 (`docs/evals.md`); the sum of every eval run in this plan stays under it.
- Eval command form (`docs/evals.md`): `claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.66 --case '<case>' --json evals/results/<file>.json`; a case passes at 2 of 3 runs; record model, Claude Code version, and cost.

## Review focus
1. Moved security files keep stale plain-text paths that `validate.mjs` does not check (it checks Markdown links and `legion:` refs only): "`references/review.md`", "`references/audit.md`", "the security-principles skill's references folder", "`<skill-dir>/scripts`" meaning the old skill. Expected: every such path names the new location. Pinned by the grep in Task 3, step "Stale paths".
2. A request that already approves scope and budget ("scope and budget approved, run it now") is not asked again; one with no approval gets one proposal that covers all axes, not one per axis. Pinned by `code-review-runs-design-audit` (Task 5) and `code-review-proposes-three-axis-audit` (Task 5).
3. An XS change that crosses a trust boundary still loads the `security` reference, and an XS change that crosses none loads nothing new. Pinned by `executing-plans-loads-security-on-auth-change` and `executing-plans-cost-on-one-line-fix` (Task 4).
4. A named axis runs alone: "audit the repo for performance" runs only the performance audit and is routed to `code-review`, not `principles`. Pinned by the moved trigger prompt in Task 2 and `code-review-runs-system-audit` (Task 3).
5. A diff review's Security finder reads the new paths (`code-review/references/security-review.md`, `attack-classes.md`, and the Final checklist of `principles/references/security.md`). Pinned by the grep in Task 4, step "Stale paths", and `code-review-fires-on-is-this-safe` (Task 3).

## Pre-mortem
- The trimmed `principles` description loses the trust-boundary words and the model stops loading the security standard on "add login" or "store API keys" -> Task 4 runs `executing-plans-loads-security-on-auth-change` (+ `-hard`) and `principles-holds-security-under-pressure`; trigger positives for those phrasings stay in `principles.json`.
- The `code-review` description, after gaining "is this safe", "security audit", "pen-test", and "system design audit", exceeds 1024 characters or turns near-duplicate with `principles`, so `validate:spec` or `evals:triggers` fails late -> Tasks 3 and 5 run `npm run validate:spec` and `npm run evals:triggers` and print both description lengths; Review focus 4.
- The whole-repo audit stops at its budget proposal in every session, so the new system-design audit never produces a finding and its eval cannot pass -> `system-audit-flow.md` states that approval given in the request counts (Task 5); the design-audit eval prompt carries that approval; Review focus 2. Question for the user at hand-off: is one manual three-axis run (cost above the eval cap) wanted before release?

---

### Task 1: Rename `coding-principles` to `principles`   (Size: M; many files, one mechanical change that cannot be split: `validate.mjs` fails on any stale `legion:` ref)

**Files:** Move `skills/coding-principles/` -> `skills/principles/`; Move `evals/triggers/coding-principles.json` -> `evals/triggers/principles.json`; Move `evals/plugin/coding-principles-{fires-on-refactor,fires-on-slow-endpoint,shapes-new-module,stays-quiet-on-glossary,stays-quiet-on-regression}/` -> `evals/plugin/principles-*`; Modify every file that names `coding-principles` under `skills/`, `evals/`, `tests/`, `README.md`, `THIRD_PARTY.md`, `docs/roadmap.md`; Modify `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`

**Interfaces:**
- Consumes: none
- Produces: skill `legion:principles` at `skills/principles/` (frontmatter `name: principles`, title `# Principles`); trigger file `evals/triggers/principles.json`; eval cases `principles-fires-on-refactor`, `principles-fires-on-slow-endpoint`, `principles-shapes-new-module`, `principles-stays-quiet-on-glossary`, `principles-stays-quiet-on-regression`; version `0.13.0`

**Acceptance (spec: Design, decision 1; Success criteria 1-3 for this name):** no file outside history names `coding-principles`; `npm test` passes at 0.13.0.

- [ ] RED: run `grep -rln "coding-principles" skills hooks scripts tests evals README.md THIRD_PARTY.md docs/roadmap.md`; expected: a non-empty list (the rename's to-do list)
- [ ] `git mv` the directories and files above; set frontmatter `name: principles` and the title `# Principles`
- [ ] Replace `coding-principles` with `principles` in every listed file, including grader patterns (`'"skill"\s*:\s*"(?:legion:)?principles"'`), trigger `owner` fields, `expected_outcome` lines, and the `skills/coding-principles/references` paths in `implementer-prompt.md`, `task-reviewer-prompt.md`, `reviewer-prompts.md`
- [ ] Set version `0.13.0` in `package.json`, `plugin.json`, `marketplace.json` (the bump rule fails once shipped files differ from `v0.12.5`)
- [ ] GREEN: the grep above prints nothing
- [ ] Run `npm test`; expected: exit 0
- [ ] Commit `refactor(principles)!: rename coding-principles to principles`

### Task 2: All audit reports live in `code-review`; the skeleton rule covers `*-audit.md`   (Size: S)

**Files:** Move `skills/principles/references/audit.md` -> `skills/code-review/references/performance-audit.md`; Create `skills/code-review/references/system-audit-flow.md`; Modify `skills/code-review/SKILL.md`, `skills/principles/SKILL.md`, `skills/using-legion/SKILL.md`, `scripts/validate.mjs`, `tests/scripts/validate.test.mjs`, `evals/triggers/principles.json`, `evals/triggers/code-review.json`

**Interfaces:**
- Consumes: `skills/principles/` (Task 1)
- Produces: `skills/code-review/references/performance-audit.md`; `skills/code-review/references/system-audit-flow.md` (the "System audit (no diff)" section of `code-review/SKILL.md`, moved verbatim, its links rewritten to the new paths); skeleton rule: every `skills/*/references/` file named `audit.md` or `<name>-audit.md` must have the shared skeleton under `## Report`
- Ruling: the orchestration file is `system-audit-flow.md`, not the spec's `system-audit.md`, because the widened rule would treat `system-audit.md` as an audit report and fail it for having no skeleton

**Acceptance (spec: Design, `code-review` table rows 1 and 7; Rest of the chain, `validate.mjs`):** the performance audit is read from `code-review`; `principles` no longer mentions an audit; a `*-audit.md` without a skeleton fails validation.

- [ ] Write the failing test `an *-audit.md without a report skeleton fails` in `tests/scripts/validate.test.mjs`: on a repo copy, create `skills/code-review/references/x-audit.md` containing `# X audit\n` and assert exit code 1 and output matching `/x-audit\.md: no report skeleton/`
- [ ] Run `node --test tests/scripts/validate.test.mjs`; expected: FAIL on that test (exit code 0, because the rule reads only `audit.md`)
- [ ] In `scripts/validate.mjs`, build `audits` from each `skills/<name>/references/` directory, keeping files matching `/^(?:[a-z0-9-]+-)?audit\.md$/`
- [ ] Point the existing `audit skeletons must match` test at `skills/code-review/references/performance-audit.md`
- [ ] `git mv` the performance audit; create `system-audit-flow.md`; leave in `code-review/SKILL.md` a three-line `## System audit (no diff)` pointer that says when to read the flow file. In `principles/SKILL.md` remove the `audit` table row and "or for a performance-only audit of a whole codebase, repo, or system" from the description. Move "a performance-only audit (no diff)" from the principles row of the router to the `code-review` row
- [ ] Move any `principles.json` positive prompt about auditing a whole repo for performance to `code-review.json`
- [ ] Run `node --test tests/scripts/validate.test.mjs`; expected: PASS
- [ ] Run `npm test`; expected: exit 0
- [ ] Commit `refactor(code-review): own the performance audit and the system audit flow`

### Task 3: Security review and audit move into `code-review`   (Size: M; mostly `git mv`)

**Files:** Move from `skills/security-principles/references/` to `skills/code-review/references/`: `review.md` -> `security-review.md`, `audit.md` -> `security-audit.md`, and unchanged names `reconnaissance.md`, `hunting.md`, `validation-and-reporting.md`, `attack-classes.md`, `web-protocol-and-auth.md`, `client-side.md`, `ai-and-llm.md`, `supply-chain-and-release.md`, `cloud-and-deployment.md`, `protocols-rpc-and-messaging.md`, `resource-exhaustion-and-availability.md`, `data-isolation-and-lifecycle.md`, `desktop-mobile-and-local-ipc.md`, `memory-safety-and-binary.md`; Move `skills/security-principles/scripts/` -> `skills/code-review/scripts/`; Move `evals/plugin/security-principles-fires-on-is-this-safe/` -> `evals/plugin/code-review-fires-on-is-this-safe/`; Modify `skills/code-review/SKILL.md`, `skills/code-review/references/{reviewer-prompts.md,system-audit-flow.md}`, `skills/security-principles/SKILL.md`, `skills/using-legion/SKILL.md`, `tests/security-audit/*.cjs`, `tests/scripts/validate.test.mjs` (if a test names a moved file), `evals/triggers/{security-principles,code-review}.json`, `README.md`, `THIRD_PARTY.md`

**Interfaces:**
- Consumes: `system-audit-flow.md` and the `*-audit.md` rule (Task 2)
- Produces: `code-review` target "A security question about code" (pasted code, a file, or a diff) -> focused review per `references/security-review.md` (its guidance output format, no output directory, Security reviewer only); the mode gate in `code-review/SKILL.md`: loading the skill authorizes no audit, a whole-repo review proposes scope and budget and waits for approval, an ambiguous security request gets one focused question before any file is written; `system-audit-flow.md` runs `references/security-audit.md` in the main session instead of calling another skill; `security-principles` left with build mode only (Workflow, Boundaries, Gotchas, `security-checklist.md`)

**Acceptance (spec: decision 4; Design, `code-review` table and `SKILL.md` bullets):** "is this safe?" and security audits route to `code-review`; the audit's files, scripts, and tests run from their new place.

- [ ] Run `node --test tests/security-audit/validate-findings.test.cjs`; expected: PASS (baseline before the move)
- [ ] `git mv` the files and `scripts/`; update the `require` paths in `tests/security-audit/*.cjs` to `../../skills/code-review/scripts/`
- [ ] Run `node --test tests/security-audit/validate-findings.test.cjs tests/security-audit/validate-coverage-ledger.test.cjs`; expected: PASS
- [ ] Rewrite links inside the moved files (`review.md` -> `security-review.md`, `audit.md` -> `security-audit.md`) and the `code-review` text that cites `legion:security-principles` for guidance mode, deep-depth Security, the security finding rule, and the system audit
- [ ] Stale paths: run `grep -rnE "references/(review|audit)\.md|security-principles skill|security-principles\b.*references" skills/code-review`; expected: no output
- [ ] Trim `security-principles` to build mode: remove its Guidance and Full audit modes and their file pointers; its description keeps only building triggers (untrusted input, login, sessions, authorization, secrets, uploads, user-supplied URLs, packages, personal data, LLM output)
- [ ] `code-review` description gains: answers whether code is safe or vulnerable; security audit, pen-test, find vulnerabilities. Trim other wording to stay at or under 1024 characters
- [ ] Router: the `code-review` row gains "a security question about code ('is this safe?'), a security audit, pen-test, or vulnerability hunt"; the security row loses them
- [ ] Move the trigger positives `Is this login handler safe against SQL injection?`, `Audit our dependencies for known vulnerabilities`, `Do a full security audit of this codebase and write the report`, `Pen-test the code in this repo and find exploitable vulnerabilities` from `security-principles.json` to `code-review.json`
- [ ] In `code-review-fires-on-is-this-safe`, change only the skill name in the grader pattern and `expected_outcome`
- [ ] Update `README.md` rows and `THIRD_PARTY.md` paths for the moved files
- [ ] Run `npm test`; expected: exit 0. Print both description lengths (`npm run validate:spec` passes)
- [ ] Run the eval command for `code-review-fires-on-is-this-safe`, `security-audit-on-system`, and `code-review-runs-system-audit`, one `--case` each; expected: each passes 2 of 3; ledger the costs
- [ ] Commit `refactor(code-review): own security review and the full security audit`

### Task 4: The security standard joins `principles`; `security-principles` is removed   (Size: M)

**Files:** Move `skills/security-principles/references/security-checklist.md` -> `skills/principles/references/security.md` (then edit); Delete `skills/security-principles/`, `evals/triggers/security-principles.json`; Move `evals/plugin/security-principles-holds-under-internal-pressure/` -> `evals/plugin/principles-holds-security-under-pressure/`, `evals/plugin/security-principles-stays-quiet-on-glossary-rename/` -> `evals/plugin/principles-stays-quiet-on-glossary-rename/`; Modify `skills/principles/SKILL.md`, `skills/executing-plans/SKILL.md`, `skills/executing-plans/references/{plan-workflow.md,implementer-prompt.md,task-reviewer-prompt.md}`, `skills/writing-plans/SKILL.md`, `skills/writing-plans/assets/plan-template.md`, `skills/systematic-debugging/SKILL.md`, `skills/code-review/SKILL.md`, `skills/code-review/references/reviewer-prompts.md`, `skills/using-legion/SKILL.md`, `evals/triggers/*.json`, `evals/plugin/executing-plans-loads-security-on-auth-change{,-hard}/graders/`, `tests/scripts/validate.test.mjs`, `README.md`, `THIRD_PARTY.md`

**Interfaces:**
- Consumes: `security-principles` reduced to build mode (Task 3)
- Produces: `skills/principles/references/security.md` with sections `## Workflow` (the seven build steps), `## Boundaries` (always / ask first / never, verbatim), `## Gotchas` (verbatim), `## Final checklist` (the checklist items, verbatim); `principles/SKILL.md` table row `security` with the trigger "Crosses a trust boundary (untrusted input, auth, sessions, secrets, uploads, user-supplied URLs, third-party packages, personal data, LLM output), whatever the size"; the precedence paragraph; the brownfield gotcha; output format without the `Security:` line

**Acceptance (spec: decision 2; Design, `skills/principles/`; Rest of the chain; Success criteria 1, 2, 4):** the security standard is a `principles` reference loaded on any trust-boundary change; no file outside history names `security-principles`.

- [ ] RED: run `grep -rln "security-principles" skills hooks scripts tests evals README.md THIRD_PARTY.md`; expected: a non-empty list
- [ ] `git mv` the checklist to `principles/references/security.md` and build it to the sections above from `security-principles/SKILL.md`; then `git rm -r skills/security-principles`
- [ ] `principles/SKILL.md` step 4: read `references/security.md` before the design is fixed when the change crosses a trust boundary, whatever its size. Add the precedence paragraph: "Order: the `security` reference, then documented repo conventions, then the other references, then the smell baseline. When the user asks to drop a security control, keep the cheap control and say in one line what it stops; drop it only if the user insists after that." Add the gotcha: "Code you write or change meets every loaded reference; violations in code the task does not touch are reported as FYI and fixed only when asked." Remove the `Security:` output line; `Checklist:` covers `security` when loaded
- [ ] `principles` description (≤ 1024): four standards, then when: designing, refactoring, legacy code, making code faster, writing code that crosses a trust boundary. No checking words ("audit", "pen-test", "is this safe")
- [ ] `executing-plans/SKILL.md` rule 3 names the precedence; quick-path step 2's second bullet becomes "the `security` reference of `legion:principles` when the change touches ... (trigger list unchanged). An XS change gets it too"; step 6 and the ask-first sentence name the `security` reference. `plan-workflow.md` step 6 the same
- [ ] Prompts: the security checklist path becomes `<principles base>/references/security.md (its Final checklist)` in `implementer-prompt.md`, `task-reviewer-prompt.md`, `reviewer-prompts.md`, and `code-review/SKILL.md` step 3.3
- [ ] `writing-plans/SKILL.md` and `plan-template.md`: the `Security` line loads the `security` reference of `legion:principles`; `systematic-debugging/SKILL.md` the same for a security cause
- [ ] Router: remove the security row; the principles row gains "code that crosses a trust boundary: untrusted input, auth, secrets, personal data, LLM output"; the flow line reads `principles (design, code, performance, security)`
- [ ] Triggers: move the remaining `security-principles.json` positives into `principles.json`; repoint every `owner: "security-principles"` to `principles` or `code-review` by the prompt; delete `security-principles.json`
- [ ] Evals: rename the two cases above, changing only the skill name in graders and `expected_outcome`. In both `executing-plans-loads-security-on-auth-change` cases replace `graders/security-loaded.md` with `graders/principles-loaded.md` (`type: tool_used`, `tool: Skill`, `input_match: '"skill"\s*:\s*"(?:legion:)?principles"'`) and add `graders/security-read.md` (`type: tool_used`, `tool: Read`, `input_match: 'principles/references/security\.md'`), as the spec's Evals table states
- [ ] `tests/scripts/validate.test.mjs`: the `link out of the skill root fails` test edits `skills/principles/references/security.md`
- [ ] Stale paths: run `grep -rnE "security-checklist\.md|security-principles" skills tests evals`; expected: no output
- [ ] GREEN: the RED grep prints nothing
- [ ] Run `npm test`; expected: exit 0. Run `wc -c skills/principles/SKILL.md skills/executing-plans/SKILL.md`; expected: under 10,000 and at most 11,603
- [ ] Run the eval command for `executing-plans-loads-security-on-auth-change`, `executing-plans-loads-security-on-auth-change-hard`, `principles-holds-security-under-pressure`, `principles-stays-quiet-on-glossary-rename`, `executing-plans-cost-on-one-line-fix`, one `--case` each; expected: each passes 2 of 3; ledger the costs
- [ ] Commit `refactor(principles)!: fold the security standard in and remove security-principles`

### Task 5: Whole-repo audit on three axes, with a system-design audit   (Size: M)

**Files:** Create `skills/code-review/references/system-design-audit.md`; Modify `skills/code-review/references/system-audit-flow.md`, `skills/code-review/SKILL.md` (description), `skills/using-legion/SKILL.md`, `evals/triggers/{code-review,principles}.json`; Create `evals/plugin/code-review-runs-design-audit/{prompt.md,graders/skill-fired.md,graders/design-finding.md}`, `evals/plugin/code-review-proposes-three-axis-audit/{prompt.md,graders/skill-fired.md,graders/proposal.md}`

**Interfaces:**
- Consumes: `system-audit-flow.md`, `performance-audit.md`, `security-audit.md` (Tasks 2-3); `principles/references/system-design.md` (Task 1)
- Produces: `system-design-audit.md` (Procedure + `## Report` in the shared skeleton); `system-audit-flow.md` steps 1-6 as the spec's Design section lists them, with headings `## System design audit`, `## Performance audit`, `## Security audit`
- Ruling: the spec's Evals table says `security-audit-on-system` and `code-review-runs-system-audit` should expect three headings, but their prompts name their axes (security; performance and security), and decision 5's default runs only named axes. They keep their graders; the no-axis default is pinned by the new `code-review-proposes-three-axis-audit` instead

**Acceptance (spec: decision 5; Design, `references/system-audit.md` and `references/system-design-audit.md`; Success criterion 7):** a whole-repo review with no axis named proposes all three axes and waits; with approval, the design audit reports a rule-backed finding.

- [ ] RED: create `system-design-audit.md` with its Procedure only; run `npm run validate`; expected: FAIL with `system-design-audit.md: no report skeleton`
- [ ] Write the Procedure from the spec: read `principles/references/system-design.md`; map modules, dependency direction and cycles, owners of rules and state, sources of truth, data stores, external calls and their failure handling; a finding quotes a rule of that file's final checklist and names a failure, consistency, or change scenario; no consequence -> at most Minor; severities Critical / Important / Minor / FYI as the spec defines them; fixes are the smallest change that restores the rule. End with the shared `## Report` skeleton copied from `performance-audit.md`
- [ ] GREEN: `npm run validate`; expected: exit 0
- [ ] `system-audit-flow.md`: all three axes when none is named, only the named ones otherwise; one proposal (axes, partitions, agent count, security profile, output directory) before any agent; approval given in the request counts; system-design and performance auditors are `general-purpose` subagents on `sonnet` dispatched in one message, security runs in the main session; one fresh `opus` verifier per Critical design or performance candidate and one for the Important batch; a request to find bugs (logic) across the whole repo is out of scope: say so and offer a diff or scoped review; report the three headings, then one count line with the security mapping as today
- [ ] `code-review` description gains "audit the system design or architecture of a whole repo" (≤ 1024); the router row names system design among the whole-repo axes
- [ ] Triggers: `code-review.json` positive `Audit the system design of this whole repository`; `principles.json` negative `{ "prompt": "Audit the architecture of the whole repo", "owner": "code-review" }`; `code-review.json` negative `{ "prompt": "Design the module boundaries for the new billing service", "owner": "principles" }`
- [ ] Eval `code-review-runs-design-audit`: prompt pastes a three-file repo where `src/orders.js` stores `order.total` at checkout and `src/invoices.js` recomputes the total from line items with its own discount rule, then says "Audit the system design of this whole repo. These are all its files. Scope and budget are approved; run it now." (`allowed_tools: [Read, Glob, Grep, Skill, Agent]`, `max_turns: 16`). `skill-fired.md`: `tool_used` Skill matching `code-review`. `design-finding.md` (`type: llm`): PASS if a "System design audit" heading reports the two sources of truth for the order total with both file locations, cites a system-design rule, and labels it Important or Critical; FAIL if it is missing, below Important, or the reply only proposes a rewrite with no consequence
- [ ] Eval `code-review-proposes-three-axis-audit`: the same files, prompt "Review this whole codebase." `proposal.md` (`type: llm`): PASS if the reply proposes scope and budget naming system design, performance, and security, and waits for approval; FAIL if it reports findings as if an audit ran, or names fewer axes
- [ ] Run `npm test`; expected: exit 0
- [ ] Run the eval command for `code-review-runs-design-audit` and `code-review-proposes-three-axis-audit`, one `--case` each; expected: each passes 2 of 3; ledger the costs
- [ ] Commit `feat(code-review): audit a whole repo on system design, performance, and security`

### Task 6: Docs and release notes   (Size: S)

**Files:** Modify `docs/architecture.md`, `docs/evals.md`, `docs/roadmap.md`, `CHANGELOG.md`, `README.md`

**Interfaces:**
- Consumes: every name above
- Produces: a `## Principles and checks split (0.13.0)` section in `docs/architecture.md` (decision table from the spec's Design and decisions 1-5); a one-line "Superseded in 0.13.0" note under the 0.12.4 section; updated thinking-model matrix rows (`principles`; the security row's audit cells under `code-review`); `CHANGELOG.md` `## 0.13.0 - <release date>` with a Breaking entry for both removed skill names; `docs/evals.md` rows for the runs in Tasks 3-5 with model, Claude Code version, and cost

**Acceptance (spec: Rest of the chain, Docs; Success criteria 2, 3, 5, 6):** docs match the shipped skills; every check passes.

- [ ] Write the docs above; history sections keep their old names
- [ ] Run `grep -rn "security-principles\|coding-principles" skills hooks scripts tests evals README.md THIRD_PARTY.md`; expected: no output
- [ ] Run `npm test`; expected: exit 0
- [ ] Run `claude plugin validate . --strict`; expected: passes with no errors
- [ ] Sum the eval costs from the ledger; expected: under $10.16
- [ ] Commit `docs: record the 0.13.0 principles and checks split`
