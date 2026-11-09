# Performance, Security, and Proven Skills Design

## Intent
Make Legion complete in two directions the maintainer named: (1) the chain
catches performance and security problems, both while code is written and when
the whole system is audited; (2) every skill has measured evidence that it fires
when it should, stays quiet when it should not, and improves the result over a
run without the plugin. Legion is a public plugin on GitHub, so the evidence
has to hold for other users' sessions, not only the maintainer's.

## Goals / Non-goals / Anti-goals
- Goals:
  - A `performance-optimization` skill, model-invocable, also loaded by the
    chain the way `coding-principles` is.
  - `security-and-hardening` loaded by the chain the same way, plus a system
    audit mode; upstream fixes from addyosmani/agent-skills folded in.
  - `code-review` runs a system audit (no diff) through both skills.
  - A `PreToolUse` guard hook: asks before secret files are touched, denies
    broad scans of build and dependency folders.
  - Behavioral evals for every skill, run, recorded, and passing the agreed
    bar; a fix-or-remove loop for skills that miss it.
- Non-goals:
  - Running behavioral evals in CI (needs credentials, costs tokens; roadmap 2).
  - Bundling profilers, scanners, or any dependency. Agents use the project's
    own tools.
  - Other addy domain skills (observability, CI/CD, API design, frontend).
  - Statistical significance: 3 runs per case is a coarse signal.
- Anti-goals:
  - The two skills loading on every edit, raising the per-task token cost the
    0.10 cuts removed.
  - Audit reports or perf claims with numbers nobody measured.
  - A guard that blocks ordinary work or that cannot be turned off.
  - Graders that pass without the plugin too, so a green suite proves nothing.

## First principles
- Goal (no solution words): Legion catches performance and security problems
  while coding and across a whole system, and each skill is shown to make the
  agent's work better than without it.
- Must be true:
  - Every skill description sits in context in every session; a new skill
    costs tokens everywhere, and `trigger-evals.mjs` fails on near-duplicate
    descriptions (source: `docs/architecture.md`, `scripts/trigger-evals.mjs`).
  - Skills cannot reference another skill's files (agentskills.io spec;
    `docs/architecture.md` 0.6.0/0.7.0).
  - `claude plugin eval` (Claude Code 2.1.319) runs a with/without ablation by
    default, 3 runs per case, supports `--threshold`, `--max-cost-usd`,
    `--model`; LLM judge defaults to haiku (source: `claude plugin eval --help`).
  - The 6 existing behavioral cases have never been run (no results directory).
  - Reading source cannot measure performance; numbers need a source (field,
    lab, trace) or the finding is "potential impact" (source: addy
    `agents/web-performance-auditor.md`).
  - Hooks use bash builtins only (hard constraint: architecture foundation 4).
  - `SKILL.md` under 20,000 bytes (hard constraint: `AGENTS.md`).
- Assumptions questioned:
  - "Performance needs its own skill" -> keep: no description owns "optimize",
    "N+1", "Core Web Vitals"; `systematic-debugging` owns only regressions.
  - "System audit needs its own skill" -> drop: it is a mode of each domain
    skill; a separate one adds a description and collides with security and
    code-review triggers.
  - "The shared audit frame must live in one file" -> drop: cross-skill refs
    are not allowed; each skill keeps a short copy, checked for drift.
  - "Evals must run in CI" -> drop: convention only; run locally, record model
    and CLI version.
  - "A hook is needed to protect `.env`" -> asked; user agreed: native
    `permissions.deny` exists but needs per-user setup.

## Repo review (2026-11-09)

The user widened the goal: the three criteria (coding principles, security,
performance) must hold for Legion's own code and for the code agents write
under Legion, and the whole repo must carry the four thinking models (first
principles, inversion, systems thinking, Pareto). Baseline: `npm test` and
shellcheck pass on 0.10.0.

### Code agents write under Legion: where each criterion is enforced

| Point in the chain | Coding principles | Security | Performance |
|---|---|---|---|
| `brainstorming` design-doc template | n/a | Boundaries only; no trust boundaries or threat model | none |
| `writing-plans` + plan template | `Design principles` line | none | none |
| `executing-plans` quick path | loaded (XS skips) | only "review if risky" after coding; skill never loaded while writing | none |
| `plan-workflow` / implementer prompt | paths to rule sets | none | none |
| task reviewer prompt | final checklist | one line, no checklist | none |
| `code-review` Standards | rule sets + checklist | one bullet; "escalate" with no mechanism | only Blast radius (load amplification) |
| `systematic-debugging` | via `executing-plans` | redaction step | regressions only |
| Evidence that any of it works | none (roadmap 3) | none | none |

Coding principles are wired end to end. Security is checked only after the
code exists, and only by a one-line item. Performance has no hook point. No
criterion has an eval that grades the code an agent produced.

### The four thinking models: where each changes a decision

The 0.6.0 rule stays: a model sits at the step where it changes a decision,
not in every skill. Real gaps (where its absence lets a wrong decision
through):

| Skill | Gap | Fix |
|---|---|---|
| `executing-plans` quick path | Systems: a change to a public signature, behavior, or persisted data starts RED without listing callers and consumers; only plans and reviews look at blast radius | One step: list callers, consumers, and data the change reaches before RED |
| `systematic-debugging` | Pareto: hypotheses are ranked by likelihood only | Test first the hypothesis with the best likelihood for the cost of checking it |
| `security-and-hardening` | Pareto: no order among controls or findings | Rank by exposure x impact; fix reachable, high-impact first |
| `skill-creator` | Inversion: no near-miss prompts in its own workflow (only in `AGENTS.md`); no prompt to name which models a new skill applies | Step 6 writes near-miss prompts; checklist line for the models |
| `performance-optimization` (new) | All four by design | Measure before assuming (first principles); what load breaks it (inversion); queues, retries, caches (systems); biggest bottleneck first (Pareto) |
| Repo | No single map of model -> step | A skill x model matrix in `docs/architecture.md`, kept current by the `skill-creator` checklist (no lexical validator: keyword checks would be noise) |

### Legion's own code

| # | Criterion | File | Finding | Severity |
|---|---|---|---|---|
| 1 | Security | `.github/workflows/ci.yml` | No `permissions:` block, so the token gets the repo default; actions pinned by tag (`@v6`), not by SHA | Important |
| 2 | Correctness | `hooks/session-start:35` | `escape_for_json` escapes only `\ " \n \r \t`; any other control character makes the output invalid JSON (reproduced with `\x07` and `\x0c`) | Minor: input is Legion's own file |
| 3 | Coding principles | `scripts/validate.mjs:86` | Link check accepts `../` links out of the skill root, which the spec's one-level, no-cross-skill rule forbids | Minor |
| 4 | Coding principles | `validate.mjs`, `trigger-evals.mjs` | `ROUTER` defined twice; `trigger-evals` crashes with a `TypeError` on a bad frontmatter when run alone | Minor |
| 5 | Coding principles | `validate.mjs:131` | Executable check hard-codes `hooks/session-start`; the new guard hook would go unchecked | Minor (blocks 2e) |
| 6 | Testing | `ci.yml` | Shellcheck skips the shipped `skills/systematic-debugging/scripts/hitl-loop.sh` (passes locally today) | Minor |
| 7 | Performance | `scripts/` | No issue: ten skills, sub-second checks; `validate-spec` spawning python per skill is fine at this size | FYI |

## Approaches

| Hat | A: audit inside each domain skill | B: separate `system-audit` skill | C: no new skill |
|---|---|---|---|
| White | +1 description; security already owns "is this safe" | +2 descriptions; "audit"/"review" already owned by security and code-review | `code-review` is diff-only; `coding-principles` is 6.9 KB |
| Green | One shared report format, a ~1 KB copy per skill | Combine with A: split only when both domains are audited at once | Add perf skill, keep audit in code-review |
| Yellow | Knowledge and audit together; 1 router row; each skill evaluable alone | One command audits everything; frame written once | Cheapest in tokens; no trigger collision |
| Black | Fails if the two report formats drift -> `validate.mjs` checks them | Fails on trigger collision and near-duplicate evals; costs tokens every session | Fails at triggering: nothing owns "optimize performance"; code-review fires in the wrong mode |
| Red | User: perf and security should work "like coding-principles, called by executing-plans or code-review" | | |

Chosen: A, wired into the chain the way `coding-principles` is, because it is
the only option whose main risk is closed by a cheap check, and it matches the
user's model of the two skills as standards the chain calls.

## Design

### Phase 1: eval foundation
1. Run the 6 existing cases:
   `claude plugin eval . --no-publish --model sonnet --runs 3 --json evals/results/<date>.json`.
   Record model, Claude Code version, cost, and per-case scores in a new
   committed log `docs/evals.md` (my call: raw results stay gitignored).
2. Bar (user decided, Q4): a fires case and a stays-quiet case each pass in at
   least 2 of 3 runs; quality graders score higher with the plugin than without
   (positive ablation delta).
3. A skill that misses the bar gets its description or body fixed and re-run;
   after two failed fixes, propose removing it to the user.
4. From the measured cost, estimate the full suite (Phase 3) and report it
   before running it.

### Phase 2: performance and security
**2a. `skills/performance-optimization/`** (new; user decided, Q6)
- `SKILL.md`, stack-agnostic: set a budget -> measure a baseline with its
  source -> profile -> name the bottleneck -> fix test-first through
  `legion:executing-plans` -> re-measure -> report with sources.
- Metric-honesty rule: no "faster" without a measured number; every number
  names its source; unmeasured findings are "potential impact".
- `references/patterns.md`: N+1, algorithmic complexity, I/O in loops,
  caching, concurrency, memory. `references/web.md`: Core Web Vitals, bundle,
  render; read only for frontend work. `references/performance-checklist.md`:
  what reviewers check (my call: mirrors `security-checklist.md`).
  `references/audit.md`: the system audit mode.
- Boundary with `systematic-debugging`: "it got slower" is a regression and
  stays there; optimizing toward a measured goal is this skill.
- Adapted from addy `performance-optimization` and `web-performance-auditor`,
  condensed (the source `SKILL.md` is 16.8 KB).

**2b. `skills/security-and-hardening/`**
- New `references/audit.md`: scope -> secret scan by pattern, never echoing
  matched values -> dependency audit with the ecosystem's own tool -> STRIDE +
  OWASP (including OWASP LLM Top 10) -> four attacker personas (auth attacker,
  supply chain, insider, infrastructure; from claudekit `ck:security`) ->
  verify each finding against the code and the baseline (addy #736) -> report.
- Upstream sync (my call on scope): take each addy commit since the original
  condensation that fixes something Legion lets through. Candidates:
  `d1463fd` (rules the condensed text dropped), `ab15a85` (404 before the
  ownership check), `30187c1` (secret scan must not echo credentials),
  `78f00a4` (session cookies in the description). Already covered:
  `45fd4a0`, `020ec10`.

**2c. Shared audit report format** (my call)
Both `audit.md` files end with the same skeleton: Scope, Method, Findings
(severity, `file:line`, evidence, measured or potential impact), Not checked.
`scripts/validate.mjs` fails if the two skeletons' headings differ.

**2d. Chain wiring** (user decided, Q1-Q3; mirrors `coding-principles`)
- `writing-plans/SKILL.md` and `assets/plan-template.md`: two new lines,
  `**Security:** none | <trust boundaries touched>` and
  `**Performance:** none | <budget or hot path>`.
- `executing-plans/SKILL.md` quick path: check the trigger list and load the
  skill with the Skill tool. Security: untrusted input, auth, secrets,
  personal data, LLM output. Performance: query or network call in a loop, hot
  path, large data, rendering, a stated budget. An XS change skips performance,
  never security when it touches a trust boundary.
- `executing-plans/references/plan-workflow.md` step 4: load per the plan's
  lines. `implementer-prompt.md` and `task-reviewer-prompt.md`: absolute paths
  to the matching checklist(s).
- `code-review`: the Standards checklist gains a Performance item; when a diff
  touches a trigger, the Standards reviewer gets that skill's checklist path.
  A target that is a whole system or directory (no diff) dispatches two fresh
  `general-purpose` subagents in parallel, each reading its skill's
  `audit.md`; the controller merges the two reports. Models (my call, per the
  0.8.0 table): `opus` for security, `sonnet` for performance.
- `brainstorming/assets/design-doc-template.md`: a `Non-functional` section
  with `Security` (trust boundaries, assets) and `Performance` (budget, hot
  paths), so `writing-plans` fills its two lines from the spec, not from
  guesses (from the repo review).
- `executing-plans` quick path: security loads before the first test when a
  trigger matches, not only as a review afterwards (from the repo review).
- Both skills keep their own descriptions and stay model-invocable (Q2).
- `using-legion` map: a performance row; the debugging row keeps "performance
  regression".

**2e. Guard hook** (user decided, Q5)
- `hooks/guard`, bash builtins, registered for `PreToolUse` on
  `Read|Edit|Write|Grep|Glob|Bash`.
- Secret files (`.env`, `.env.*` except `.example`/`.sample`, `*.pem`,
  `*.key`, `id_rsa*`): `permissionDecision: "ask"`, so Claude Code prompts the
  user. To verify against the hooks docs while planning; fallback is `deny`
  with a reason that tells the agent to ask.
- Broad scans of `node_modules`, `dist`, `build` (Grep/Glob paths, Bash
  `grep -r`/`rg`/`find` over them): `deny` with a reason. Reading one named
  file inside them stays allowed (my call).
- `LEGION_GUARD=off` disables it. Unparseable input allows (fail-open, my
  call: a guard bug must not stop work).

**2f. Thinking-model gaps** (from the repo review): the four fixes in the
models table, plus the skill x model matrix in `docs/architecture.md`.

**2g. Legion's own code** (from the repo review): findings 1-6. CI gets
`permissions: contents: read` and SHA-pinned actions; the hook escapes every
control character (test added first); the validator rejects links that leave
the skill root and checks every file in `hooks/` that `hooks.json` runs;
`ROUTER` moves to `scripts/lib/skills.mjs`; shellcheck covers every shipped
`.sh`.

### Phase 3: evals for every skill
- Cases for `performance-optimization`, the security audit, and the 2d wiring
  land with Phase 2, so the new parts are measured from day one (my call);
  Phase 3 covers the rest.
- For each skill: one fires case, one stays-quiet case, a pressure case where
  the skill holds a discipline, and a quality grader that the no-plugin arm
  should fail. Graders judge the code the agent produced, not only whether a
  skill fired: one case per criterion (a rule set's checklist answered; a
  query built from input is parameterized; a loop of queries becomes one).
  Cover the new wiring too: executing-plans loads security on an
  auth change; code-review flags an N+1 in a diff; a system audit request runs
  both audits; perf claims carry a source.
- `evals/triggers/performance-optimization.json`: 3+ positives, 2+ near-miss
  negatives (including "it got slower since yesterday" -> debugging).

### Release
Version 0.11.0 across `package.json`, `plugin.json`, `marketplace.json`;
README skill table; `docs/architecture.md` section; roadmap items 1 and 8
closed, 7 partly; `THIRD_PARTY.md` provenance for addy and claudekit.

## Commands
```bash
npm test
npm run validate
npm run validate:spec
npm run evals:triggers
bash tests/hooks/test-guard.sh
claude plugin validate . --strict
claude plugin eval . --no-publish --model sonnet --runs 3 --json evals/results/<date>.json
```

## Testing strategy
- `tests/hooks/test-guard.sh` (shell, free): feeds tool-call JSON to the hook
  and checks the decision for each rule below in Success criteria.
- `scripts/validate.mjs` (free): the audit-skeleton check; router and README
  cover the new skill.
- Trigger evals (free): vocabulary routing and no near-duplicates.
- Behavioral evals (paid): whether skills fire, stay quiet, and change the
  result against the no-plugin arm. This is the only level that proves effect.

## Boundaries
- Always: record model, Claude Code version, and cost for every eval run;
  label unmeasured performance findings "potential impact".
- Ask first: removing a skill after two failed fixes; running the full suite
  beyond the Phase 1 estimate.
- Never: loosen a grader or threshold to make a case pass; print a matched
  secret in an audit report or hook message.

## Success criteria
- `npm test` and `claude plugin validate . --strict` pass.
- Every skill has at least one fires and one stays-quiet case; each passes in
  at least 2 of 3 runs on `sonnet`; every quality grader shows a positive
  ablation delta; results logged in `docs/evals.md`.
- Guard tests: `.env` read -> ask; `.env.example` read -> allow; Grep in
  `node_modules` -> deny; one named file in `node_modules` -> allow;
  `LEGION_GUARD=off` -> allow; malformed JSON -> allow.
- Trigger evals: no regression from 56/58 rank-1, no near-duplicates.
- Every cell of the chain table above names a hook point (or "n/a" with a
  reason); for each criterion, at least one generated-code grader passes with
  the plugin and shows a positive ablation delta.
- Repo findings 1-6 closed, each fix with its test or check; the hook emits
  valid JSON for every control character.
- `docs/architecture.md` has the skill x model matrix; the four model gaps
  are closed.
- An XS change touching no trigger loads the same bytes as today (`wc -c`).
- `performance-optimization/SKILL.md` well under 20 KB (target 8 KB).

## Open questions
None blocking planning. The `"ask"` decision value is verified during
planning, with `deny` as the fallback.

## Amendments during execution
- claudekit-engineer is proprietary (its LICENSE: "All Rights Reserved",
  copying and modification prohibited). Nothing from it is used: the audit
  personas and the guard hook were written from general security knowledge
  and Claude Code's hook contract, and `THIRD_PARTY.md` lists no claudekit
  material. Design 2b and 2e named it as a source; that no longer holds.
- Pressure cases (maintainer's decision): a first request to skip a safety
  step ("skip the validation", "just add a retry") keeps the cheap control
  with a one-line reason; it is dropped only if the user insists. Added to
  the router's precedence rule and to the security and debugging gotchas.
- Byte budget: `executing-plans/SKILL.md` grew 1,374 bytes over 0.10.0
  (within the accepted 1,600), including two eval-driven fixes for sessions
  that cannot run code and one making `coding-principles` load for any new
  function or module.
