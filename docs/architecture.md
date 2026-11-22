# Legion architecture

The deliberate decisions behind the current design, with their reasons, so nobody
"fixes" them by accident. History is in `CHANGELOG.md` and git.

## Foundations

0. **A floor, not a ceiling.** The harness adds what a strong agent lacks: a
   method that holds when improvising is tempting, independent checks, state
   that survives compaction. It must not cap what a stronger agent does: a rule
   needs its reason and an exit where the reason does not apply, a dispatch never
   runs below the session's model for work the user relies on, and a rule that no
   longer changes an outcome on the newest model is cut
   (`skills/skill-creator/references/measuring.md`). Only an outcome grader's
   delta is evidence that the plugin helps (`docs/evals.md`).
1. **A suite, not a pipeline.** Since 1.0.0 Legion is a set of general-purpose
   working skills, not an SDLC chain. `router` picks the skill that fits the
   work; skills are used alone or chained only when one's result is the next
   one's input.
2. **General-purpose skills.** `brainstorming`, `planning`, and `debugging`
   name no domain as the default. Code is one kind of work among strategy,
   systems, processes, and operations; domain examples live in evals, never in
   a skill.
3. **A light router, not enforcement.** A skill loads only when the work
   matches; a loaded skill is never softened.
4. **User instructions win** over every skill, except that a first request to
   skip a safety step keeps the cheap control with a one-line reason, and drops
   it only if the user insists.
5. **No dependencies.** The hooks use bash builtins, scripts use stock Node; only
   `validate:spec` needs `python3` (the skill-creator validator).
6. **agentskills.io for every skill:** a description of what and when, a
   Workflow / Gotchas body, long templates in `assets/`, rules with their reason,
   `SKILL.md` under 20,000 bytes, no development material under `skills/`.

## Provenance

| Source | Taken | Where |
|---|---|---|
| superpowers | Hook and router; brainstorm gate before building; plans with a pre-mortem and self-review | `hooks/`, `router`, `brainstorming`, `planning` |
| mattpocock | Grilling in rounds; debugging from a feedback loop and the human-in-the-loop script | `brainstorming`, `debugging` |
| addyosmani | Spec structure and boundaries; slices and sizes; trigger evals; eval case layout | `brainstorming`, `planning`, `scripts/trigger-evals.mjs`, `evals/plugin/` |
| duongot-skills | `skill-creator` and its validator | `skills/skill-creator`, `scripts/validate-spec.mjs` |

Dropped on purpose: multi-harness support and the Windows hook wrapper; the
visual brainstorm companion. Skills removed in 1.0.0 are listed in
`CHANGELOG.md`.

## Design decisions

| Decision | Reason |
|---|---|
| **Four skills behind one router**, chosen by kind of work: direction not settled (`brainstorming`), direction settled and steps needed (`planning`), cause unknown (`debugging`), skill authoring (`skill-creator`) | The kinds of work recur across every domain; the method for each does not depend on the domain |
| No default flow; a skill offers the next one only when its result is that skill's input | A fixed chain forced steps onto work that did not need them |
| `planning` ends at the reviewed plan; there is no execution skill | Carrying out the plan is the work itself, by the agent or by people; the plan's done-checks are what keeps it honest |
| `debugging` builds a loop that shows the failure: a reproduction when the system can be re-run, otherwise a symptom check plus an evidence timeline; the fix ends with a recurrence control that fits the system (test, check, monitor, procedure step) | A live outage or a process problem cannot be re-run, yet the same discipline applies |
| **Subagents** start fresh (`general-purpose`, never `fork`) with an explicit tier defined once in the router | A pinned alias caps every later session at the model that was best when the line was written; `npm run validate` rejects a pinned `model: "<alias>"` |
| No glossary or ADR writing in `brainstorming`; existing ones are read as facts | Rare tasks the model handles without a format; each cost description and router space |
| `router` is `disable-model-invocation: true` and the hook strips its frontmatter | The hook already injects it; a listed description invited a second copy |
| `hooks/guard` asks before secret files and before a broad scan of `dist/` or `build/`, and denies a broad scan of `node_modules`; bash builtins only, fails open; its messages never tell the agent to set `LEGION_GUARD` | A convenience; Claude Code's permission rules stay the boundary. Only the user can switch the guard off |
| Behavioral evals are the bar: a case is at the bar at a with-plugin mean of 0.66 (2 of 3 runs), outcome graders must not score lower with the plugin than without, and a grader is never loosened to pass | Lexical evals do not show that a skill fires or helps |
| Six Thinking Hats is a checklist against missed perspectives, not a ritual | The research evidence for the method is thin |

## Thinking models

Each model sits where it changes a decision; there is no separate skill for them.
"n/a" means no decision to change.

| Skill | First principles | Inversion | Systems thinking | Pareto |
|---|---|---|---|---|
| `brainstorming` | Lens table; White and Green hats; grilling tree | Lens table; Black hat; grilling "Wrong if" | Lens table (systems, second-order); grilling branches | Lens table (impact vs. effort); scope cut; grilling order |
| `planning` | Decided values written down | Pre-mortem (step 6) | Produces lines, dependencies | Step order (step 3) |
| `debugging` | Facts before hypotheses | Falsifiable predictions | Feedback loops, boundaries between components | Likelihood for the cost of checking |
| `skill-creator` | What the agent lacks; baseline failures are the spec | Near-miss prompts | n/a | Write only what fixes observed failures |

## Artifacts

In a repo using Legion: `.legion/specs/` and `.legion/plans/` are committed;
everything else in `.legion/` is gitignored. Legion's own repo ignores all of `.legion/`.

## Testing

| Layer | Checks | Runs | Cost |
|---|---|---|---|
| `scripts/validate.mjs` | Frontmatter, size, dev files in `skills/`, links, `legion:` refs, router and README coverage, matching versions and a bump since the latest tag (an error in CI when it cannot run), hook files exist, CI least privilege, eval case structure and a firing plus a stays-quiet case per skill | CI, local | 0 |
| `tests/scripts/` | Each `validate.mjs` and `trigger-evals.mjs` rule fails on a copy of the repo with that defect (one table row per rule); `shellcheck.mjs` and `summarize-eval.mjs` behavior | CI, local | 0 |
| `scripts/trigger-evals.mjs` | Scores prompts against each skill's description plus its router map row. Positives rank their skill #1 (at least 90% overall and 75% per skill); negatives not first and below their owner; no near-duplicate descriptions. Vocabulary only: it does not prove a real model triggers | CI, local | 0 |
| `tests/hooks/` | `session-start` emits valid JSON with the router; `guard` behavior, including with no `PATH` | CI, local | 0 |
| `scripts/shellcheck.mjs` | Hooks and `.sh` files; skipped with a note when shellcheck is missing locally, an error in CI | CI, local | 0 |
| `claude plugin validate --strict` | Manifests and skills | Local | 0 |
| `claude plugin eval` (`evals/plugin/`, 18 cases) | Fires, stays quiet, holds under pressure, with and without the plugin; every non-routing grader declares `outcome` or `protocol` (`evals/grader-kinds.json`) | Local, on demand | Tokens; see `docs/evals.md` |
