# Behavioral evals

Cases live in `evals/plugin/` (18; `prompt.md` plus `graders/`, and `case.yaml`
plus `fixture.sh` for a case that scaffolds a project). A case name starts with
the skill it tests (or `router-`); `-stays-quiet-` in the name means the skill
must not fire. `npm run validate` checks that structure and that every skill has
a firing case (a `tool_used` grader on `Skill` whose `input_match` matches
`legion:<skill>`) and a stays-quiet case (the same grader with `max: 0`; the
router's must match every skill). Raw results (`evals/results/`) stay out of git.
Full per-run logs were removed from this file and are in git history.

**Summaries.** After a run, `npm run evals:summarize -- evals/results/<file>.json <label>`
writes `evals/summaries/<date>-<label>.json`, which is committed. It keeps the
Claude Code version, model, cost (`costUsd` for the agent runs, `judgeCostUsd`
separately, since the CLI leaves judge cost out), and each case's pass rate,
mean score, delta, and per-grader pass counts; prompts, judge evidence, and
local paths stay out. `totals.atBar` counts cases at this file's bar (mean score
of at least 0.66); the CLI's own `passed` uses 0.67 and undercounts. Pass
`--model` when the run had no `--model` override. Quote new numbers in this file
only from a committed summary.

**Bar.** A case is at the bar when its with-plugin mean score is at least 0.66
(2 of 3 runs). Outcome graders (below) must not score lower with the plugin than
without. A failing case gets its transcript read and a ruling on whether the
skill or the grader was wrong; a grader is never loosened to pass.

**What a grader is evidence of.** `evals/grader-kinds.json` declares every grader
that is not a Skill-call check as `outcome` (a result a user who never heard of
Legion would call better: the cause found, the question that mattered asked,
the control kept) or
`protocol` (Legion's own procedure or format: a named report line, a heading, a
plugin file that was read). Skill-call graders are `routing` by type. Only an
outcome grader's with-minus-without delta shows that the plugin helps: a routing
grader scores 0 in the no-plugin arm by construction, and a protocol grader fails
there because the baseline never saw the plugin's format. `npm run
evals:summarize` (summary schema 2) therefore reports `totals.outcome` apart from
`meanDelta`, names every outcome grader the plugin arm lost under `regressions`,
and records the with-arm's cost, turns, and time as a multiple of the no-plugin
arm's under `totals.overhead`. A grader with no declared kind counts toward no
outcome figure, and `npm run validate` rejects a new grader that declares none.

```bash
claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.66 -j 3 --max-cost-usd 15 --json evals/results/<file>.json
```

`--threshold 0.66` because the CLI compares 2/3 = 0.6667 with 0.67 and fails it;
`-j 3` because concurrency defaults to 1. Run it as one line. At 3 runs one run
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
