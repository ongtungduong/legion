# Legion architecture

Records the design decisions of each version since 0.1.0 and their reasons, so
nobody later "fixes" the parts that are deliberate.

## Foundations

1. **superpowers' framework.** The plugin has a SessionStart hook that injects a router
   skill, plus a chain of process skills (brainstorm → plan → execute → review → verify)
   with hard gates. This is the strongest part of superpowers, so it is kept.
2. **A light router instead of enforcement.** superpowers makes the agent check for
   skills before *every* response ("1% chance → MUST"), which costs tokens and slows
   small tasks. It also conflicts with the "Trivial: just answer" rule. Legion loads a
   skill only when the task clearly matches. Even so, a loaded discipline skill must not
   have its hard rules softened.
3. **User instructions first.** The user's CLAUDE.md and AGENTS.md win over every
   skill. This is stated at the top of the router.
4. **No external dependencies.** The hook uses only bash builtins, and repo scripts use
   only stock Node (no `node_modules`). Only `validate:spec` needs `python3`, because it
   runs the skill-creator validator (stdlib only).
5. **The agentskills.io standard for every skill.** Since 0.2.0, skills are written and
   checked with `skill-creator`. See the section below.

## What came from where

| Source | Strengths taken | Where in Legion |
|---|---|---|
| superpowers | SessionStart hook; hard gate before coding; plans with Interfaces / Global constraints / Review focus; a ledger that survives compaction; "rulings, not stalls" and the four stop points; the TDD and verification iron laws; receiving review without sycophancy | `hooks/`, `brainstorming`, `writing-plans`, `executing-plans` (including TDD and verification), `code-review/references/receiving-review.md` |
| mattpocock | Interviewing in rounds over a decision tree; `GLOSSARY.md` and ADRs; seams and test anti-patterns; debugging that starts from a feedback loop; two-axis review running in parallel; the user-invoked vs model-invoked distinction; invoking skills with "Call the Skill tool with" | `brainstorming/references/grilling.md`, `brainstorming/references/adr-format.md`, `defining-terms`, `executing-plans` (TDD), `systematic-debugging`, `code-review`, `AGENTS.md` (invocation convention, cross-refs) |
| addyosmani | Spec structure (Commands, Testing, Boundaries Always/Ask/Never, Success criteria); vertical slices and the XS–XL size table; review severity labels; STRIDE threat model and security checklist; deterministic trigger evals; the "even when pasted inline" lesson for descriptions | `brainstorming`, `writing-plans`, `code-review`, `security-and-hardening`, `scripts/trigger-evals.mjs`, `AGENTS.md` |
| agent-rules-books | 14 mini rule sets distilled from classic books; the "one primary set, at most one more" rule; the compatibility matrix (2 ❌ pairs, 11 🔁 pairs) | `coding-principles`, and its hook points in writing-plans, executing-plans, code-review |
| duongot-skills | `skill-creator`: the 6-step workflow, the agentskills.io spec and best practices, template, validator | `skills/skill-creator`, `scripts/validate-spec.mjs` |

## What was deliberately dropped or changed

| In the source | Decision | Reason |
|---|---|---|
| superpowers' multi-harness support (Codex, Cursor, Gemini...) | Dropped; Claude Code only | Maintaining many manifests and tests is costly. `skills/` follows the Agent Skills standard, so other harnesses can be added later without touching the skills. |
| `run-hook.cmd` (Windows polyglot) | Dropped | Only needed on Windows. Recorded in the roadmap. |
| The `sdd-workspace`, `task-brief`, `review-package` scripts | Replaced by git commands and paths written directly in the skill | Less to maintain. In exchange, the agent runs `git diff` into a file itself. |
| A separate `subagent-driven-development` | Merged into a mode of `executing-plans` | The two skills share the ledger and the loop. Merging leaves the router a single choice. |
| `using-git-worktrees`, `finishing-a-development-branch` | Reduced to Setup and Finish steps in `executing-plans` | A separate skill was not needed in the first version. |
| Visual companion and brainstorm server | Dropped | Depends on a JS server; outside the framework's scope. |
| Issue tracker and `setup-matt-pocock-skills` | Not included yet | Needs a user-invoked setup skill. Recorded in the roadmap. |
| addy's 25 skills | Only `security-and-hardening` taken as a skill; three process ideas folded into `executing-plans` (see "Folded in from addy") | Other domain skills (perf, observability, CI/CD...) will be added when there is a real need. |

## The agentskills.io standard (0.2.0)

Every skill was rewritten following the `skill-creator` workflow:

| Rule | How Legion applies it |
|---|---|
| Description states *what*, then *when*, written "pushy" | The first sentence describes what the skill can do, followed by "Use when ...", listing how users phrase it plus the situations where the model thinks it can manage alone ("even when pasted inline"). The validator rejects descriptions that start with "Use". |
| Write only what the agent does not already know | Dropped general-knowledge sections (for example, how to hash passwords in security). Kept concrete gotchas from the sources, such as `HEAD~1` cutting off commits, three-dot diffs, and in-memory rate limiters multiplying with the instance count. |
| Workflow / Gotchas / Output format structure | Every skill has Gotchas. Output format is added only when the output is structured (grilling, code-review, coding-principles). |
| Long templates live in `assets/` | `brainstorming/assets/design-doc-template.md`, `writing-plans/assets/plan-template.md`. |
| Pointers to files must say when to read them | Every link into `references/` states when it needs to be read. |
| No ALL-CAPS; rules come with their reason | Dropped superpowers' capitalized "iron law" blocks in favor of a "**The rule:** ..." sentence with its reason. The rules themselves are unchanged. |

A trade-off to watch: superpowers measured that capitalized iron laws and
rationalization tables help the agent resist talking itself out of steps. Version
0.2.0 keeps the rules but words them more softly. If behavioral evals show TDD or
debugging being skipped more often, this wording needs revisiting.

## Spec-driven, test-driven, best practices (0.3.0)

These three layers link into one chain, so each layer can check the one before it:

| Layer | Where | Mechanism |
|---|---|---|
| Spec-driven | `brainstorming` → `writing-plans` → `executing-plans` (rule 1, the criteria step) | The design doc is the source of truth. Every task states `Acceptance (spec: ...)`. TDD settles acceptance criteria before the first test, and every test must trace back to a criterion. The Spec axis of review catches both what is missing and what is extra. |
| Test-driven | `executing-plans` (rule 2, the TDD cycle) | No code without a failing test first. Legacy code gets characterization tests first. The full suite runs before reporting done. |
| Best practices | `coding-principles` | The plan states `Design principles`. The implementer reads that rule set before coding. REFACTOR follows the set's decision rules. The reviewer checks against its final checklist. Priority: the repo's own standards > the rule set > the smell baseline. |

Why at most two rule sets: agent-rules-books itself observes that a model cannot
follow hundreds of rules at once, and many pairs of books overlap or pull in opposite
directions (Clean Code leans toward small functions, APoSD toward deep modules).
Only the `mini` editions are used (about 1.3–2k tokens each, loaded only when
needed); the `full` editions are not included.

## Multi-perspective brainstorming (0.4.0)

| Technique | Place in the flow | Reason |
|---|---|---|
| First principles | After the playback, before laying out approaches | Forces at least one approach to be rebuilt from goals, facts, and constraints instead of copying a familiar solution. Existing code, data, and contracts count as facts, not assumptions. |
| Six Thinking Hats | When comparing approaches | Uses the Blue → White → Green → Yellow → Black → Red → Blue sequence (per Wikipedia, "choosing between alternatives"). The Red hat reflects only the user's reaction, never the agent's. Research evidence for the method is thin, so it is used as a checklist to avoid missing a perspective, not as a ritual. |
| Grilling | Since 0.5.0 lives in `brainstorming/references/grilling.md`. Runs after an approach is chosen (mandatory for projects), earlier when three or more decisions are open, or through the "grill only" entry in step 1 when the user only wants an existing plan or decision stress-tested (that entry does not require a design doc). | Merged into brainstorming on request: one fewer skill in the always-on part and the router, while the grilling content still lives in one place. The "grill me" and "poke holes" triggers moved into brainstorming's description. |

The depth of all three scales with the size of the work. For a small change, first
principles is a single line, only the Yellow and Black hats are used, and grilling
happens only when needed. That way these techniques do not bloat small tasks.

## Thinking models (0.6.0)

Each model sits at the step where it changes a decision; there is no separate
`mental-models` skill. Such a skill would almost never be invoked by the agent on its
own, would compete with brainstorming for triggers, and the agentskills standard does
not allow cross-skill file references.

| Model | Location | Form |
|---|---|---|
| First principles | `brainstorming` step 7 | Its own step, with `references/first-principles.md` |
| Inversion | `brainstorming` Black hat; `writing-plans` step 6 (pre-mortem, after Gary Klein, HBR 2007); `security-and-hardening` (STRIDE is already inversion) | Every failure reason in the pre-mortem needs a countermeasure: a test, a Review focus item, a task reorder, or a question for the user |
| Systems thinking | `brainstorming` White hat (system map) and Black hat (second-order effects, feedback loops), projects only; `code-review` Blast radius item; `systematic-debugging` gotcha about loops | Stop at the level where the effects still change the choice |
| Pareto | `brainstorming` step 6 (scope cut); `writing-plans` step 3 (`Slice order`); `code-review` (ranking findings, folding Minor ones) | Proposed only, never cut unilaterally: deferred scope is dropped only when the user agrees |

## One skill for all code work (0.7.0)

`test-driven-development` and `verification-before-completion` were merged into
`executing-plans`. The goal is for every code change to go through the same flow:
settle criteria, failing test first, minimal code, refactor by principles, evidence
gate. Before, this flow required the agent to chain three skills itself, and each
link was a place where a step could be skipped.

| Decision | Reason |
|---|---|
| A "quick path" for work without a plan | The requirement is to be spec-driven and test-driven *always*, even for a small fix or a pasted function. Since the token cuts (below), an XS change inside existing code skips `coding-principles` and follows the surrounding code's conventions; tests and the evidence gate still apply |
| Keep `coding-principles` separate | `writing-plans` and `code-review` use it too; the agentskills standard does not allow cross-skill file references |
| The agent chooses inline or subagent per task | Based on plan length, task size, coupling, and remaining context; risky tasks (auth, data, money, concurrency) always get a fresh reviewer. The user can still choose. |
| The "done needs evidence" rule for non-code work lives in the router | A single always-on gotcha line is cheaper than keeping a whole separate skill |

## Subagents: when, which model, which worktree (0.8.0)

| Decision | Reason |
|---|---|
| Always state `subagent_type: "general-purpose"` and never use `fork` | `fork` copies the whole parent conversation into the subagent, so a reviewer loses exactly the independent view it was created for |
| Every dispatch names a model alias: `haiku` for XS-S single-file tasks that are already tested with tightly fixed signatures; `sonnet` for M tasks, multi-file tasks, `+review` tasks, task reviewers, the builder check; `opus` for the final review and reviewers of risky tasks | Without a model, the subagent uses the main session's model, usually the most expensive one (precedence per the docs: the `model` parameter > frontmatter > `CLAUDE_CODE_SUBAGENT_MODEL` > the main session's model). The Agent tool only accepts aliases. `fable` has no tier yet because it could not be verified |
| Implementers run in their own worktree (`isolation: "worktree"`), and their first step is a reset to `BASE` | Native worktrees branch from the default branch by default, not from the feature branch's HEAD (unless the user sets `worktree.baseRef: "head"`). As requested, the native mechanism is used and then reset, rather than having the controller run `git worktree add` itself |
| The implementer checks its own isolation (`--show-toplevel` differs from the main repo); if the check fails, the whole run switches to inline | Only since Claude Code 2.1.203 do Bash commands run inside the subagent's worktree, and workflow scripts have a bug that skips isolation (issue #102657). This check turns a silent failure into a visible BLOCKED state |
| The controller pins the head as `legion/<plan>/task-N`, confirms its own tree is still clean, reviews `BASE..pin`, then runs `merge --ff-only` | Worktrees with changes get cleaned up periodically by the harness, so the head must be pinned or the commits are lost. A failed fast-forward means the base changed, which needs a ruling, not force |
| Implementers still run one at a time | Each task builds on the previous task's commits. Worktrees are for file isolation, not yet for parallel runs |
| Reviewers and lookups get no worktree | They only read, working from the diff package and absolute paths |
| XS tasks run inline unless about half the context is used | Restarting and installing dependencies in a fresh worktree costs more than the task itself |

Sources: [Claude Code - worktrees](https://code.claude.com/docs/en/worktrees),
[Claude Code - subagents](https://code.claude.com/docs/en/sub-agents),
[issue #75451](https://github.com/anthropics/claude-code/issues/75451),
[issue #102657](https://github.com/anthropics/claude-code/issues/102657).
How cleanup treats worktrees that already have commits, and what a subagent
returns, are not documented. The skill therefore does not rely on them: the
implementer reports its path and sha itself, and the controller pins and removes the
worktree itself.

## Terms and decisions (0.9.0)

| Decision | Reason |
|---|---|
| `domain-modeling` renamed to `defining-terms` | In DDD, "domain modeling" reads as designing entities, aggregates, and domain events, which belongs to `coding-principles`. The skill only settles terminology in `GLOSSARY.md`. |
| ADRs moved into `brainstorming` (`references/adr-format.md`) | Trade-off decisions are made there: approaches are compared in step 8 and grilled in step 9. An ADR is offered when the design doc is written, and only when the decision is hard to reverse, surprising without context, and the result of a real trade-off. A direct entry in step 1 handles "record an ADR for X". |
| No separate ADR skill | It would add a description to the always-on context and a row to the router for a rare task. brainstorming's description gained one trigger phrase instead. |

## Token cuts (Unreleased)

The router sends every code change to `executing-plans`, so its size and the
skills it pulls in are paid on almost every task. Measured with `wc -c`
(about 4 bytes per token, not checked with a tokenizer): an XS fix used to
load about 29.7 KB of skill text (`executing-plans` 17.1 KB, `coding-principles`
7 KB, one rule set, `good-tests.md`); now about 9.6 KB.

| Decision | Reason |
|---|---|
| The plan workflow, inline/subagent choice, model table, and worktree gotchas live in `executing-plans/references/plan-workflow.md` | About 10 KB of `SKILL.md` was needed only when a written plan exists. A plan run pays about 0.7 KB more for the pointer; every quick-path run pays about 10 KB less, and a compaction re-attaches the smaller `SKILL.md` |
| An XS change inside existing code (a condition, a value, one call) does not load `coding-principles` | The skill plus one rule set costs about 11 KB, and a book rule set has little to shape in a one-line change. Anything that adds or reshapes a function, class, module, or interface still loads it |
| `using-legion` is `disable-model-invocation: true`, and the hook strips its frontmatter | The hook already injects it; a listed description told the model to load it "at the start of every session", inviting a second copy. `scripts/validate-spec.mjs` ignores the spec's unknown-field warning for this one Claude Code extension, which `AGENTS.md` already allows |
| The router map names situations in a few words | Skill descriptions are always in context and carry the trigger detail; the map only has to point at the skill |
| Descriptions keep the trigger phrases and shorten the "what" | They are always in context. Lexical trigger evals stayed at 56/58 rank-1; real trigger rates are not measured yet |
| Reviewers read the checklist by path; every reviewer report is capped at 400 words | Pasting a file costs the controller output tokens, and a reviewer's report lands in the controller's context once per task |

## Folded in from addy (Unreleased)

The test for each idea: does it fix something Legion's chain lets through,
and can it ride on a step the agent already takes? Each one rides on
`executing-plans`, so the router, the descriptions, and the skill count stay
as they were. `executing-plans/SKILL.md` grows from 7.8 KB to 9.3 KB.

| Taken | Where | Reason |
|---|---|---|
| "Guard the bar" (`constraint-driven-development` step 6): suppressions, skipped or loosened tests, stubs, lowered thresholds | Evidence gate step 4, implementer prompt, task reviewer, completion contract, code-review checklist | The evidence gate trusted a green run; a run made green by weakening a check passed it. One `git diff` scan closes that, with no tooling |
| Version-sensitive APIs checked in official docs (`source-driven-development`) | One paragraph in the TDD cycle, a `Sources:` report line | Only for an API the repo does not already use the same way, so ordinary changes fetch nothing. Matches the "verify and cite" rule users already give |
| Fresh adversarial review of one decision (`doubt-driven-development`) | `executing-plans/references/doubt-review.md`, read only before an irreversible step or an untestable claim | Legion reviewed before (pre-mortem) and after (code-review), not at the moment of the decision. The reviewer gets artifact and contract, never the claim; three rounds at most |
| Paired behavioral evals (`evals/plugin`) | `evals/plugin/`, `experimental.evals` in `plugin.json` | Lexical evals do not show whether a skill fires on a real model; addy saw one case drop from 6/6 to 1/6 across CLI versions |

| Not taken | Reason |
|---|---|
| `CONSTRAINTS.md`, thresholds, ratchets | A per-project contract and setup interview; the floor checks give most of the value without a file |
| Asking about a second model on every doubt cycle; `sdd-cache` hook | Friction and a settings-level install for every user; the second model is opt-in on request |
| Slash commands, `/build auto`, agent personas | The router and the reviewer prompts already cover them; commands would add a second entry point |
| `interview-me`, `idea-refine`, `incremental-implementation`, `code-simplification`, `git-workflow-and-versioning` | Covered by brainstorming's grilling, writing-plans' slices, coding-principles, and the plan template's typed commits |

## Folded in from mattpocock (Unreleased)

Legion already took mattpocock's core (grilling, glossary and ADRs, seams,
the debugging feedback loop, two-axis review). The test for the rest: does it
cost nothing in a session that does not need it? A pointer inside a skill
that already loads passes; a new skill does not.

| Taken | Where | Reason |
|---|---|---|
| `pr` | `executing-plans/assets/pr-body.md`, read only when opening a PR | A separate model-invoked skill would add a description to every session for a rare moment; the evidence and rulings it needs are already in `executing-plans` |
| HITL loop from `diagnosing-bugs` | `systematic-debugging` step 2 and `scripts/hitl-loop.sh` | The 0.x adaptation dropped it. The script is run by the user with `!`, because the Bash tool has no terminal for its prompts |

| Not taken | Reason |
|---|---|
| `setup-matt-pocock-skills`, `to-spec`, `to-tickets`, `triage`, `wayfinder`, `implement-spec` | The issue-tracker flow; still on the roadmap behind a setup skill |
| `improve-codebase-architecture`, `codebase-design`, `prototype` | `coding-principles` carries the APoSD deep-module rules, and brainstorming allows an agreed spike. Revisit if users ask for a codebase survey |
| `handoff`, `retro` | Tried as user-invoked skills, then removed on the maintainer's decision; `handoff` stays on the roadmap |
| `wait-what`, `teach`, `to-questionnaire`, `research`, `writing-for-agents`, `in-progress/*`, `misc/*` | Outside an engineering workflow, covered by `skill-creator`, or frozen or unfinished upstream |

## Artifact conventions

- `docs/legion/specs/` and `docs/legion/plans/`: committed; the source of truth.
- `.legion/runs/<plan>/`: ledger, briefs, and diff packages. This directory is
  gitignored and deleted after the user chooses how to integrate.
- `GLOSSARY.md` and `docs/adr/`: created only when there is content, the mattpocock way.

## Testing

| Layer | What it checks | Where it runs | Cost |
|---|---|---|---|
| `scripts/validate.mjs` | Frontmatter, size, dev files leaking into `skills/`, links, `legion:` refs, router and README covering every skill, matching versions, hook is executable | CI, local | 0 |
| `scripts/trigger-evals.mjs` | Positive prompts must rank their skill in the top 3; negative prompts must not rank the skill first; no two descriptions may be near-duplicates | CI, local | 0 |
| `tests/hooks/` | The hook emits valid JSON, includes the router without its frontmatter, and falls back when files are missing | CI, local | 0 |
| shellcheck | `hooks/session-start` and the hook tests | CI, local | 0 |
| `claude plugin validate --strict` | Manifests and skills against the Claude Code standard | Local | 0 |
| Behavioral evals (`claude plugin eval`, `evals/plugin/`) | Whether a skill fires on a natural prompt and what it adds to the reply, with and without the plugin | Local, on demand | Costs tokens |

Trigger evals are only a vocabulary approximation. They catch descriptions missing
words users say, but they do **not** prove that a skill actually triggers on a real
model.
