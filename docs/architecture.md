# Legion architecture

The deliberate decisions behind the current design, with their reasons, so nobody
"fixes" them by accident. History is in `CHANGELOG.md` and git.

## Foundations

1. **superpowers' chain** (SessionStart router, then brainstorm, plan, execute,
   review, verify, with hard gates) is kept; it is the strongest part of it.
2. **A light router, not enforcement.** superpowers checks for skills before every
   response, which costs tokens and slows small tasks. Legion loads a skill only
   when the task matches; a loaded discipline skill is never softened.
3. **User instructions win** over every skill, except that a first request to skip
   a safety step keeps the cheap control with a one-line reason, and drops it only
   if the user insists (two pressure evals failed without this).
4. **No dependencies.** The hooks use bash builtins, scripts use stock Node; only
   `validate:spec` needs `python3` (the skill-creator validator).
5. **agentskills.io for every skill:** a description of what and when, a
   Workflow / Gotchas body, long templates in `assets/`, rules with their reason,
   `SKILL.md` under 20,000 bytes, no development material under `skills/`.

## Provenance

| Source | Taken | Where |
|---|---|---|
| superpowers | Hook and router; hard gate before coding; plans with Interfaces / Review focus; ledger that survives compaction; rulings instead of stalls; TDD and verification iron laws; receiving review | `hooks/`, `brainstorming`, `writing-plans`, `executing-plans`, `code-review/references/receiving-review.md` |
| mattpocock | Grilling in rounds; `GLOSSARY.md` and ADRs; seams and test anti-patterns; debugging from a feedback loop and the human-in-the-loop script; parallel two-axis review; PR body | `brainstorming`, `executing-plans`, `systematic-debugging`, `code-review` |
| addyosmani | Spec structure; vertical slices and sizes; severity labels; STRIDE and security checklist; trigger evals; guard-the-bar, version-sensitive API check, doubt review | `brainstorming`, `writing-plans`, `executing-plans`, `code-review`, `principles`, `scripts/trigger-evals.mjs` |
| agent-rules-books | The 14 book rule sets, synthesized by topic with conflicts settled once | `principles` references |
| Cloudflare `security-audit` | Principles, verdicts, severity, audit workflow, attack classes, validators | `code-review` |
| Claude Code `/code-review` | Review by angle, failure scenario per finding, separate verifier, depth levels | `code-review` |
| awesome-skills `code-review-skill` | Reuse check, cross-language anti-patterns, verdict line | `code-review/references/review-checklists.md` |
| duongot-skills | `skill-creator` and its validator | `skills/skill-creator`, `scripts/validate-spec.mjs` |

Dropped on purpose: multi-harness support and the Windows hook wrapper (cost of
maintaining manifests; `skills/` stays portable); superpowers' workspace scripts
(replaced by git commands in the skill); the visual brainstorm companion; the
issue-tracker skills; addy's other domain skills (added when needed). Nothing is
taken from claudekit-engineer: its license is proprietary.

## Design decisions

| Decision | Reason |
|---|---|
| **One skill for all code work**, `executing-plans`, with a quick path (no plan) and a plan workflow (`references/plan-workflow.md`) | Spec-first and test-first must hold even for a pasted function; chaining three skills left a step to skip. The plan workflow lives in a reference because a quick-path run should not pay for ~10 KB it never uses |
| The agent chooses inline or subagent per task; risky tasks (auth, data, money, concurrency) always get a fresh reviewer; XS tasks run inline | Restarting a worktree costs more than an XS task |
| **Subagents** start fresh (`general-purpose`, never `fork`, which copies the parent conversation and loses the independent view) with an explicit model: `haiku` for lookups, `sonnet` for implementers, finders, and hunters, `opus` only for verifiers, doubt review, and risky-task review | Without a model the subagent inherits the main session's, usually the dearest |
| Implementers run one at a time in their own worktree, reset to `BASE` first; the controller pins the head as `legion/<plan>/task-N`, reviews `BASE..pin`, and fast-forwards | Native worktrees branch from the default branch, and the harness cleans up worktrees; a failed isolation check switches the run to inline |
| `brainstorming` owns glossary and ADRs; no separate skill | A skill adds an always-on description and a router row for a rare task |
| `principles` holds four references (`system-design`, `coding`, `performance`, `security`) plus situational files (`coding-existing-code`, `performance-optimization`, `performance-web`), each loaded on a stated condition | Picking a topic beats picking a book, a synthesis settles conflicting book rules once, and a rule list nobody needed dilutes the ones that matter |
| Precedence: `security`, then documented repo conventions, then the other references, then the smell baseline | Security rules must not lose to a structural preference |
| Design questions are answered before the first test, then the design is broken once | Owner, dependency direction, source of truth, failure behavior, and load are cheap to change before code exists |
| Security loads on any trust-boundary change, whatever its size; performance skips XS; the quick path loads `security` but not `performance` | A one-line change can open a hole, and rarely moves a hot path; an ablation showed the quick-path `performance` bullet had no effect |
| Code you write or change meets every loaded reference; untouched code is reported as FYI | Standards never widen a task |
| **`code-review` owns every check**: diff review, "is this safe?", the security audit and its validators, the performance audit, the system-design audit | One standard (`principles`), one place that checks against it. The attack material is read only when checking code |
| A whole-repo target runs a three-axis audit (system design, performance, security) after one scope-and-budget proposal; approval in the request counts; it runs in the main session because a subagent cannot start subagents | No logic or style axis: with no spec there is no oracle and it is the dearest. A design finding needs a quoted rule and a concrete failure |
| No speed claim without a number and its source; otherwise "potential impact" | A model reading source cannot see runtime cost |
| `using-legion` is `disable-model-invocation: true` and the hook strips its frontmatter | The hook already injects it; a listed description invited a second copy |
| `hooks/guard` asks before secret files and denies broad scans of generated folders; bash builtins only, fails open | A convenience; Claude Code's permission rules stay the boundary |
| Behavioral evals are the bar: a case passes at 2 of 3 runs, quality graders must beat the no-plugin arm, and a grader is never loosened to pass | Lexical evals do not show that a skill fires or helps |
| Six Thinking Hats is a checklist against missed perspectives, not a ritual | The research evidence for the method is thin; B2 in `docs/evals.md` found no clear win either way |

## Thinking models

Each model sits where it changes a decision; there is no separate skill for them.
"n/a" means no decision to change. Update a row by hand when a step moves.

| Skill | First principles | Inversion | Systems thinking | Pareto |
|---|---|---|---|---|
| `brainstorming` | White and Green hats; grilling tree | Black hat; grilling "Wrong if" | System map, second-order effects; grilling branches | Scope cut; Blue and Yellow hats; grilling order |
| `writing-plans` | n/a | Pre-mortem (step 6) | Cross-task references, Interfaces blocks | Slice order (step 3) |
| `executing-plans` | Spec first | RED names the change that fails the test; evidence gate; doubt review | "List the reach" (callers, consumers, data) | REFACTOR the smell that blocks the next change |
| `systematic-debugging` | Facts before hypotheses | Falsifiable predictions | Feedback loops | Likelihood for the cost of checking |
| `code-review` | Spec axis; security needs a boundary and result | Verifier tries to refute; removed-behavior pass; audit critics | Callers pass, blast radius, coverage ledger, system map | Depth table, ranking, hunter priority |
| `principles` | Repo standards are facts; measure before naming the bottleneck; trust boundaries and assets | Break the design once; what load breaks it; STRIDE and abuse cases | Design questions; queues, retries, caches | Effort on the one hard-to-reverse decision; only the references needed |
| `skill-creator` | What the agent lacks; baseline failures are the spec | Near-miss prompts | n/a | Write only what fixes observed failures |

## Artifacts

In a repo using Legion: `.legion/specs/` and `.legion/plans/` are committed;
everything else in `.legion/` (`runs/<plan>/` ledger, briefs, diff packages,
deleted after the user integrates) is gitignored. `docs/adr/` exists only when
there is content. Legion's own repo ignores all of `.legion/`.

## Testing

| Layer | Checks | Runs | Cost |
|---|---|---|---|
| `scripts/validate.mjs` | Frontmatter, size, dev files in `skills/`, links, `legion:` refs, router and README coverage, matching versions and a bump since the latest tag, hook files exist, CI least privilege, matching audit report skeletons | CI, local | 0 |
| `tests/scripts/` | Each `validate.mjs` and `trigger-evals.mjs` rule fails on a copy of the repo with that defect | CI, local | 0 |
| `tests/security-audit/` | The findings and coverage-ledger validators | CI, local | 0 |
| `scripts/trigger-evals.mjs` | Positive prompts rank their skill in the top 3, negatives not first; no near-duplicate descriptions. Vocabulary only: it does not prove a real model triggers | CI, local | 0 |
| `tests/hooks/` | `session-start` emits valid JSON with the router; `guard` decides correctly on 49 inputs and runs with no `PATH` | CI, local | 0 |
| shellcheck | Hooks and `.sh` files | CI | 0 |
| `claude plugin validate --strict` | Manifests and skills | Local | 0 |
| `claude plugin eval` (`evals/plugin/`, 41 cases) | Fires, stays quiet, holds under pressure, changes the code, with and without the plugin | Local, on demand | about $0.04 a run |
