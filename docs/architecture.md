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
   (`skills/creating-skills/references/measuring.md`). Only a lift grader's
   delta is evidence that the plugin helps (`docs/evals.md`).
1. **A suite, not a pipeline.** Since 1.0.0 Legion is a set of working skills,
   not an SDLC chain. `finding-skills` picks the skill that fits the
   work, Legion's or any other installed skill; skills are used alone or chained only when one's result is the next
   one's input.
2. **Two purposes: general-purpose and engineering.** Since 1.3.1
   `brainstorming`, `finding-skills`, `creating-skills`, `optimizing-prompts`
   (since 1.4.0), and `planning` and `orchestrating-subagents` (since 1.5.0)
   name no domain as the default: deciding what to do and why, finding the
   skill that fits, breaking work into tasks, running those tasks, writing a
   skill, and sharpening a prompt are the same method for a strategy, a process, or a
   feature, and their domain examples live in evals, never in the skill.
   `implementing-stdd`, `debugging`, and `auditing-security` serve
   engineering work (software, infrastructure, data, security); their methods
   lean on tests, builds, deploys, and queries, and a generic version of each
   was weaker at both. They name no single language or stack as the default.
   A new skill's purpose is the maintainer's call, asked before it is
   written.
3. **Light skill finding, not enforcement.** A skill loads only when the work
   matches; a loaded skill is never softened.
4. **User instructions win** over every skill, except that a first request to
   skip a safety step keeps the cheap control with a one-line reason, and drops
   it only if the user insists.
5. **No dependencies.** The hooks use bash builtins, scripts use stock Node; only
   `validate:spec` needs `python3` (the creating-skills validator).
6. **agentskills.io for every skill:** a description of what and when, a
   Workflow / Gotchas body, long templates in `assets/`, rules with their reason,
   `SKILL.md` under 20,000 bytes, no development material under `skills/`.

## Provenance

| Source | Taken | Where |
|---|---|---|
| superpowers | Hook and router; brainstorm gate before building; plans with a pre-mortem and self-review; naming the break a check catches, proving a check by revert, reviewing for Missing and Extra | `hooks/`, `finding-skills`, `brainstorming`, `planning`, `implementing-stdd` |
| mattpocock | Grilling in rounds; debugging from a feedback loop | `brainstorming`, `debugging` |
| addyosmani | Spec structure and boundaries; read-only planning, dependency order, slices and file-count sizes, never overwriting an unfinished plan, tracker targets, parallel streams; spec- and test-driven development; misuse criteria and trust-boundary checks; advisory triage and install-script risk; trigger evals; eval case layout | `brainstorming`, `planning`, `implementing-stdd`, `auditing-security`, `scripts/trigger-evals.mjs`, `evals/plugin/` |
| duongot-skills | `creating-skills` and its validator | `skills/creating-skills`, `scripts/validate-spec.mjs` |
| cloudflare | The security audit: guidance and full-audit modes, sandbox rules, coverage ledger, hunting, adversarial validation, findings schema and validators | `skills/auditing-security`, `tests/scripts/auditing-security/` |

Dropped on purpose: multi-harness support and the Windows hook wrapper; the
visual brainstorm companion. Skills removed in 1.0.0 are listed in
`CHANGELOG.md`.

## Design decisions

| Decision | Reason |
|---|---|
| **Five skills behind `finding-skills`**, chosen by kind of work: direction not settled (`brainstorming`), direction settled and the work to be broken into tasks (`planning`), a change to build against criteria (`implementing-stdd`), cause unknown (`debugging`), skill authoring (`creating-skills`) | The kinds of work recur across every domain; the method for deciding, building to criteria, and finding causes does not depend on the domain |
| **`planning` is general-purpose since 1.5.0, with an engineering reference**: it breaks a settled goal into small tasks (one doer, one sitting, one checkable result, with Inputs, Depends on, Parallel with, Scope, and Done when), and reads `references/engineering.md` when the work changes software, infrastructure, or data: repo commands and paths, vertical slices that keep the build green, staged rollouts, never overwriting an unfinished plan | Backward planning, dependency order, shared decisions first, reversible change, and a pre-mortem are the same method for a feature, an event, or a process. What a code plan gets wrong is repo facts and repo state, so those rules load only when the work is engineering, keeping the default domain-free |
| **`planning` breaks the work; `orchestrating-subagents` runs it** | A plan's task fields are exactly what a dispatch needs (inputs as pointers, scope, dependencies, a done check), so orchestration takes them as its pieces without re-splitting and sends a task too big for one context back to the plan. Deciding the tasks and deciding who runs them are different decisions, made at different times: the plan before approval, the dispatch after
| **`auditing-security` is the one domain skill**, ported from cloudflare with its procedure intact; it is guidance by default and runs the six-phase audit only on an explicit audit, pen-test, or report request | Its value is domain facts no general method supplies (attack classes, sandbox controls, the findings contract and its validators); `finding-skills` ranks a specific skill first for its part. A full audit costs many agent invocations, so it never starts from a question |
| `auditing-security` writes its run outside the target by default (`~/.legion/security-audit/<repo>/run-<N>`), not in `.legion/runs/` | Findings describe exploitable flaws: they stay out of version control and out of reach of sandboxed target code. An in-repo directory is allowed only when the user picks it and version control ignores it |
| Hardening material is split by kind of work: finding flaws in existing work goes to `auditing-security`, building a change that crosses a trust boundary to `implementing-stdd` (misuse lines as New criteria, `references/trust-boundaries.md`) | The checks a change needs before it ships and the evidence an audit needs to confirm a flaw are different methods; addy's checklists were cut where they restate what the model knows or would count as findings without a crossed boundary |
| `auditing-security` verifiers run on tier `top`, hunters on `session` | A verifier decides what the user is told is confirmed; a weaker verifier than the hunter it checks turns the independent check into a formality |
| No default flow; a skill offers the next one only when its result is that skill's input | A fixed chain forced steps onto work that did not need them |
| `planning` ends at the reviewed plan and offers `orchestrating-subagents` when agents will carry it out. `implementing-stdd` is a method for one change (criteria, checks red, then green), used per step or alone, not a runner of plans | Carrying out the plan is the work itself; baseline runs showed the gap is not order of steps but the unchanged behavior and open cases no one wrote down |
| `debugging` builds a loop that shows the failure: a reproduction when the system can be re-run, otherwise a symptom check plus an evidence timeline; the fix ends with a recurrence control that fits the system (test, check, monitor, procedure step) | A live outage or a process problem cannot be re-run, yet the same discipline applies |
| `orchestrating-subagents` assigns pieces by the cost of a wrong answer (cheap-to-spot work on `cheap`, repeated well-scoped work on `standard`, edits and judgment on `session`, verdicts on `top`) and escalates by verification, then effort, then model | Anthropic's model-selection guidance (2026-11-09): a misread by a small model costs the main model more than the tokens saved, and on checkable work verification and a re-run of failures beat uniform high effort. The tier table stays in `finding-skills`, so every skill resolves tiers the same way |
| **Subagents** start fresh (`general-purpose`, never `fork`) with an explicit tier defined once in `finding-skills` | A pinned alias caps every later session at the model that was best when the line was written; `npm run validate` rejects a pinned `model: "<alias>"` |
| No glossary or ADR writing in `brainstorming`; existing ones are read as facts | Rare tasks the model handles without a format; each cost description and `finding-skills` space |
| `finding-skills` is `disable-model-invocation: true` and the hook strips its frontmatter | The hook already injects it; a listed description invited a second copy |
| `hooks/guard` asks before secret files and before a broad scan of `dist/` or `build/`, and denies a broad scan of `node_modules`; bash builtins only, fails open; its messages never tell the agent to set `LEGION_GUARD` | A convenience; Claude Code's permission rules stay the boundary. Only the user can switch the guard off |
| Behavioral evals are the bar: a case is at the bar at a with-plugin mean of 0.66 (2 of 3 runs), outcome graders must not score lower with the plugin than without, and a grader is never loosened to pass | Lexical evals do not show that a skill fires or helps |
| Six Thinking Hats is a checklist against missed perspectives, not a ritual | The research evidence for the method is thin |

## Thinking models

Each model sits where it changes a decision; there is no separate skill for them.
"n/a" means no decision to change.

| Skill | First principles | Inversion | Systems thinking | Pareto |
|---|---|---|---|---|
| `brainstorming` | Lens table; White and Green hats; grilling tree | Lens table; Black hat; grilling "Wrong if" | Lens table (systems, second-order); grilling branches | Lens table (impact vs. effort); scope cut; grilling order |
| `planning` | Backward planning from the done state; outcome vs. output; definition of done; shared decisions first | Pre-mortem (step 7); planning fallacy; reversible change | Dependency graph, critical path, parallel streams, Produces and Inputs lines; old and new versions side by side (engineering); checkpoints and rolling wave | Leverage, saying no, buffer |
| `debugging` | Own lens table: facts vs. assumptions, minimization | Own lens table: falsification | Own lens table: delta, bottom-up, nothing is obviously fine; five-whys tree with contributing causes | Own lens table: bisection, common before rare, contain before fixing |
| `implementing-stdd` | Criteria before change; vague goals made measurable | A new check must fail first; Unchanged checks pin what can break | Read the work, not only its tests, for rules enforced but unchecked | Least change that turns the checks green; Deferred list |
| `creating-skills` | What the agent lacks; baseline failures are the spec | Near-miss prompts | n/a | Write only what fixes observed failures |

## Artifacts

In a repo using Legion: `.legion/specs/` and `.legion/plans/` are committed;
everything else in `.legion/` is gitignored. Legion's own repo ignores all of `.legion/`.

## Testing

| Layer | Checks | Runs | Cost |
|---|---|---|---|
| `scripts/validate.mjs` | Frontmatter, size, dev files in `skills/`, links, `legion:` refs, finding-skills map and README coverage, matching versions and a bump since the latest tag (an error in CI when it cannot run), hook files exist, CI least privilege, eval case structure and a firing plus a stays-quiet case per skill | CI, local | 0 |
| `tests/scripts/` | Each `validate.mjs` and `trigger-evals.mjs` rule fails on a copy of the repo with that defect (one table row per rule); `shellcheck.mjs` and `summarize-eval.mjs` behavior | CI, local | 0 |
| `scripts/trigger-evals.mjs` | Scores prompts against each skill's description plus its `finding-skills` map row. Positives rank their skill #1 (at least 90% overall and 75% per skill); negatives not first and below their owner; no near-duplicate descriptions. Vocabulary only: it does not prove a real model triggers | CI, local | 0 |
| `tests/hooks/` | `session-start` emits valid JSON with `finding-skills`; `guard` behavior, including with no `PATH` | CI, local | 0 |
| `scripts/shellcheck.mjs` | Hooks and `.sh` files; skipped with a note when shellcheck is missing locally, an error in CI | CI, local | 0 |
| `claude plugin validate --strict` | Manifests and skills | Local | 0 |
| `claude plugin eval` (`evals/plugin/`, 21 cases) | Fires, stays quiet, holds under pressure, with and without the plugin; every non-routing grader declares `lift`, `guard`, or `protocol` (`evals/grader-kinds.json`) | Local, on demand | Tokens; see `docs/evals.md` |
