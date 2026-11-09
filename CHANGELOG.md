# Changelog

## 0.11.0 - 2026-11-09

Performance and security in every code change, a guard hook, and measured
skills. Design: `.legion/specs/2026-11-09-perf-security-evals-design.md`.

New

- `performance-optimization` skill: budget, baseline with its source,
  profile to the dominant cost, fix test-first, re-measure, guard. No speed
  claim without a number and its source. `references/` holds patterns, a
  checklist, a web front-end reference, and a system audit.
- `security-and-hardening` gains a system audit (`references/audit.md`):
  secret scan that prints file names only, dependency audit, STRIDE and
  OWASP, four attacker personas, findings verified against the code and
  ranked by exposure x impact. From addy upstream: registry signatures, a
  staged-secret scan that never echoes values, session cookies.
- `code-review` audits a whole repo or system: security (opus) and
  performance (sonnet) auditors in parallel, one shared report format. The
  Standards checklist gains a Performance item.
- `hooks/guard` (PreToolUse): asks before secret files, denies whole-folder
  scans of `node_modules`, `dist`, `build`. Bash builtins only, fails open,
  `LEGION_GUARD=off` disables it.
- Behavioral evals for every skill (30 cases) and `docs/evals.md`, the log
  of every run with model, Claude Code version, and cost.

Changed

- The chain loads security and performance the way it loads
  `coding-principles`: a `Non-functional` section in the design doc,
  `Security` and `Performance` lines in the plan, both loaded before the
  first test on the quick path (security whatever the size), checklist paths
  for implementers and reviewers.
- A first request to skip a safety step keeps the cheap control and says
  why; it is dropped only if the user insists (maintainer's decision).
- Eval-driven fixes: the router sends "what broke?" to
  `systematic-debugging`; `executing-plans` and `systematic-debugging` keep
  the test-first order and the report block when code cannot run;
  `coding-principles` loads for any new function or module.
- Thinking models: the quick path lists a change's reach (callers,
  consumers, data); debugging ranks hypotheses by likelihood for the cost of
  checking; `skill-creator` inverts the trigger with near-miss prompts. A
  skill x model matrix is in `docs/architecture.md`.
- Specs and plans move from `docs/legion/` to `.legion/specs/` and `.legion/plans/`.
  They stay committed; the rest of `.legion/` (ledger, briefs, scratch) is
  gitignored through `.legion/*` with `!.legion/specs/` and `!.legion/plans/`.

Repo

- CI: read-only token, actions pinned to commit SHAs, shellcheck on every
  shell script; `validate.mjs` enforces the first two.
- `validate.mjs`: `ROUTER` has one owner; links may not leave a skill's
  root; every hook `hooks.json` runs must exist and be executable; audit
  report skeletons must match. `tests/scripts/` tests each rule.
- `hooks/session-start` escapes every control character.
- GitHub: Dependabot for the pinned actions, a release workflow that checks
  the tag against `package.json` and `CHANGELOG.md`, CI concurrency and
  timeout, `SECURITY.md`, `CONTRIBUTING.md`, `CODEOWNERS`, issue and PR
  templates.

## 0.10.0 - 2026-11-09

Token cost cuts; no change to the workflow's steps.

- `executing-plans`: the plan workflow, inline/subagent choice, model table,
  and worktree gotchas moved to `references/plan-workflow.md`, read only when
  a written plan exists. `SKILL.md` drops from 17.1 KB to about 8 KB.
- Quick path: an XS change inside existing code (a condition, a value, one
  call) follows the surrounding code's conventions instead of loading
  `coding-principles`; anything that adds or reshapes a function, class,
  module, or interface still loads it.
- `using-legion` is `disable-model-invocation: true`: the hook already
  injects it, so its description no longer sits in the skill listing or
  invites a second load. The hook strips its frontmatter, and the router map
  is shorter (descriptions carry the trigger detail).
- Shorter descriptions for `brainstorming`, `coding-principles`, and
  `executing-plans`; lexical trigger evals unchanged at 56/58 rank-1.
- `code-review` passes the checklist's path to the Standards reviewer instead
  of reading and pasting it; the task reviewer's report is capped at 400
  words like the other reviewers'.
- Fixed a truncated sentence in the brainstorming builder check.

Strengths taken from addyosmani/agent-skills, folded into existing skills; no
new skill, router row, or description change.

- `executing-plans` evidence gate gains step 4, "check the bar held": new
  suppressions, skipped or loosened tests, stubs, and lowered thresholds are
  undone or reported under `Weakened:` (from addy
  `constraint-driven-development`). The implementer prompt, the task reviewer,
  the plan's completion contract, and the code-review Standards checklist
  check the same list.
- `executing-plans`: an API the repo does not already use the same way is
  checked against the official docs for the installed version and cited
  under `Sources:` (from addy `source-driven-development`).
- `executing-plans/references/doubt-review.md`: a bounded, fresh adversarial
  review of one decision before an irreversible step or an untestable claim,
  with an opt-in second model (from addy `doubt-driven-development`).
- Behavioral evals: six cases under `evals/plugin/` for `claude plugin eval`
  (fires / stays-quiet pairs, a pressure case, the light router). Not run
  yet, so no numbers.
- CI: GitHub Actions runs `npm test` and shellcheck.

Strengths taken from mattpocock/skills, folded into existing skills; no new
skill, router row, or description change.

- `executing-plans/assets/pr-body.md`: PR body with a summary visual,
  before/after evidence, spec criteria, merge danger (one-way or two-way
  door, blast radius), and the run's rulings.
- `systematic-debugging`: a human-in-the-loop loop as the last resort before
  stopping, with `scripts/hitl-loop.sh`, which the user runs through the `!`
  prefix.

## 0.9.0 - 2026-11-09

- Renamed `domain-modeling` to `defining-terms`: the old name read as
  entity/aggregate design, which belongs to `coding-principles`. Call it with
  `legion:defining-terms`.
- ADRs moved to `brainstorming`, where trade-off decisions are made:
  `references/adr-format.md`, a direct entry for "record an ADR for X", and
  the three-test offer (hard to reverse, surprising, real trade-off) when the
  design doc is written. `defining-terms` now covers `GLOSSARY.md` only.

## 0.8.0 - 2026-11-09

- Subagent dispatch is now concrete in every skill that dispatches one:
  `subagent_type: "general-purpose"` (never `fork`) and an explicit `model`
  alias. `executing-plans` maps roles to `haiku` / `sonnet` / `opus`, and
  escalates a `haiku` implementer that blocks or fails review twice.
  `code-review`, the brainstorming builder check, and grilling lookups now
  name their model.
- Every implementer subagent runs in its own worktree
  (`isolation: "worktree"`). It checks the isolation first, resets to `BASE`
  (native worktrees branch from the default branch), and installs
  dependencies. The controller pins the head as `legion/<plan>/task-N`,
  confirms its own tree is untouched, reviews `BASE..pin`, then
  fast-forwards and removes the worktree. A failed isolation check sends the
  run inline. Reviewers and lookups stay read-only, with no worktree.
- Mode choice: an XS task stays inline unless context is about half used,
  and every subagent task is inline when the Agent tool has no worktree
  isolation. Implementers still run one at a time.
- Fixed file names `task-N-diff.txt` and `task-N-report.md`, and a
  `Dispatch:` ledger line, so a run can resume a review after compaction.

## 0.7.0 - 2026-11-09

- Merged `test-driven-development` and `verification-before-completion` into
  `executing-plans`, now the single skill for any code change (10 skills).
  It states four rules (spec first, test first, principles, evidence), adds
  a quick path for work without a plan, and carries the TDD cycle and the
  evidence gate; test-quality examples moved to
  `references/test-quality.md`.
- `executing-plans` chooses inline or subagent work per task itself (plan
  length, task size, coupling, context left) and adds a fresh task reviewer
  for risky tasks; `writing-plans` no longer asks the user to pick a mode.
- Router: one row for all coding; a gotcha keeps the evidence rule for
  non-code completion claims. `systematic-debugging`,
  `security-and-hardening`, and `coding-principles` now point at
  `legion:executing-plans`.

## 0.6.0 - 2026-11-09

- Thinking models placed where they change a decision, with no new skill:
  - `writing-plans`: Pareto slice order after the tracer bullet (`Slice order`
    line; the low-value tail is proposed for later, never dropped silently)
    and a pre-mortem step (inversion): three likely failure reasons, each
    with a countermeasure. Plan template gains both.
  - `brainstorming`: a Pareto cut proposed while sizing the work; the Black
    hat inverts each approach and, for projects, traces second-order effects
    over a White-hat system map.
  - `code-review`: a blast-radius checklist item (callers, contracts, data,
    runtime loops) and Minor findings folded once past five.
  - `systematic-debugging`: a gotcha for symptoms caused by loops in the
    system.

## 0.5.0 - 2026-11-09

- Merged `grilling` into `brainstorming` and removed the `grilling` skill. The
  procedure moved to `skills/brainstorming/references/grilling.md`;
  brainstorming gains a grill-only entry (step 1) for stress-testing an
  existing plan, decision, or idea without a design doc, and its description
  and router row now carry the "grill me" / "poke holes" triggers.

## 0.4.0 - 2026-11-09

- `brainstorming` gains three thinking steps, scaled by work size:
  a first-principles pass (goal, facts, hard constraints, questioned
  assumptions, rebuilt approach) before approaches; a Six Thinking Hats
  evaluation of the approaches (de Bono's "choosing between alternatives"
  sequence); and a mandatory `legion:grilling` pass on the chosen design.
  Procedures live in `references/first-principles.md` and
  `references/six-thinking-hats.md`; the design-doc template records both.
- Router row and description for `brainstorming` now cover the case where the
  user already explained what and why and only asks for approaches; a smoke
  test showed the old "intent not fully settled" wording made the model skip
  the skill there.

## 0.3.0 - 2026-11-09

- New `coding-principles` skill: picks one primary rule set (plus at most one
  companion) from 14 classic-book distillations by agent-rules-books, following
  its compatibility matrix; the `mini` files ship unchanged in `references/`.
- Spec-driven: TDD starts by pinning acceptance criteria and traces every test
  to one; plan tasks name the spec requirement they implement.
- Best practice wired through the pipeline: plans record `Design principles`;
  executor, implementer, and both reviewers load and check the same sets; TDD
  refactors by them and starts legacy changes with characterization tests.
- `trigger-evals --verbose` lists positive prompts that missed rank 1.
- From real-execution smoke tests: `coding-principles` description now names the
  verbs users say (refactor, clean up, make readable) after a refactor prompt
  triggered no skill; gotchas added for skill-relative `references/` paths and
  for keeping characterization tests in the suite.

## 0.2.0 - 2026-11-09

- Replaced `writing-skills` with `skill-creator` (from duongot-skills; `name`
  renamed to match its directory, which the original failed).
- Rewrote every other skill with `skill-creator` to the agentskills.io standard:
  what-then-when descriptions, Workflow / Gotchas / Output format bodies, long
  templates moved to `assets/`, when-to-read for every reference, reasons instead
  of ALL-CAPS rules; `license` and `metadata.author` frontmatter.
- `npm run validate:spec` runs skill-creator's validator on every skill (needs python3).
- Repo validator accepts all spec fields and enforces what-then-when descriptions.

## 0.1.0 - 2026-11-09

First skeleton.

- Claude Code plugin manifest and local marketplace (`legion-dev`).
- SessionStart hook that injects the light `using-legion` router.
- Twelve skills: using-legion, brainstorming, grilling, domain-modeling,
  writing-plans, executing-plans, test-driven-development, systematic-debugging,
  verification-before-completion, code-review, security-and-hardening,
  writing-skills.
- Zero-dependency checks: structural validator, lexical trigger evals, hook test.
