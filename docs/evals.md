# Behavioral evals

Cases live in `evals/plugin/` (48; `prompt.md` plus `graders/`, and `case.yaml`
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
Legion would call better: the bug found, the code correct, the control kept) or
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
A severity label is not an outcome: a grader that requires "Critical" or
"Important" rewards Legion's vocabulary, so outcome graders accept the reviewer's
equivalent (blocking, must fix before merge) and fail only a finding presented as
minor or optional.

```bash
claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.66 -j 3 --max-cost-usd 15 --json evals/results/<file>.json
```

`--threshold 0.66` because the CLI compares 2/3 = 0.6667 with 0.67 and fails it;
`-j 3` because concurrency defaults to 1. Run it as one line. At 3 runs one run
moves a score by 0.33: treat a lone +0.33 as noise and re-run at 5. Record the
model, Claude Code version, and cost for every run.

## Runs on record

Cost is the agent runs plus the judge (`costUsd + judgeCostUsd` of the
summary). A row marked **unsourced** has no committed summary: its numbers come
from that day's session and cannot be re-checked; the next run that covers its
scope replaces it.

| Date | Claude Code | Model | Scope | Cost (USD) | Result | Source |
|---|---|---|---|---|---|---|
| 2026-11-09 | 2.1.319 | sonnet | full suite, 0.11.0 skills (30 cases) | 6.81 | 20/30 at the bar on the full run; the 30/30 and 10.69 recorded earlier do not match this file and are unsourced (probably the full run plus that day's reruns) | `2026-11-09-full-0.11.0.json` |
| 2026-11-10 | 2.1.322 | sonnet | full suite, 0.12.0 skills (29 cases) | 10.25 | 27/29; `code-review-runs-system-audit` and `security-audit-on-system` (now `code-review-security-audit-on-system`) fixed afterwards | `2026-11-10-full-0.12.0.json` |
| 2026-11-11 | 2.1.322 | haiku | full suite, 0.12.0 skills (39 cases) | 1.66 | 31/39 at the bar; mean delta +0.28 (sonnet 0.12.0: +0.43) | `2026-11-11-full-0.12.0-haiku.json` |
| 2026-11-11 | 2.1.322 | sonnet, haiku | five `-hard` sibling cases, ablations (B3) | about 6 | two instructions cut (see B3) | unsourced |
| 2026-11-12 | 2.1.322 | sonnet | 0.13.0 skills, 15 affected cases | 10.41 | 14/15; the one miss is B1 | unsourced (raw result not kept) |
| 2026-11-12 | 2.1.322 | sonnet | new quiet cases for `executing-plans` and `systematic-debugging`, plus `router-stays-quiet-on-question` | 0.55 | 3/3 at the bar in both arms | `2026-11-12-new-quiet-cases.json` |
| 2026-11-16 | 2.1.325 | sonnet (judge sonnet) | negative control `code-review-approves-clean-diff`, 5 runs, 0.13.1 skills | 0.51 | with 5/5, without 5/5: no invented finding; with-arm cost 2.0x, turns 2.5x | `2026-11-16-control-approves-clean-diff.json` |
| 2026-11-16 | 2.1.325 | sonnet (judge sonnet) | `code-review-flags-unmeasured-speed-claim` after splitting its grader in two, 5 runs, 0.13.1 skills | 1.29 | outcome delta +0.20 (with 1.00, without 0.80); no regression; with-arm cost 2.0x | `2026-11-16-control-speed-claim-regrade.json` |
| 2026-11-16 | 2.1.325 | sonnet (judge sonnet) | negative control `executing-plans-rules-on-untestable-change`, 3 runs, 0.14.0 skills | 0.55 | with 3/3, without 3/3; the skill fired in 1 of 3 runs, and none of them stalled | `2026-11-16-control-no-seam.json` |

Sources are files in `evals/summaries/`.

The last full sonnet suite is 0.12.0. 0.13.0 re-ran only the cases it affected
(all passing except B1; unsourced, same run), including three new ones:
`code-review-runs-design-audit` 1.00 vs 0.00, `code-review-proposes-three-axis-audit`
1.00 vs 0.00, and `principles-shapes-new-module` 1.00 vs 0.00 (it was open at 2/5 before).

## What the evals changed

- The router sends "what broke?" to debugging, and a request to skip a safety
  step keeps the cheap control (the router's "user instructions win" let
  "skip the validation" and "just add a retry" bypass every skill).
- `executing-plans` and `systematic-debugging` keep the test-first order and the
  report block in sessions that cannot run code.
- `code-review` routes "review this whole codebase" to the audit even when files
  are pasted; size shortens an audit's bodies, not its headings.
- The skill descriptions gained the phrasings that failed to fire.

## Known weak spots

- **The headline delta overstates the effect.** The 0.12.0 sonnet `meanDelta` of
  +0.43 includes five cases graded only on whether a skill was called, which the
  no-plugin arm cannot pass; without them it is +0.31 (summary schema 1 has no
  per-grader data for the no-plugin arm, so an outcome-only figure comes from the
  next full run). On the graders that measure a result, sonnet is near parity:
  `executing-plans-holds-bar-under-pressure` +0.33, `code-review-flags-n-plus-one`
  +0.33, and two cases where the plugin arm scored lower (-0.33 each, see the next
  item).
- **The two losses in the 0.12.0 sonnet run were measurement, not harm.**
  `code-review-flags-unmeasured-speed-claim` combined two checks in one grader
  that also demanded the label "Critical" or "Important"; regraded in two parts
  (2026-11-16 row) the plugin arm passes 5/5 on both and the no-plugin arm misses
  the unmeasured-claim check in 2 of 5. The earlier haiku-judged run also
  failed with-plugin answers that appear to contain both findings (a reading of
  the transcripts, not a re-judged result); the 2026-11-16 runs use
  `--judge-model sonnet`.
  `executing-plans-batches-queries` (-0.33) is unexplained; it stays open.
- **Cost.** A review costs about twice the no-plugin answer (cost 2.0x, turns
  2.5x to 3x on the 2026-11-16 runs) and found nothing more on a clean diff. That
  is the price of the independent verifier; it is not a gain on small diffs.
- **Everything measured is sonnet or haiku.** No run uses a more capable model,
  so no number here says whether the harness helps one. The tier table in
  `legion:using-legion` keeps judgment work from resolving below the session's
  model, but that is a design choice, not a measurement.
  Fixture twins (`executing-plans-batches-queries-fixture`,
  `code-review-flags-n-plus-one-fixture`,
  `executing-plans-holds-bar-under-pressure-fixture`) scaffold a small project
  and grade the files with regexes instead of an LLM judge. Like B1, they need
  `--scaffold --allow-tools Write Edit Bash` and have never run here: the CLI
  refuses the Bash grant inside the tool sandbox. Run them from an unsandboxed
  terminal: `claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.66 -j 3 --max-cost-usd 5 --trust-plugin --scaffold --allow-tools Write Edit Bash --case '*-fixture' --json evals/results/<file>.json`.
- **haiku** fires `brainstorming` on 1 of 3 runs and `principles` on "is this safe?"
  on 0 of 3 in the 0.12.0 haiku summary (sonnet fires reliably); accepted as a
  small-model limit.
- Quiet cases are expected to score 0.00 delta.

## Open measurements

| Block | Status |
|---|---|
| **B1**: is the quick path too heavy for a one-line fix? Case `executing-plans-cost-on-one-line-fix` (needs `--scaffold --allow-tools Write Edit Bash`) | No valid measurement: the haiku run scored both arms 0.20 with `suite-green` 0/3, so the agents never ran the suite (the Bash grant was refused inside the tool sandbox; run it from an unsandboxed terminal). The quick path stays as written until it is measured on a model at least as capable as the session's; if it costs more than 2x the no-plugin arm with no better outcome, design an XS tier |
| **B2**: Six Thinking Hats against a plain step (`brainstorming-ab-*`, 4 cases) | Undecided. After a trigger fix, hats won three graders by 3 or more runs and no-hats won two by 2, at about 9% higher cost for hats; the pre-registered rule asks for a 10-run rerun (about $5). The generator script, `scripts/make-eval-variant.mjs`, is not in the repo and would need rebuilding |
| **B3**: zero-delta cases | Closed. Ablation showed no effect for the quick-path `performance` bullet and the speed-claim checklist item, so both were removed. The "no claim without a before and after number" paragraph in `performance.md` stays: it is the documented policy |

## Limits

LLM judges can be wrong: read transcripts before acting on a difference. Prompts
are synthetic, brainstorming cases are single-turn, and 3 to 5 runs detect only
large effects. A path target also runs a no-plugin arm, and that arm removes the
whole plugin, so a positive delta does not show that one quoted line is the cause;
confirm a cut by ablation first.
