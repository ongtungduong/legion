# Behavioral evals

Cases live in `evals/plugin/` (38; `prompt.md` plus `graders/`, and `case.yaml`
plus `fixture.sh` for a case that scaffolds a project). Each skill has a firing
case, a stays-quiet case, and cases whose lift graders measure what the skill
is for: the reply asks for the purpose before proposing a format
(`brainstorming-fires-on-open-topic`), a conflict found by reading the code's
other callers surfaces before the recommendation (`brainstorming-ab-hidden-conflict`),
an open decision surfaces before anything is built under pressure
(`brainstorming-holds-under-build-pressure`), a plan is not written for an
unsettled goal (`planning-holds-on-unsettled-goal`) and every step of it ends
green (`planning-keeps-unfinished-plan`), planning breaks non-engineering work
into small checkable tasks (`planning-fires-on-event-plan`) while debugging
stays quiet on it (`debugging-stays-quiet-on-business-process`), every
contributing cause of an incident gets its own control
(`debugging-finds-contributing-causes`), and every cause is kept when the user has
already named one culprit (`debugging-keeps-every-contributing-cause`); a
skill review catches the defects a quick read misses (`skill-creator-fixes-existing-skill`). `find-skills` has cases for combining a
method with a project skill (`find-skills-combines-method-and-project-skill`, and
`find-skills-combines-std-with-legacy-skill`, whose lift grader checks that the
current behavior is pinned through the project's own seams), following the project's choice between two skills
for one job, and staying quiet on a question and on a trivial edit.
A grader is deterministic (`regex`, `tool_used`) when a pattern can decide it and
an `llm` judge only when judgment is needed, since a judge costs tokens on every run.
A judge checks one claim: a rubric that joins a result the baseline reaches
(the bug found) with one it misses (the reproduction) is two graders, so the
second's delta is not hidden by the first.

**Grader syntax the CLI is strict about.** A `regex` grader is compiled as
`new RegExp(pattern, flags)` over the last message (`target:` changes that):
JavaScript has no inline flags, so `(?i)` fails in both arms and looks like a
real result; write `flags: i`. `Write`, `Edit`, and `Bash` are gated: a case's
`allowed_tools` offers them only when the run also passes `--allow-tools`, and
without it a `max: 0` grader on them passes by construction. `npm run validate`
compiles every regex grader and rejects an `llm` grader with no criteria. A case name starts with
the skill it tests (or `find-skills-`); `-stays-quiet-` in the name means the skill
must not fire. `npm run validate` checks that structure and that every skill has
a firing case (a `tool_used` grader on `Skill` whose `input_match` matches
`legion:<skill>`) and a stays-quiet case (the same grader with `max: 0`; the
`find-skills`' must match every skill). Raw results (`evals/results/`) stay out of git.
Full per-run logs were removed from this file and are in git history.

**Summaries.** After a run, `npm run evals:summarize -- evals/results/<file>.json <label>`
writes `evals/summaries/<date>-<label>.json`, which is committed. It keeps the
Claude Code version, model, cost (`costUsd` for the agent runs, `judgeCostUsd`
separately, since the CLI leaves judge cost out), and each case's pass rate,
mean score, delta, and per-grader pass counts; prompts, judge evidence, and
local paths stay out. `totals.atBar` counts cases at this file's bar (mean score
of at least 0.66); the CLI's own `passed` uses 0.67 and undercounts. Pass
`--model` when the run had no `--model` override. It records the judge model too
(`haiku` when the run passed no `--judge-model`). Quote new numbers in this file
only from a committed summary.

**Bar.** A case is at the bar when its with-plugin mean score is at least 0.66
(2 of 3 runs). Lift and guard graders (below) must not score lower with the plugin than
without. A failing case gets its transcript read and a ruling on whether the
skill or the grader was wrong; a grader is never loosened to pass.

**What a grader is evidence of.** `evals/grader-kinds.json` declares every grader
that is not a Skill-call check, before it first runs, as one of:

| Kind | Means | Baseline expected to | Read its delta as |
|---|---|---|---|
| `lift` | an outcome a user who never heard of Legion would call better (the cause found, the question that mattered asked, the control kept) | miss it | evidence that the plugin helps; about 0 means the grader measures nothing: harden the prompt or cut it |
| `guard` | an outcome the baseline reaches too (the plain answer, the obvious bug, the requested format) | pass it | no-harm check: only a negative delta counts |
| `protocol` | Legion's own procedure or format (a named report line, holding a build for approval) | fail it by construction | the plugin runs as designed, never as help |

Skill-call graders are `routing` by type. The kind is declared up front so a
result cannot relabel the grader that produced it. `npm run evals:summarize`
(summary schema 3) reports `totals.lift` (pass rates in both arms, the mean
per-grader delta with a 95% t interval over graders, and the delta per skill),
`totals.guard`, every lift or guard grader the plugin arm lost under
`totals.regressions`, and the with-arm's cost, turns, and time as a multiple of
the no-plugin arm's under `totals.overhead`. The interval treats graders as
independent and is optimistic when the graders of one case move together; a lift
whose interval spans 0 is not yet evidence. A grader with no declared kind counts
toward no outcome figure, and `npm run validate` rejects a new grader that
declares none.

```bash
claude plugin eval . --no-publish --model sonnet --judge-model sonnet --scaffold --allow-tools Write Edit "Bash(node:*)" "Bash(npm:*)" --runs 3 --threshold 0.66 -j 3 --max-cost-usd 20 --json evals/results/<file>.json
```

`--threshold 0.66` because the CLI compares 2/3 = 0.6667 with 0.67 and fails it;
`-j 3` because concurrency defaults to 1; `--judge-model sonnet` because the
default judge is haiku, which the CLI's own authoring guide calls too small for
rubric graders; `--scaffold` because ten cases build their workspace from a
`fixture.sh` this repo wrote; `--allow-tools Write Edit` so the cases that list
those tools can use them (the scaffolds run in a temp directory), and the two
`Bash` patterns so `std-development-fires-on-approved-spec` can run
its tests. The CLI refuses every run that grants `Bash` when it cannot read a
credentials file it must exclude from the sandbox (`EACCES`); on such a machine
run that case alone, or drop the `Bash` patterns and read its graders as not run. The run is 38
cases x 3 runs x 2 arms = 228 agent runs plus the judges; a hit ceiling exits 2
with partial results, so re-run the missing cases with `--case`. Run it as one line. At 3 runs one run
moves a score by 0.33: treat a lone +0.33 as noise and re-run at 5. Record the
model, Claude Code version, and cost for every run.

## Runs on record

None yet for 1.0.0. Summaries of earlier versions measured the old SDLC
skills and were removed with them; they remain in git history.

## Limits

LLM judges can be wrong: read transcripts before acting on a difference. Prompts
are synthetic, brainstorming and planning cases are single-turn, and 3 to 5 runs detect only
large effects. A path target also runs a no-plugin arm, and that arm removes the
whole plugin, so a positive delta does not show that one quoted line is the cause;
confirm a cut by ablation first.
