# Behavioral evals

Cases live in `evals/plugin/` (46; `prompt.md` plus `graders/`, and `case.yaml`
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

**Bar.** A case passes at 2 of 3 runs. Quality graders must score higher with the
plugin than without. A failing case gets its transcript read and a ruling on
whether the skill or the grader was wrong; a grader is never loosened to pass.

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

- **No effect shown:** `executing-plans-batches-queries`, `-loads-security-on-auth-change`,
  `-holds-bar-under-pressure`, `code-review-flags-unmeasured-speed-claim`, and
  `code-review-flags-n-plus-one` score 1.00 with and without the plugin on sonnet.
  The `-hard` siblings did not change that. The first and second are kept as
  wiring checks and safety controls; they do not show an effect on the code.
  Fixture twins (`executing-plans-batches-queries-fixture`,
  `code-review-flags-n-plus-one-fixture`,
  `executing-plans-holds-bar-under-pressure-fixture`) scaffold a small project
  and grade the files with regexes instead of an LLM judge. Like B1, they need
  `--scaffold --allow-tools Write Edit Bash` and have never run here: the CLI
  refuses the Bash grant inside the tool sandbox. Run them from an unsandboxed
  terminal: `claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.66 -j 3 --max-cost-usd 5 --trust-plugin --scaffold --allow-tools Write Edit Bash --case '*-fixture' --json evals/results/<file>.json`.
- **haiku** fires `brainstorming` on 1 to 4 of 5 runs and `code-review` on "is this
  safe?" on 2 of 5 (sonnet fires reliably); accepted as a small-model limit.
- Quiet cases are expected to score 0.00 delta.

## Open measurements

| Block | Status |
|---|---|
| **B1**: is the quick path too heavy for a one-line fix? Case `executing-plans-cost-on-one-line-fix` (needs `--scaffold --allow-tools Write Edit Bash`) | Never measured: the CLI refused the Bash grant (EACCES on a credentials file, probably hidden by the tool sandbox; run it from an unsandboxed terminal). The quick path stays as written. Reopen only from a real example of it getting in the way, then design an XS tier and measure it |
| **B2**: Six Thinking Hats against a plain step (`brainstorming-ab-*`, 4 cases) | Undecided. After a trigger fix, hats won three graders by 3 or more runs and no-hats won two by 2, at about 9% higher cost for hats; the pre-registered rule asks for a 10-run rerun (about $5). The generator script, `scripts/make-eval-variant.mjs`, is not in the repo and would need rebuilding |
| **B3**: zero-delta cases | Closed. Ablation showed no effect for the quick-path `performance` bullet and the speed-claim checklist item, so both were removed. The "no claim without a before and after number" paragraph in `performance.md` stays: it is the documented policy |

## Limits

LLM judges can be wrong: read transcripts before acting on a difference. Prompts
are synthetic, brainstorming cases are single-turn, and 3 to 5 runs detect only
large effects. A path target also runs a no-plugin arm, and that arm removes the
whole plugin, so a positive delta does not show that one quoted line is the cause;
confirm a cut by ablation first.
