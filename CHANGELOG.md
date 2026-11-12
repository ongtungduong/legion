# Changelog

## 0.12.5 - 2026-11-12

Fixed

- `code-review`: the finder/verifier model split yields to the user's own
  instruction; only a calling skill or plan asking for another model is
  ignored. Before, "a caller's request" read as overriding the router's
  "user instructions win".
- `executing-plans`: "Rulings, not stalls" no longer swallows the ask-first
  boundaries of `security-principles`. A new dependency, auth flow, or
  personal-data category that the spec or plan does not name waits for the
  user.

Changed

- `skill-creator`: `references/measuring.md` gains "When the model changes".
  An instruction that compensates for model behavior is re-measured on each
  new default model and becomes a cut candidate once the baseline passes; a
  project fact or a safety control stays even with no delta. Step 7 points
  to it.

## 0.12.4 - 2026-11-12

Changed

- `security-principles` full-audit mode links each phase file
  (`reconnaissance`, `attack-classes`, `hunting`, `validation-and-reporting`)
  straight from `SKILL.md` and says to read it in full when its phase starts.
  Before, they were reachable only through `references/audit.md`, a nested
  chain that the agentskills spec and Anthropic's best practices warn invites
  partial reads. The skill stays one skill; see `docs/architecture.md`.

## 0.12.3 - 2026-11-12

Changed

- Thinking-model labels ("(Pareto)", "(inversion)", "(systems thinking)",
  "(first principles)") are removed from step titles and rules in
  `brainstorming`, `writing-plans`, `code-review`, `coding-principles`, and
  `security-principles`; every step keeps its instruction. The Six Thinking
  Hats table drops its Model column, and the `brainstorming` description
  drops the list of models (the "think it through from first principles"
  trigger stays). "Pareto cut" is now "scope cut". `docs/architecture.md`
  keeps the matrix for humans.
- `docs/architecture.md` no longer claims the `skill-creator` checklist keeps
  the thinking-model matrix up to date; that checklist line was removed.

## 0.12.2 - 2026-11-12

Changed

- `using-legion` splits the `coding-principles` map row into design and
  performance rows, routes a performance-only audit to `coding-principles`
  (an unnamed or combined audit stays with `code-review`, a security-only one
  with `security-principles`), and shows `systematic-debugging` in the default
  flow as the branch for an unexpected failure and the entry for a bug report.
- `coding-principles` names a performance-only audit in its description, with
  a matching trigger case and a near-miss negative for the combined audit.

## 0.12.1 - 2026-11-11

Changed

- `brainstorming` replaces the "Thinking system" table with four short rules;
  the models stay in the description and in `references/grilling.md`.
- `coding-principles` points to the `security-principles` description for the
  trust-boundary triggers instead of repeating the list, and
  `security-principles` no longer points back at `coding-principles`.
- `executing-plans` lets a slow suite take a slice baseline and run the full
  suite once at the end; `plan-workflow.md` drops two version-specific notes
  (the `fable` tier, Claude Code 2.1.203).
- `skill-creator` gives the validator's path from the skill root and drops a
  checklist line that only applied to Legion's own repo.
- `docs/evals.md` closes B1 as not measured; the quick path is unchanged.

## 0.12.0 - 2026-11-10

Breaking: `security-and-hardening` is now `security-principles`,
`performance-optimization` and `defining-terms` are removed, and
`coding-principles` is rebuilt by topic.

Added

- `scripts/validate.mjs` fails when `skills/`, `hooks/`, or `.claude-plugin/`
  changed since the latest `v*` tag but the version did not go up. It skips
  with a note when git or the tags are unavailable.

Changed

- `executing-plans` takes a baseline before the first change (quick path and
  plan setup), so inherited failures are told apart from caused ones. Plan
  setup commits the plan and spec and ledgers a `Plan base`, which the final
  review uses instead of `git merge-base main HEAD`. The evidence gate also
  scans untracked files. The dead `working-effectively-with-legacy-code`
  pointer now names the `coding-existing-code` reference, and the path table
  says when a bug's cause counts as known.
- `systematic-debugging` gains an output format and a report step, loads the
  matching principle before the fix instead of after it, and moves
  `git bisect run` from the list of loops to the hypothesis step.
- `writing-plans` defines Review focus as inputs the spec implies but never
  states, and its self-review checks that every path and command in the plan
  exists in the repo.
- Trigger evals: near-miss negatives added for `systematic-debugging` and
  `writing-plans`.
- `brainstorming` compares approaches plainly by default; the Six Thinking
  Hats is an opt-in reference. A 10-run A/B favored the plain comparison on
  three graders at about 6 percent lower cost. The description now also covers
  "what are my options" prompts, and grilling records glossary terms.
- `using-legion` routes whole-repo security and performance audits to
  `code-review` and security-only audits to `security-principles`.
- `skill-creator` aligns with Legion conventions and measures a baseline
  before writing.
- Dropped two performance pointers (the `executing-plans` quick path and one
  review-checklist item) that an ablation found inert.
- Evals: A/B harness for brainstorming, cost-on-one-line-fix case, harder
  siblings for zero-delta cases, and haiku trigger rates in `docs/evals.md`.

- `code-review` adopts the method of Claude Code's `/code-review`, with
  pieces of awesome-skills `code-review-skill`. The target can be a range,
  the working tree, a PR number, a pasted diff, or a path. Three depths
  (quick, standard, deep) set the reviewers and the model; deep splits the
  Standards axis into Correctness, Principles, and (across a trust boundary)
  Security reviewers. Every finding carries a failure scenario or a quoted
  rule, and a fresh verifier tries to refute each Critical and Important one
  (`CONFIRMED`, `PLAUSIBLE`, or dropped) before the report. The checklist
  gains three correctness passes (line scan, removed behavior, callers),
  Reuse, Altitude, and Leftovers. A breach of a loaded `coding-principles`
  rule or a security or performance checklist item, quoted, is a finding
  like a documented repo standard; security findings need a boundary and a
  result, as `security-principles` requires. The report adds a depth line
  and a verdict; fixing and posting to a PR happen only on request.
- `security-principles` is rebuilt on Cloudflare's `security-audit` skill.
  Three modes: build (STRIDE, boundaries, checklist, as before), guidance
  (focused reviews with Cloudflare's attack classes and ten domain
  companions), and full audit (six phases: reconnaissance, coverage-led
  hunting, independent candidate validation, `findings.json` checked by
  bundled validators, fresh record verification, reports). Findings need a
  crossed boundary and a concrete result; verdicts are `confirmed`,
  `needs_validation` (no severity), or `rejected`; severity is
  critical/high/medium/low/informational. `code-review` runs the security
  half of a system audit in the main session, since the audit dispatches its
  own subagents.
- Renamed `security-and-hardening` to `security-principles`. Load it as
  `legion:security-principles`.
- `coding-principles` is rebuilt around topics instead of books. Three
  references synthesized from the 14 agent-rules-books rule sets replace
  the per-book files: `system-design` (boundaries, domain model, data and
  consistency, integration and failure), `coding` (with
  `coding-existing-code` for refactoring and untested code), and
  `performance` (with `performance-optimization`, `performance-web`, and
  the system `audit`). The workflow answers the design questions before
  the first test and calls `security-principles` at the design step when a
  change crosses a trust boundary. The "one primary set, at most one
  companion" rule and the conflicts list are gone: the references settle
  the conflicts. A plan's `Design principles` line now names references
  ("coding + system-design"), not books.
- `writing-plans` without an approved spec or design doc now calls
  `brainstorming` first.
- `systematic-debugging` loads `security-principles` or
  `coding-principles` at the fix step, by cause.
- `brainstorming` is built on two methods, the Six Thinking Hats (choose the
  approach) and grilling (settle the open decisions), with a Thinking system
  table placing first principles, inversion, systems thinking, and Pareto in
  each. First principles is now the White-hat procedure and the Green-hat
  rebuild, not a step of its own; `references/first-principles.md` is merged
  into `references/six-thinking-hats.md`. Grilling builds its tree only from
  goals and constraints, adds the branches each decision sets off, asks the
  highest-leverage decisions first and defaults the rest, gives every
  recommendation a "Wrong if" line, and inverts the settled tree before the
  playback.

Removed

- `performance-optimization` skill (briefly `performance-principles`). Its
  workflow, patterns, checklist, web reference, and system audit moved into
  `coding-principles/references/`; `legion:performance-optimization` no
  longer loads. `executing-plans`, `code-review`, `writing-plans`, and
  `systematic-debugging` point at the new paths.
- `defining-terms` skill. The router no longer routes terminology work;
  `GLOSSARY.md` is still read by `brainstorming`, `executing-plans`, and
  `code-review` when it exists.

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
