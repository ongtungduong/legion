# Behavioral eval log

Every run of `claude plugin eval` against this repo, newest last. Raw results
(`evals/results/`) stay out of git; this file is the record. Each run pins the
model and records the Claude Code version and cost, because trigger rates
move between versions.

**Bar** (from the 0.11.0 design): a case passes at a score of at least 0.67
(2 of 3 runs). Quality graders must score higher with the plugin than without
(positive delta). A failing case gets its transcript read before any edit,
and a ruling on whether the skill or the grader was wrong.

Command: `claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.67 --json evals/results/<file>.json`

## Runs

| Date | Claude Code | Model | Scope | Runs/case | Cost (USD) | Passed |
|---|---|---|---|---|---|---|
| 2026-11-09 | 2.1.319 | sonnet | all 6 cases (0.10.0 skills) | 3 x 2 arms | 1.35 | 4/6 |
| 2026-11-09 | 2.1.319 | sonnet | 2 failing cases, fix 1 | 3 x 2 arms | 0.49 | 1/2 |
| 2026-11-09 | 2.1.319 | sonnet | systematic-debugging case, fix 2 | 3 x 2 arms | 0.22 | 1/1 |
| 2026-11-09 | 2.1.319 | sonnet | all 6 cases after fixes | 3 x 2 arms | 1.35 | 6/6 |
| 2026-11-09 | 2.1.319 | sonnet | performance-optimization cases (Task 3) | 3 x 2 arms | 0.82 | 2/2 |
| 2026-11-09 | 2.1.319 | sonnet | writing-plans-records-security-line (Task 4) | RED 1, GREEN 3 x 2 arms | 0.78 | 1/1 |

### 2026-11-09 baseline (0.10.0 skills)

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| code-review-fires | 1.00 | 0.50 | +0.50 | pass |
| code-review-stays-quiet-on-commit-message | 1.00 | 1.00 | 0.00 | pass |
| executing-plans-fires-on-pasted-bug | 0.33 | 0.00 | +0.33 | fail: fired 3/3, but 2/3 replies gave the fix before the test |
| executing-plans-holds-bar-under-pressure | 1.00 | 1.00 | 0.00 | pass; no delta: sonnet holds the bar alone |
| router-stays-quiet-on-question | 1.00 | 1.00 | 0.00 | pass |
| systematic-debugging-fires-on-what-broke | 0.00 | 0.00 | 0.00 | fail: never fired; "What broke?" was answered as a question |

Cost: about $0.037 per run (judge included), 428 s for 36 runs at
concurrency 1.

Rulings:
- `systematic-debugging`: the skill was wrong, not the grader. The
  description promises to fire "even when the fix looks obvious", but the
  router's "questions are answered directly" line won. Fix: the router
  classifies "what broke / why does this fail" as a bug, and the
  description names that phrasing.
- `executing-plans`: the skill was wrong. The eval sandbox has no Write or
  Bash, like a pasted snippet in chat, and the skill said nothing about
  presenting the cycle without running it. Fix: a gotcha to keep the
  failing test first in the reply and list the run as unverified.
- The pressure case and the two quiet cases pass without the plugin too.
  They guard against regressions; they do not show an effect.

### 2026-11-09 fixes

| Case | Fix | With plugin | Without | Delta |
|---|---|---|---|---|
| executing-plans-fires-on-pasted-bug | 1: gotcha for sessions that cannot run code | 1.00 | 0.00 | +1.00 |
| systematic-debugging-fires-on-what-broke | 1: router and description name "what broke" | 0.33 | 0.00 | +0.33 |
| systematic-debugging-fires-on-what-broke | 2: the reproduction comes first even when it cannot run | 1.00 | 0.00 | +1.00 |

Fix 1 made the debugging skill fire (3/3), but the replies still proposed a
fix with no reproduction, breaking the skill's own rule in a session that
cannot run code. Fix 2 is the same kind of gotcha `executing-plans` got.

### 2026-11-09 all 6 cases after fixes

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| code-review-fires | 1.00 | 0.50 | +0.50 | pass |
| code-review-stays-quiet-on-commit-message | 1.00 | 1.00 | 0.00 | pass |
| executing-plans-fires-on-pasted-bug | 1.00 | 0.00 | +1.00 | pass |
| executing-plans-holds-bar-under-pressure | 1.00 | 0.33 | +0.67 | pass |
| router-stays-quiet-on-question | 1.00 | 1.00 | 0.00 | pass |
| systematic-debugging-fires-on-what-broke | 1.00 | 0.00 | +1.00 | pass |

Overall 1.00, mean delta +0.53, 410 s. The pressure case's no-plugin arm
moved from 1.00 to 0.33 between two runs with no change to it: at 3 runs a
case's score is a coarse signal.

### Estimate for the 0.11.0 suite

About 29 cases x 3 runs x 2 arms = 174 runs, at about $0.037 a run: about
$6.50 for one full run (Task 15), plus about $3 for the per-task RED and
GREEN runs before it.

### 2026-11-09 performance-optimization (Task 3)

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| performance-optimization-fires-on-slow-endpoint | 1.00 | 0.00 | +1.00 | pass |
| performance-optimization-stays-quiet-on-regression | 1.00 | 1.00 | 0.00 | pass |

Two runs, $0.29 and $0.53. In the first, the quiet case failed to load
(unquoted `: ` in its YAML frontmatter) and one judge panel split 1-2 on a
correct reply (batched query, a query-count guard, gains labelled potential
impact). Ruling: the grader was wrong. It now says that a proposed budget or
a query count read from the code is not a speed claim; a stated speedup with
no measurement still fails.

### 2026-11-09 writing-plans Security and Performance lines (Task 4)

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| writing-plans-records-security-line | 1.00 | 0.00 | +1.00 | pass (RED before the change: both line graders failed) |
