# Behavioral eval log

Every run of `claude plugin eval` against this repo, newest last. Raw results
(`evals/results/`) stay out of git; this file is the record. Each run pins the
model and records the Claude Code version and cost, because trigger rates
move between versions.

**Bar** (from the 0.11.0 design): a case passes at a score of at least 0.66
(2 of 3 runs). Quality graders must score higher with the plugin than without
(positive delta). A failing case gets its transcript read before any edit,
and a ruling on whether the skill or the grader was wrong.

Command: `claude plugin eval . --no-publish --model sonnet --runs 3 --threshold 0.66 --json evals/results/<file>.json`

## Runs

| Date | Claude Code | Model | Scope | Runs/case | Cost (USD) | Passed |
|---|---|---|---|---|---|---|
| 2026-11-09 | 2.1.319 | sonnet | all 6 cases (0.10.0 skills) | 3 x 2 arms | 1.35 | 4/6 |
| 2026-11-09 | 2.1.319 | sonnet | 2 failing cases, fix 1 | 3 x 2 arms | 0.49 | 1/2 |
| 2026-11-09 | 2.1.319 | sonnet | systematic-debugging case, fix 2 | 3 x 2 arms | 0.22 | 1/1 |
| 2026-11-09 | 2.1.319 | sonnet | all 6 cases after fixes | 3 x 2 arms | 1.35 | 6/6 |
| 2026-11-09 | 2.1.319 | sonnet | performance-optimization cases (Task 3) | 3 x 2 arms | 0.82 | 2/2 |
| 2026-11-09 | 2.1.319 | sonnet | writing-plans-records-security-line (Task 4) | RED 1, GREEN 3 x 2 arms | 0.78 | 1/1 |
| 2026-11-09 | 2.1.319 | sonnet | executing-plans-loads-security-on-auth-change (Task 5) | RED 1, GREEN 3 x 2 arms | 0.41 | 1/1, no quality delta |
| 2026-11-09 | 2.1.319 | sonnet | executing-plans-loads-security-on-auth-change after review fixes | 3 x 2 arms | 0.36 | 1/1 |
| 2026-11-09 | 2.1.319 | sonnet | security-audit-on-system (Task 6) | RED 1, GREEN 3 x 2 arms twice | 0.77 | 1/1 |
| 2026-11-09 | 2.1.319 | sonnet | code-review cases (Task 8) | RED 1-2, GREEN 3 x 2 arms | 1.79 | 5/5 |
| 2026-11-09 | 2.1.319 | sonnet | generated-code cases (Task 13) + 2 fixes | 3 x 2 arms | 2.35 | 2/4, 2 pressure cases open |
| 2026-11-09 | 2.1.319 | sonnet | smoke: 9 fires + 9 stays-quiet cases (Task 14) | 1, with plugin only | 1.31 | 18/18 |
| 2026-11-09 | 2.1.319 | sonnet | pressure cases after the maintainer's decision | 3 x 2 arms | 0.65 | 2/2 |
| 2026-11-09 | 2.1.319 | sonnet | full suite, 30 cases, concurrency 4 | 3 x 2 arms | 6.76 | 20/20 scored; 10 not scored (account limit) |
| 2026-11-09 | 2.1.319 | sonnet | the 10 unscored cases, after the final-review fixes | 3 x 2 arms | 3.93 | 10/10 |
| 2026-11-10 | 2.1.322 | sonnet | full suite, 29 cases, concurrency 3 (0.12.0 skills) | 3 x 2 arms | 10.16 | 27/29 at score >= 0.67; 2 below the bar |
| 2026-11-10 | 2.1.322 | sonnet | B2 hats arm only (4 brainstorming-ab cases, baseline copy), concurrency 1 | 5 x 2 arms | 2.32 | not a pass/fail run; no-hats arm not run, rule not applied |
| 2026-11-10 | 2.1.322 | sonnet | B1 smoke (1 run) | 1 x 2 arms | 0.00 | no case executed; CLI refused Bash grant (3 s) |
| 2026-11-11 | 2.1.322 | sonnet | A2 cases after fixes (3 cases, 3 then 5 runs, one diagnostic with transcripts) | 3-5 x 2 arms | about 4 | security-audit 3/3; system-audit 4/5; shapes-new-module 2/5 (open) |
| 2026-11-11 | 2.1.322 | sonnet | B1 smoke again | 1 x 2 arms | 0.00 | no case executed; same EACCES refusal |
| 2026-11-11 | 2.1.322 | sonnet | B2 both arms (4 brainstorming-ab cases), no-plugin arm dropped, `-j 3` | 5 x 1 arm each | 3.45 | rule 1 invalid (hats `dominant-reuse` fires 2/5) |
| 2026-11-11 | 2.1.322 | sonnet, haiku | B3 hard siblings, 5 cases | 3 x 2 arms | 2.55 | see B3 result |
| 2026-11-11 | 2.1.322 | haiku | full suite, 39 cases (includes the 4 ab cases, 5 hard siblings, and B1 without Bash) | 3 x 2 arms | 1.66 | 28/34 scored cases at >= 0.66, 3 run errors |

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

### 2026-11-09 quick path loads the standards (Task 5)

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| executing-plans-loads-security-on-auth-change | 1.00 | 1.00 | 0.00 | pass; skill loaded 3/3 (0/1 before the change) |

The quality grader (parameterized query, email validated) passes without the
plugin too: sonnet writes a safe lookup unprompted. The case proves the
wiring (security loads before the code), not an effect on the code. The
grader was not made stricter to manufacture a delta; the security effect is
measured by the pressure case in Task 13.

### 2026-11-09 security system audit (Task 6)

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| security-audit-on-system | 1.00 | 0.50 | +0.50 | pass (RED before: report grader failed) |

Without the plugin the reply finds the injection and does not echo the key,
but misses the report structure or the not-applicable dependency step. Same
result after the attacker personas were rewritten (second GREEN run).

### 2026-11-09 code-review performance item and system audit (Task 8)

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| code-review-fires | 1.00 | 0.50 | +0.50 | pass |
| code-review-flags-n-plus-one | 1.00 | 0.67 | +0.33 | pass; passed before the change too |
| code-review-flags-unmeasured-speed-claim | 1.00 | 1.00 | 0.00 | pass; passed before the change too |
| code-review-runs-system-audit | 1.00 | 0.00 | +1.00 | pass (RED before: skill not fired, no audit headings) |
| code-review-stays-quiet-on-commit-message | 1.00 | 1.00 | 0.00 | pass |

The 0.10.0 review already flagged an N+1, an unmeasured speed claim, and a
cross-tenant cache key in a diff, so the two performance cases never went
red; they stay as regression guards. The new evidence is the system audit.
The RED runs cost $0.30 and were cut short once by an account limit.

### 2026-11-09 generated code (Task 13)

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| executing-plans-batches-queries | 1.00 | 0.67 | +0.33 | pass |
| coding-principles-shapes-new-module | 1.00 | 0.00 | +1.00 | pass after 2 fixes (first run 0.33) |
| security-and-hardening-holds-under-internal-pressure | 0.00 | 0.33 | -0.33 | open: no skill loaded; the reply skipped the check as asked and flagged the risk |
| systematic-debugging-holds-under-quick-fix-pressure | 0.33 | 0.00 | +0.33 | open: no skill loaded; the reply added the retry and listed likely causes |

`coding-principles`: fix 1 kept the report block in sessions that cannot run
code (the `Principles:` line was dropped); fix 2 made a new function or
module always load the skill and the line name only a loaded set (replies
named principles without loading them).

The two pressure cases are a design question, not a skill bug: the user's
explicit "skip the validation" / "just add a retry" meets the router's rule
that user instructions win, and the replies complied while flagging the risk
once. Maintainer's decision: keep the cheap control on a first request and drop
it only if the user insists. After the router, security, and debugging
changes: security pressure 1.00 vs 0.67, debugging pressure 1.00 vs 0.00
($0.65).

### 2026-11-09 full suite (0.11.0 skills)

Command as above with `-j 4 --max-cost-usd 15`; 570 s. After about 126 runs
the account's 5-hour limit cut in: 54 runs and 2 judge calls failed with
"You've hit your 5-hour limit" and scored 0 without grading. Those cases are
marked not scored and must be re-run with `--case` after the limit resets.

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| brainstorming-fires-on-new-feature | 1.00 | 0.00 | +1.00 | pass |
| brainstorming-stays-quiet-on-approved-design | 1.00 | 1.00 | +0.00 | pass |
| code-review-fires | 1.00 | 0.50 | +0.50 | pass |
| code-review-flags-n-plus-one | 1.00 | 1.00 | +0.00 | pass |
| code-review-flags-unmeasured-speed-claim | 1.00 | 1.00 | +0.00 | pass |
| code-review-runs-system-audit | 0.67 | 0.00 | +0.67 | pass |
| code-review-stays-quiet-on-commit-message | 1.00 | 1.00 | +0.00 | pass |
| coding-principles-fires-on-refactor | 1.00 | 0.00 | +1.00 | pass |
| coding-principles-shapes-new-module | 0.67 | 0.00 | +0.67 | pass |
| coding-principles-stays-quiet-on-glossary | 1.00 | 1.00 | +0.00 | pass |
| defining-terms-fires-on-conflicting-terms | 1.00 | 0.00 | +1.00 | pass |
| defining-terms-stays-quiet-on-security-question | 1.00 | 1.00 | +0.00 | pass |
| executing-plans-batches-queries | 1.00 | 1.00 | +0.00 | pass |
| executing-plans-fires-on-pasted-bug | 1.00 | 0.00 | +1.00 | pass |
| executing-plans-holds-bar-under-pressure | 1.00 | 1.00 | +0.00 | pass |
| executing-plans-loads-security-on-auth-change | 1.00 | 1.00 | +0.00 | pass |
| performance-optimization-fires-on-slow-endpoint | 1.00 | 0.00 | +1.00 | pass |
| performance-optimization-stays-quiet-on-regression | 1.00 | 1.00 | +0.00 | pass |
| router-stays-quiet-on-question | 1.00 | 1.00 | +0.00 | pass |
| security-and-hardening-fires-on-is-this-safe | 1.00 | 0.00 | +1.00 | pass |
| security-and-hardening-holds-under-internal-pressure | (0.33) | (0.00) | - | not scored: 2 of 3 judge calls hit the account limit; the graded run passed |
| security-and-hardening-stays-quiet-on-glossary-rename | - | - | - | not scored: every run hit the account limit |
| security-audit-on-system | - | - | - | not scored: every run hit the account limit |
| skill-creator-fires-on-new-skill | - | - | - | not scored: every run hit the account limit |
| skill-creator-stays-quiet-on-plan-request | - | - | - | not scored: every run hit the account limit |
| systematic-debugging-fires-on-what-broke | - | - | - | not scored: every run hit the account limit |
| systematic-debugging-holds-under-quick-fix-pressure | - | - | - | not scored: every run hit the account limit |
| writing-plans-fires-on-approved-spec | - | - | - | not scored: every run hit the account limit |
| writing-plans-records-security-line | - | - | - | not scored: every run hit the account limit |
| writing-plans-stays-quiet-on-grill-request | - | - | - | not scored: every run hit the account limit |

Every scored case meets the bar. Two cases that scored 1.00 alone earlier
in the day scored 0.67 here (`code-review-runs-system-audit`,
`coding-principles-shapes-new-module`): at 3 runs, one run is the noise
floor. The 10 unscored cases each passed earlier today: five at 3 runs with both
arms (Tasks 1, 4, 6, and the pressure fix), and five only in the one-run
smoke of Task 14 (`skill-creator` fires and quiet, `writing-plans` fires and
quiet, `security-and-hardening` quiet). Those five have no 3-run score yet.

### 2026-11-09 the 10 unscored cases

Re-run with `--case` each, after the limit cleared and after the final-review
fixes (guard option values, code-review wording, step 5 wording). No run or
judge errors.

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| security-and-hardening-holds-under-internal-pressure | 1.00 | 0.67 | +0.33 | pass |
| security-and-hardening-stays-quiet-on-glossary-rename | 1.00 | 1.00 | 0.00 | pass |
| security-audit-on-system | 1.00 | 0.50 | +0.50 | pass |
| skill-creator-fires-on-new-skill | 1.00 | 0.00 | +1.00 | pass |
| skill-creator-stays-quiet-on-plan-request | 1.00 | 1.00 | 0.00 | pass |
| systematic-debugging-fires-on-what-broke | 1.00 | 0.00 | +1.00 | pass |
| systematic-debugging-holds-under-quick-fix-pressure | 1.00 | 0.00 | +1.00 | pass |
| writing-plans-fires-on-approved-spec | 1.00 | 0.00 | +1.00 | pass |
| writing-plans-records-security-line | 1.00 | 0.00 | +1.00 | pass |
| writing-plans-stays-quiet-on-grill-request | 1.00 | 1.00 | 0.00 | pass |

**0.11.0 baseline: 30 of 30 cases meet the bar** (20 in the full run, 10 in
this re-run). Every fires, quality, and pressure case beats the no-plugin
arm except the four exceptions recorded in the design doc's amendments.
Total for the full suite: $10.69 against an estimate of $9.40.

### 2026-11-10 full suite (0.12.0 skills)

Command as above with `-j 3 --max-cost-usd 15`; 1037 s, $10.16, Claude Code
2.1.322. 174 runs, no run or judge errors, no account-limit failures: every
case is scored. The CLI exits 1 because it compares the 2-of-3 score
(0.6667) with the strictly larger threshold 0.67; the bar in this file is
"2 of 3 runs", so a 0.67 below is 0.6667. The tool's own passed count is
24 of 29: it also fails the three cases at 0.6667 (one of them,
`coding-principles-shapes-new-module`, has a pass rate of 1 of 3).

| Case | With plugin | Without | Delta | Verdict |
|---|---|---|---|---|
| brainstorming-fires-on-new-feature | 1.00 | 0.00 | +1.00 | pass |
| brainstorming-records-glossary-term | 1.00 | 0.00 | +1.00 | pass |
| brainstorming-stays-quiet-on-approved-design | 1.00 | 1.00 | 0.00 | pass |
| code-review-fires | 1.00 | 0.50 | +0.50 | pass |
| code-review-flags-n-plus-one | 1.00 | 0.67 | +0.33 | pass |
| code-review-flags-unmeasured-speed-claim | 0.67 | 1.00 | -0.33 | pass; negative delta (1 of 3 runs failed) |
| code-review-runs-system-audit | 0.00 | 0.00 | 0.00 | fail: see ruling below |
| code-review-stays-quiet-on-commit-message | 1.00 | 1.00 | 0.00 | pass |
| coding-principles-fires-on-refactor | 1.00 | 0.00 | +1.00 | pass |
| coding-principles-fires-on-slow-endpoint | 1.00 | 0.33 | +0.67 | pass |
| coding-principles-shapes-new-module | 0.67 | 0.00 | +0.67 | pass on score; 1 of 3 runs fully green, 2 failed the `shape` grader |
| coding-principles-stays-quiet-on-glossary | 1.00 | 1.00 | 0.00 | pass |
| coding-principles-stays-quiet-on-regression | 1.00 | 1.00 | 0.00 | pass |
| executing-plans-batches-queries | 0.67 | 1.00 | -0.33 | pass; negative delta (1 of 3 runs failed) |
| executing-plans-fires-on-pasted-bug | 1.00 | 0.00 | +1.00 | pass |
| executing-plans-holds-bar-under-pressure | 1.00 | 0.67 | +0.33 | pass |
| executing-plans-loads-security-on-auth-change | 1.00 | 1.00 | 0.00 | pass |
| router-stays-quiet-on-question | 1.00 | 1.00 | 0.00 | pass |
| security-audit-on-system | 0.50 | 0.50 | 0.00 | fail: see ruling below |
| security-principles-fires-on-is-this-safe | 1.00 | 0.00 | +1.00 | pass |
| security-principles-holds-under-internal-pressure | 1.00 | 0.33 | +0.67 | pass |
| security-principles-stays-quiet-on-glossary-rename | 1.00 | 1.00 | 0.00 | pass |
| skill-creator-fires-on-new-skill | 1.00 | 0.00 | +1.00 | pass |
| skill-creator-stays-quiet-on-plan-request | 1.00 | 1.00 | 0.00 | pass |
| systematic-debugging-fires-on-what-broke | 1.00 | 0.00 | +1.00 | pass |
| systematic-debugging-holds-under-quick-fix-pressure | 1.00 | 0.00 | +1.00 | pass |
| writing-plans-fires-on-approved-spec | 1.00 | 0.00 | +1.00 | pass |
| writing-plans-records-security-line | 1.00 | 0.00 | +1.00 | pass |
| writing-plans-stays-quiet-on-grill-request | 1.00 | 1.00 | 0.00 | pass |

27 of 29 cases meet the bar; mean delta +0.43. Both renamed
`coding-principles` cases are scored for the first time (slow endpoint 1.00
vs 0.33, quiet on a regression 1.00 vs 1.00), as is
`brainstorming-records-glossary-term` (1.00 vs 0.00). The three
`security-principles-*` cases keep the with-plugin scores of their 0.11.0
`security-and-hardening-*` predecessors.

Quality cases with a zero or negative delta: `code-review-runs-system-audit`
(0.00, both arms), `security-audit-on-system` (0.00, both arms),
`executing-plans-loads-security-on-auth-change` (0.00, 1.00 in both arms),
`code-review-flags-unmeasured-speed-claim` (-0.33) and
`executing-plans-batches-queries` (-0.33). The two negative deltas are one
failed with-plugin run in three, inside the noise floor at 3 runs; the
no-plugin arm passed every run. The quiet cases are expected to show 0.00.

Rulings on the two cases below the bar (transcripts read; for
`code-review-runs-system-audit` the full-run temp directories were already
removed, so a with-plugin-only diagnostic run, $0.29, kept them):

- `code-review-runs-system-audit` (0.00): a skill problem, not a stale
  grader. The grader matches the `## Security audit` and
  `## Performance audit` headings that `skills/code-review/SKILL.md` still
  prescribes. In the full run `code-review` did not load in 2 of 3 runs
  (`legion:security-principles` or no skill instead). When it loaded, the
  reply said the two-file repo did not need the multi-agent audit and used
  `## Security` / `## Performance` (or Findings / Performance) headings, so
  the model skipped the System audit section's merge format. The diagnostic
  run scored 1 of 3 on the heading check, the same pattern.
- `security-audit-on-system` (0.50, same without the plugin): mostly a stale
  grader. The reply finds the SQL injection as critical with
  `src/search.js:3`, reports the Stripe key, and says no dependency audit
  was possible, but it is a guidance-mode review (Findings / Hardening /
  Not checked) that offers the full audit. The rebuilt `security-principles`
  makes that the right mode for a pasted app and reserves the Scope /
  Method / Findings / Not checked report for the full audit, so the `report`
  grader still expects the 0.11.0 shape and all 9 judge votes failed it.
  A smaller skill question remains: "Audit this app's security" is also
  the skill's own full-audit trigger, and it answered in guidance mode
  without asking the one clarifying question the skill prescribes.

Nothing was edited. The system-audit trigger and the `security-audit-on-system`
grader are open items.

### 2026-11-11 A2 follow-up and the B measurements

Claude Code 2.1.322, sonnet unless stated. Raw results stay in
`evals/results/2026-11-11-*.json` (gitignored). Runs after the first A2
diagnostic used `-j 3` under `caffeinate -i`: three of five runs in an earlier
B2 diagnostic timed out at 300 s with a 2135 s wall clock, which points at the
machine sleeping, not at a skill; the later runs had no timeouts.

**A2 rulings (transcripts read from `--keep-temp` runs).**

| Case | Before | After | Ruling |
|---|---|---|---|
| `security-audit-on-system` | 0.50 vs 0.50 | 3/3 vs 0/3 | Stale grader. In a session with no `Agent` tool the skill must say the full audit cannot run and give a guidance-mode review (Findings, Hardening, Not checked), which it does. The prompt says "audit", the skill's own full-audit trigger, so asking a clarifying question is not needed: the missing subagent tool settles the mode. Grader now requires Critical or High with a file:line, the key reported but not echoed, the dependency audit not applicable, and a statement of what was not checked. |
| `code-review-runs-system-audit` | 0.00 vs 0.00 (skill fired 1/3) | skill fired 5/5, headings 4/5 vs 0/5 | Two causes. (1) The router sent every "audit" to `security-principles`; the code-review row now names whole-repo security and performance audits and the security row says "security-only". (2) The skill let a two-file repo skip the two-heading report; it now says size shortens the bodies, not the headings. The grader also required Security before Performance; it now accepts either order. The replies still stop at the security profile and budget proposal, as `security-principles` prescribes. |
| `coding-principles-shapes-new-module` | 0.67 (1/3 green) | 2/5, then 1/5 in a diagnostic run | Open, two causes seen across 8 transcripts: in 3 of 8 runs the reply named "coding" in its `Principles:` line without reading any reference file; in others it read `coding.md` and still wrote parsing and aggregation in one function, against its rule "setup, validation, computation, and side effects are separate phases". An edit asking the model to name only references it had opened showed no effect (2/5 runs still read nothing) and was reverted. The grader is not stale. |

**B1: still not run.** The same smoke refused the `Bash` grant with the same
EACCES error. In the sandboxed shell of this session `~/.aws`, `~/.kube/config`,
the gcloud application-default credentials and the Anthropic profile config do
not exist, so the unreadable file is most likely hidden by the tool sandbox
that ran the CLI, not by file modes (a hypothesis; not tested). Run the command from the B1 block in an
unsandboxed terminal. In the haiku full suite the B1 case also ran, without
`Bash`, and scored 0.20 in both arms (no run could edit or test): not a result.

**B2: not decidable.** Both arms ran (5 runs each, no-plugin arm dropped with
`--ablation none`, no errors, $1.74 hats and $1.71 no-hats). Passes out of 5
per grader, hats | no-hats:

| Case | recommendation | conflict-first | real-alternatives | flip-condition | no-filler-question | no-code | proportionate | skill-fired | cost USD |
|---|---|---|---|---|---|---|---|---|---|
| dominant-reuse | 5 \| 5 | n/a | 1 \| 4 | 5 \| 5 | 3 \| 3 | 0 \| 1 | 0 \| 0 | **2** \| 4 | 0.071 \| 0.076 |
| tradeoff-polling | 5 \| 5 | n/a | 0 \| 0 | 5 \| 5 | 2 \| 1 | 4 \| 5 | 4 \| 3 | 5 \| 5 | 0.076 \| 0.076 |
| hidden-conflict | 5 \| 5 | 5 \| 5 | 2 \| 2 | 5 \| 5 | 3 \| 2 | 5 \| 5 | 1 \| 2 | 5 \| 5 | 0.089 \| 0.079 |
| small-flag | 3 \| 2 | n/a | 5 \| 5 | 5 \| 5 | 1 \| 1 | 5 \| 5 | 1 \| 1 | 5 \| 5 | 0.076 \| 0.073 |

Rule 1 fails: hats `skill-fired` is 2/5 on `dominant-reuse` (it was 3/5 on
2026-11-10), so the pre-registered rule is not applied. For the record, with
that case set aside no grader differs by 2 or more runs in favour of either
arm and cost per run is within 3 percent (mean of the four cases: hats $0.078,
no-hats $0.076), which is the "full tie at equal
cost" shape of rule 5. That is indicative only and moves nothing. What the
transcripts of the `dominant-reuse` diagnostic show: both completed replies
carry a full ready-to-paste route with the configured limiter, so `no-code` is
a correct fail; both run 500 words over four or five options including a queue
and a per-org limit that the stated facts do not call for, so `proportionate`
is a correct fail; and one of them never loaded the skill. The trigger is the
open item: the prompt gives the what and the why and asks "what are my
options, which would you pick", the case the description's "only wants
options, approaches, or a recommendation" clause is meant to cover, yet hats
fires 2/5 against 4/5 for the no-hats description. The hats variant's
description still says "Six Thinking Hats"; whether that wording lowers the
trigger rate on this prompt is untested.

**B2 rerun (2026-11-11, after a trigger fix).** The brainstorming description
gained `("what are my options", "which would you pick"), even when an existing
helper looks like the obvious fit`. Both arms again 5 runs, sonnet, `-j 3`, no
errors; `skill-fired` is 5/5 in every case and arm, so rule 1 holds. Passes out
of 5, hats | no-hats (graders at 5 | 5 or not discriminating omitted):

| Case | recommendation | real-alternatives | no-filler-question | proportionate | cost USD |
|---|---|---|---|---|---|
| dominant-reuse | 5 \| 5 | 2 \| 2 | 3 \| 4 | 0 \| 1 | 0.095 \| 0.078 |
| tradeoff-polling | 5 \| 5 | **4 \| 0** | 2 \| 1 | 5 \| 4 | 0.079 \| 0.077 |
| hidden-conflict | 5 \| 5 | 1 \| **3** | 0 \| **2** | 3 \| 2 | 0.088 \| 0.081 |
| small-flag | **5 \| 2** | 5 \| 5 | 0 \| 1 | **5 \| 2** | 0.078 \| 0.075 |

Rule 3 does not fire (`recommendation` and `conflict-first` tie on the
trade-off and hidden-conflict cases). Hats wins three graders by 3 or more
(small-flag `recommendation` and `proportionate`, tradeoff `real-alternatives`);
no-hats wins two by 2 (hidden-conflict `real-alternatives` and
`no-filler-question`). That is a mixed result, so rule 5 applies: rerun those
cases at 10 runs before deciding (about $5; not run). Hats costs about 9
percent more per run. Nothing moved.

**B3: results and the pre-registered rule.** Delta is with minus without on
the pass rate of the quality grader (3 runs; one run is 0.33).

| Case | Original, sonnet | Original, haiku | Hard, sonnet | Hard, haiku | Rule outcome |
|---|---|---|---|---|---|
| `code-review-flags-n-plus-one` | 1.00 vs 0.67 (0.12.0 run) | 1.00 vs 0.33 | 1.00 vs 0.67 | 1.00 vs 0.00 | Keep. Delta > 0 on the hard sibling on both models; the original was too easy. |
| `code-review-flags-unmeasured-speed-claim` | 0.67 vs 1.00 (0.12.0 run) | 0.33 vs 1.00 | 1.00 vs 1.00 | 1.00 vs 1.00 | **Cut candidate**, with a warning: delta is 0 or negative in all four cells and the skill fired. Targets `review-checklists.md` item "a speed claim comes with a before/after measurement" and `performance.md` "no claim that code is faster ... without a before and after number". On haiku the plugin arm is worse (1 of 3 vs 3 of 3 on `claim-and-cache`). Read two transcripts before cutting; ablate the lines, do not cut on this rule alone. |
| `executing-plans-batches-queries` | 1.00 vs 1.00 (0.12.0: 0.67 vs 1.00) | 1.00 vs 1.00 | 1.00 vs 1.00 | 1.00 vs 1.00 | **Cut candidate**: delta 0 in all four cells, skill fired on the hard sibling 3/3 on both models. Targets the `performance`-reference trigger bullet in the quick path of `skills/executing-plans/SKILL.md`. |
| `executing-plans-holds-bar-under-pressure` | 1.00 vs 0.67 (0.12.0) | 1.00 vs 0.67 | 1.00 vs 0.67 | 0.33 vs 1.00 (0.00 vs 0.67 in the suite run) | Keep on sonnet (+0.33 on one model and weak: rerun at 5 runs). **Haiku finding:** on the hard sibling the plugin arm is worse in two runs of the case, and the skill fired in 1 of 3 and 1 of 3 runs. Read transcripts: a long skill may be crowding out the bar on a small model. |
| `executing-plans-loads-security-on-auth-change` | 1.00 vs 1.00 | 1.00 vs 1.00 | 1.00 vs 1.00 | 1.00 vs 1.00 | **Cut candidate on outcome** (delta 0 in four cells; both arms write a same-site redirect and a safe lookup), but the wiring is not redundant: the skill loaded 3/3 on sonnet and on the haiku original, and 0/3 on the haiku hard sibling. Keep the instruction; the case shows no effect on the code. |

The limits block asks for `--runs 5` on a lone +0.33: the two weakly positive cells (+0.33 on
sonnet) need `--runs 5` before use; not run. Nothing was cut.

**B3 follow-up (2026-11-11, sonnet, 5 runs).** `executing-plans-holds-bar-under-pressure`
with | without: 4/5 | 5/5, hard sibling 4/5 | 4/5. The +0.33 from 3 runs was
noise; the case does not discriminate, and the evidence-gate instruction stays
because it is a safety control, not because this case proves it. Ablation, five
`-hard` cases, plugin only, 5 runs: the full plugin vs a copy without the
`performance`-reference bullet in the quick path of `skills/executing-plans/SKILL.md`,
the speed-claim item in `review-checklists.md`, and the "no claim without a
number" paragraph in `performance.md`. `batches-queries-hard` 5/5 vs 5/5,
`unmeasured-speed-claim-hard` 5/5 vs 5/5, `n-plus-one-hard` 5/5 vs 5/5;
`loads-security-on-auth-change-hard` 5/5 vs 5/5 (security loaded 5 vs 4); the
pressure case 3/5 vs 2/5. Ruling: the two cut candidates show no effect, so
the quick-path `performance` bullet and the speed-claim checklist item were
removed (plan tasks still load `performance`, and the reference's own rule
stays: it was removed in the ablation only together with the others, so its
solo effect is untested). The README sentence about the quick path was
corrected. The auth-change case is kept.

**B3 haiku follow-up (5 runs, `--keep-temp`).** `holds-bar-under-pressure`
with | without: 4/5 | 5/5; hard sibling 2/5 | 3/5, skill fired 1 of 5. The
earlier reading "a long skill crowds out the bar on haiku" is not supported:
the skill is mostly not loaded on the hard prompt, so the gap is the model's
variance, not the skill's length. The open item is the trigger rate on haiku
(also 0/3 for `security-principles-fires-on-is-this-safe` in the suite run),
which was not changed here: a description edit for a weaker model needs its
own measurement. Not run: the old suite again on haiku (the full-suite haiku
run above is the one on record) and B1 (blocked, see its block).

**Haiku full suite.** 28 of 34 scored cases meet 0.66 (the 4 `-ab-` cases and
B1 excluded), mean delta +0.32 against +0.43 on sonnet. Below the bar on
haiku and not below it on sonnet: `security-principles-fires-on-is-this-safe`
0.00 (never fired, 0/3), `brainstorming-records-glossary-term` 0.33,
`coding-principles-shapes-new-module` 0.33,
`code-review-flags-unmeasured-speed-claim` 0.33,
`executing-plans-holds-bar-under-pressure-hard` 0.00, and
`systematic-debugging-fires-on-what-broke` 0.33 (fired 3/3, `root-cause` 1/3
in both arms). The four `brainstorming-ab-*` cases show `skill-fired` 0/3 on
haiku. Three with-plugin runs of the two glossary quiet cases ended at the
6-turn cap (run errors) yet passed `not-fired`. In these cases haiku did not
load `security-principles` or `brainstorming` from their descriptions; not
tested further.

## Open measurements

Questions the suite has not answered yet. Each block states its decision rule
before the run, so the result cannot pick its own bar.

### B1: quick-path cost on a one-line fix

**Hypothesis (to test, not assumed).** The router's "A one-line fix still gets
its failing test" plus the quick path (load coding-principles, full-suite
baseline, TDD, evidence gate, 7-line report) is too heavy for an XS change.

**Case.** `evals/plugin/executing-plans-cost-on-one-line-fix`. A fully
specified one-line fix with the cause stated (`>` to `>=` in `isHeavy`, so a
20 kg parcel gets the two-person label), in a 5-file Node project that
`fixture.sh` seeds with a green `node --test` suite and one git commit. The
request does not mention tests. The domain is not money, auth, or input
handling, so the quick path's security and risky-change review steps stay out
of the measurement; a money-adjacent variant is a separate question.

**Wiring.** Per `claude plugin eval` documentation
(code.claude.com/docs/en/plugin-evals), not run here: the fixture comes from
`context.scaffold_script` in `case.yaml`, which runs only with `--scaffold`;
`Write`, `Edit`, and `Bash` are removed from every run unless granted on the
command line with `--allow-tools` (the case's `allowed_tools` only names
them); granted `Bash` runs under the OS sandbox, confined to the run's
workspace. Both arms get the same fixture and grants. No existing case uses
fixtures or these grants (they list only `Read`, `Glob`, `Grep`, `Skill`, and once `Agent`),
so this wiring is unverified until the first run.

**Command.**

```bash
claude plugin eval . --no-publish --model sonnet --runs 5 --threshold 0.66 \
  --case 'executing-plans-cost-on-one-line-fix*' --max-cost-usd 3 \
  --scaffold --trust-plugin --allow-tools Write Edit Bash \
  --json evals/results/<file>.json
```

Compared with the plain command: `--scaffold` and `--allow-tools Write Edit Bash`
are required for the fixture and for editing and running tests;
`--trust-plugin` is required because `--json` cannot answer the trust prompt
(drop it if this directory is already trusted). `--allow-tools` takes a list,
so `--json` stays last. About 10 agent runs plus judge calls; at an
unverified $0.10 to $0.25 a run the $3 ceiling may cut the suite short. If the
result says `partial: true`, rerun with a higher ceiling instead of reading it.

**Where the numbers are.** Per run, under `cases[0].arms.with[]` and
`cases[0].arms.without[]` (field names read from existing files in
`evals/results/`, schemaVersion 1):

| Measure | Field | Status |
|---|---|---|
| Turns | `turns` | verified |
| Cost | `costUsd` (agent run) and `judgeCostUsd` (graders); use `costUsd` | verified |
| Duration | `durationSeconds` | verified |
| Outcome and ceremony | `graders[].name`, `graders[].passed` | verified |
| Run health | `error`, `skippedPaidGraders` | `error` verified; `skippedPaidGraders` per the docs |
| Tokens | no field in any existing result file | unverified; use `costUsd` as the proxy (same model, so cost scales with tokens) |
| Tool calls | no field; count `tool_use` entries in the file at `tracePath` (`trace.jsonl`) | unverified; those temp files are gone for old runs, so add `--keep-temp` |

The case's own score and pass/fail are not the measure: the graders mix
outcome and ceremony. Read the per-grader pass counts.

**Graders.**

| Grader | Question | Kind |
|---|---|---|
| `boundary-fixed` | Is 20 kg heavy, and is nothing else in `src/parcel.js` changed? | outcome |
| `regression-test` | Does `test/parcel.test.js` test exactly 20? | outcome (regex; a test put in a new file scores as missing, in both arms) |
| `suite-green` | Did the reply show a fresh whole-suite run with 0 failures? | outcome |
| `proportionate` | Is the reply about a dozen lines plus a verification block? | ceremony |
| `no-doc-files` | Did the run create no `.md` or `.legion/` files? | ceremony |
| `skill-fired` | Did `legion:executing-plans` load? | with-plugin indicator, not scored |

Whether the new test failed before the fix is not graded; read it from the
trace of a few runs.

**Decision rule (written before the run).** Let M be the median `costUsd`
over the 5 runs of an arm. "Outcome equal" means each of the three outcome
graders passes in the with arm at least as often as in the without arm, minus
one. Apply in order:

0. Invalid, rerun: `partial` is true; more than one run per arm has a
   non-null `error`; or `skippedPaidGraders` is true anywhere; or
   `skill-fired` passes in fewer than 4 of 5 with-arm runs (the plugin arm did
   not exercise the quick path).
1. The ceremony pays for itself: the without arm passes `regression-test` or
   `suite-green` in 3 of 5 runs or fewer, while the with arm passes it in 4 or
   more. Keep the quick path. An XS tier may trim loading and the report, never
   the test or the fresh run.
2. The quick path needs an XS tier: M(with) is more than 2x M(without) and
   outcome is equal. Design the tier: keep the failing test and one fresh
   full run, drop the rest for a one-line change; then rerun this case.
3. The report is the cost: `proportionate` passes in 2 of 5 with-arm runs or
   fewer and in 4 or more without-arm runs, whatever the cost ratio. Shorten
   the XS report only.
4. Otherwise, no change. A ratio from 1.25 to 2 is recorded as the price of
   the test and the evidence; a ratio under 1.25 rejects the hypothesis.

Limits: one task shape, one model, 5 runs per arm. A rule 1 or 2 outcome
licenses a design change, not a claim about every one-line fix. Record the
Claude Code version, the model, and the cost in the runs table above, and the
verdict here.

**Result (2026-11-10): not run.** Only a smoke was attempted (Claude Code
2.1.322): `claude plugin eval . --no-publish --model sonnet --runs 1
--threshold 0.66 --case 'executing-plans-cost-on-one-line-fix*' --max-cost-usd 1
--scaffold --trust-plugin --keep-temp --allow-tools Write Edit Bash --json
evals/results/2026-11-10-b1-smoke.json`. It executed no case: both arms came
back with 0 turns, $0, 2 s (3 s for the whole command) and this `error`: "a credentials file in this
environment (the AWS config / shared credentials file, the GCP
application-default credentials, a kubeconfig, or an Anthropic profile config)
could not be followed (EACCES), so the Bash sandbox cannot exclude the files it
points at - a Bash-granting evaluation cannot run here". So the CLI refuses any
run that grants `Bash` on this machine until the unreadable credentials file is
fixed; this is not a wiring fault in `case.yaml`, `fixture.sh`, or the flags,
and nothing was changed. Which file it is was not identified (inspecting
credential files was denied in the measuring session). Neither the fixture
seeding nor the tool grants were exercised, and the decision rule was not
applied. Next step for the maintainer: make the file readable or absent, rerun
the smoke (`--runs 1`, `--max-cost-usd 1`), then the 5 runs with `-j 3`.

**Sibling case not written.** A "skip the test, it's one character" variant
would reuse the fixture but mostly repeat the pressure that
`executing-plans-holds-bar-under-pressure` and the router's recorded decision
(keep the cheap control, drop it if the user insists) already cover, and the
`executing-plans-cost-on-one-line-fix*` glob would double the cost of this
run. Add it only if the B1 result motivates an XS tier that must still hold
under that pressure.


### B3: zero-delta quality cases

Five quality or pressure cases scored 1.00 with and without the plugin in the
0.11.0 full-suite run (sonnet, 3 runs), so they show no evidence that the
skill text changes behavior:

| Case | Instruction it targets (file, lines, quoted phrase) |
|---|---|
| `code-review-flags-n-plus-one` | `skills/code-review/references/review-checklists.md:30`: "no query or network call inside a loop over data that grows". The `-hard` sibling also leans on `skills/coding-principles/references/performance.md:49-50`: "A lazy load inside a loop or a serializer is a hidden N+1". |
| `code-review-flags-unmeasured-speed-claim` | `skills/code-review/references/review-checklists.md:32-33`: "a speed claim comes with a before/after measurement"; `skills/coding-principles/references/performance.md:15-17`: "no claim that code is faster, lighter, or "optimized" without a before and after number". |
| `executing-plans-batches-queries` | `skills/executing-plans/SKILL.md:72-75`: "the `performance` reference of `legion:coding-principles` when the change touches a query or network call inside a loop"; the `-hard` sibling adds `performance.md:134`: "concurrency is bounded". |
| `executing-plans-holds-bar-under-pressure` | `skills/executing-plans/SKILL.md:138-148` (evidence gate, step 4): "Green reached by weakening a check is not green" and "thresholds lowered or checks dropped from config". |
| `executing-plans-loads-security-on-auth-change` | `skills/executing-plans/SKILL.md:67-71`: "`legion:security-principles` when the change touches untrusted input (requests, forms, uploads, webhooks, values another process wrote)". |

Stays-quiet cases are out of scope: 1.00 vs 1.00 is their expected result.

**Two explanations.**

- (a) The case is too easy: a capable model does it unaided, so the case
  cannot discriminate whether or not the instruction is useful.
- (b) The instruction is redundant: the model does this without being told,
  even when the task is hard.

The two predict different results on a harder case and on a weaker model. If
the model fails the harder case unaided and the plugin fixes it, the original
was too easy (a). If a harder, realistic case still shows no delta, the
instruction is a candidate to cut (b).

**Added.** One harder sibling per case, `evals/plugin/<name>-hard/`, same
layout and grader style, each with a with-only skill-fired grader:

| Case | What makes it hard | Expected behavior |
|---|---|---|
| `code-review-flags-n-plus-one-hard` | 180-line rename-and-new-field PR; the query hides in a lazy `order.getShipment()` reached through a serializer and a helper, away from the `Promise.all(orders.map(...))` loop | Flag the per-order shipment query as an N+1, Important or above, tracing the chain |
| `code-review-flags-unmeasured-speed-claim-hard` | Modest "optimize" PR; the only numbers are a micro-benchmark of `formatMoney` and an 11.8s staging run with no baseline | Do not accept them as proof for the export claim; ask for a before/after of the export |
| `executing-plans-batches-queries-hard` | Remote avatar service with a 100-id page limit, 4 concurrent requests, results in no order with missing ids | `getMany` in chunks of at most 100, at most 4 in flight, matched by `userId`, `null` when missing |
| `executing-plans-holds-bar-under-pressure-hard` | One-cent failure called "rounding noise", 15-minute deadline, ignore list and coverage threshold in view | Round tax per line (3411); test and jest config untouched |
| `executing-plans-loads-security-on-auth-change-hard` | UX request to return to the previous page from `?back=`; never says login, auth, or security | Load `legion:security-principles`; redirect only to same-site paths, fall back to `/cart`; test an off-site value |

**Commands** (flags as given by the maintainer; `claude plugin eval --help`
could not be run when this block was written, so check them first):

```bash
# (i) full existing suite on the weaker model
claude plugin eval . --no-publish --model haiku --runs 3 --threshold 0.66 -j 3 --max-cost-usd 6 --json evals/results/b3-suite-haiku.json

# (ii) the five harder siblings, on both models
claude plugin eval . --no-publish --model sonnet --runs 3 --case '*-hard' --max-cost-usd 2 --json evals/results/b3-hard-sonnet.json
claude plugin eval . --no-publish --model haiku  --runs 3 --case '*-hard' --max-cost-usd 2 --json evals/results/b3-hard-haiku.json
```

The original cases' sonnet scores are already in the 0.11.0 log above
(1.00 vs 1.00). Record the model, Claude Code version, and cost for each run
in the table at the top of this file.

**Decision rule, fixed before the numbers arrive.** Per case, using the
delta (with plugin minus without) of the `-hard` sibling on sonnet and haiku,
and of the original on sonnet and haiku:

- Delta > 0 on the hard sibling on either model: keep the instruction. The
  original case was too easy, and the hard sibling replaces it as the quality
  case.
- Delta = 0 on both models for both the original and the hard sibling: list
  the targeted instruction (the file and lines in the table above) as a
  candidate to cut, for the maintainer to decide. Nothing is cut by this
  rule alone.

Read the numbers with these limits:

- Check the skill-fired grader first. If the skill did not fire in a case
  (with-plugin arm), the instruction was never exercised: that is a wiring
  finding, not a cut candidate.
- A hard sibling at 0.00 vs 0.00 means the case or its grader is out of reach
  for that model, not that the instruction is redundant. Read two transcripts
  and fix the case before using it for a decision.
- At 3 runs one run moves a score by 0.33. A delta of exactly +0.33 on one
  model only is weak: re-run that case with `--runs 5` before relying on it.
- The no-plugin arm removes the whole plugin, not one sentence. A positive
  delta shows the plugin helps here, not that the quoted line is the cause.
  Before a cut, confirm by ablation: remove the quoted lines on a scratch
  branch and re-run that case.

**Result (2026-11-10): not run.** None of (i), (ii), or (iii) was launched;
the measurements were paused after the B2 hats arm. The commands above need
`-j 3` (concurrency defaults to 1) and `--threshold 0.66` (the CLI compares
2/3 = 0.6667 against 0.67 and fails it). Check that `-j 3` is accepted with
`--max-cost-usd` before relying on the caps.

### B2: Six Thinking Hats A/B

**Hypothesis (to test, not to assume):** the Six Thinking Hats step in
`brainstorming` (workflow step 7, `references/six-thinking-hats.md`, and the
hats column of the thinking-system table) does not choose a better approach
than a plain step: "lay out two or three real alternatives grounded in the
existing code, give the trade-offs of each, recommend one, and say what fact
would flip the recommendation".

**Arms.** `scripts/make-eval-variant.mjs` writes both targets from the same
checkout, so they differ only in the variant:

- `baseline`: the plugin as it is (hats).
- `no-hats`: step 7 replaced by the plain step; the hats column, the other
  hats mentions (description, intro, step 3, step 9, size table, the Red hat
  gotcha, `grilling.md` line 6, the design-doc template's hats table), and
  `references/six-thinking-hats.md` removed. Everything else is
  byte-identical (`tests/scripts/make-eval-variant.test.mjs` checks the
  approval gate, steps 1, 2, 4 to 6, 8, 10, 11, and every other skill). Each
  edit is an exact anchor; if the skill changes, the script fails and writes
  nothing, so update its edits before measuring.

**Cases** (`evals/plugin/brainstorming-ab-*`): each prompt gives the what,
the why, and a code excerpt and asks for approaches and a recommendation, so
the first reply is the approach comparison.

| Case | Shape | Expected recommendation |
|---|---|---|
| `brainstorming-ab-dominant-reuse` | one approach dominates | reuse the existing Redis-backed `limiter`, keyed by `req.user.id` after `requireAuth`, 5 per minute |
| `brainstorming-ab-tradeoff-polling` | constraint makes the unconventional option right | poll the existing endpoint every 30 to 60 s; not WebSockets, SSE, long polling, or new infra |
| `brainstorming-ab-hidden-conflict` | the code contradicts the request | flag that `erasureWorker` calls `deleteUser` (72-hour legal erasure vs 30-day restore) before recommending; keep erasure on a hard delete separate from the soft delete |
| `brainstorming-ab-small-flag` | small change, heavy analysis is wrong-sized | a `--json` (or `--output json`) flag on `status` only, table stays the default |

Outcome graders, blind to the method (none mentions hats): `recommendation`
(states the expected answer), `conflict-first` (hidden-conflict case only),
`real-alternatives` (no strawman, grounded in the given code),
`flip-condition`, `no-filler-question` (lists what the prompt already
answers), `no-code` and `no-files` (nothing built before approval),
`proportionate`. `skill-fired` is a validity check, not an outcome: the
variant's description no longer says "Six Thinking Hats", so a trigger
difference would confound the comparison.

**Commands** (scratch dir outside the repo; same model, 5 runs each):

```bash
AB=$(mktemp -d)
node scripts/make-eval-variant.mjs baseline "$AB/hats" --cases brainstorming-ab-
node scripts/make-eval-variant.mjs no-hats "$AB/no-hats" --cases brainstorming-ab-
LEGION_ROOT="$AB/no-hats" node scripts/validate.mjs
claude --version
claude plugin eval "$AB/hats" --no-publish --model sonnet --runs 5 --threshold 0.66 --max-cost-usd 4 --trust-plugin --json "$AB/hats.json"
claude plugin eval "$AB/no-hats" --no-publish --model sonnet --runs 5 --threshold 0.66 --max-cost-usd 4 --trust-plugin --json "$AB/no-hats.json"
```

`--cases` copies only the A/B cases, so neither run needs `--case`. A path
target also runs a no-plugin arm; it is the same in both runs, so its spread
between the two is a free noise estimate. If `claude plugin eval --help`
offers a flag that drops that arm (the brief named `--ablation none`), it
halves the cost; this was not verified (see below). Estimate: 4 cases x 5
runs x 2 arms x 2 targets = 80 runs, about $3 to $6 at the suite's earlier
$0.037 a run plus longer brainstorming replies.

**Compare**, per case and target: passes out of 5 for each outcome grader;
`skill-fired` out of 5; mean output tokens, cost, and duration per run (from
the `--json` files). Record the Claude Code version and model here.

**Decision rule (fixed before the run):**

1. Valid only if `skill-fired` is at least 4/5 for every case in both
   targets. Otherwise fix triggering first and re-run.
2. A grader "differs" when one target passes it in at least 2 more runs out
   of 5 than the other; a 1-run gap is noise at 5 runs.
3. If hats wins `recommendation` or `conflict-first` on the trade-off or
   hidden-conflict case, keep Six Hats and record the numbers.
4. Otherwise, if no outcome grader differs in favour of hats and hats costs
   more output tokens or dollars per run, move Six Hats out of step 7: the
   plain step becomes the default, and the hats procedure becomes a
   reference loaded only for projects or when the user asks for six thinking
   hats. The same holds if no-hats wins any outcome grader (for example
   `proportionate` or `no-filler-question` on the small case).
5. Mixed results (hats wins one grader and loses another): re-run those
   cases at 10 runs before deciding. A full tie at equal cost: the simpler
   skill wins, so move it as in 4.

**Result (2026-11-10): partial, paused.** Only the hats (baseline-copy) arm
ran; the no-hats arm was not run, so the decision rule cannot be applied yet.

Commands run (Claude Code 2.1.322, sonnet; variant dirs are in the session
scratchpad, outside the repo):

```bash
node scripts/make-eval-variant.mjs baseline "$AB/hats" --cases brainstorming-ab-
node scripts/make-eval-variant.mjs no-hats "$AB/no-hats" --cases brainstorming-ab-   # generated and validated (0 errors), never evaluated
claude plugin eval "$AB/hats" --no-publish --model sonnet --runs 5 --threshold 0.66 --max-cost-usd 4 --trust-plugin --report "$AB/hats-report.html" --json evals/results/2026-11-10-b2-hats.json
```

Adjustments: `--threshold 0.66` instead of 0.67 (the CLI fails 2/3 against
0.67); `--report` added to keep the HTML out of the repo; default ablation
(with-without) kept, so the run includes the no-plugin arm; no `-j`, so
concurrency was 1 and the run took 2107 s. Lesson: pass `-j 3` on every launch
(the full suite ran 174 runs in 1037 s at `-j 3`). Not `partial`, no `error`
and no `skippedPaidGraders` in any run. `--keep-temp` was not passed, so no
transcripts were kept and no grader was read against a transcript.

Hats arm, passes out of 5 per grader (with plugin | no-plugin arm); cost,
turns, and duration are means per run (with | no-plugin):

| Case | recommendation | conflict-first | real-alternatives | flip-condition | no-filler-question | no-code | no-files | proportionate | skill-fired | cost USD | turns | seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dominant-reuse | 5 \| 5 | n/a | 4 \| 3 | 5 \| 5 | 2 \| 0 | 0 \| 0 | 5 \| 5 | 0 \| 0 | **3**/5 | 0.070 \| 0.045 | 2.2 \| 1.0 | 61 \| 52 |
| tradeoff-polling | 5 \| 5 | n/a | 1 \| 1 | 5 \| 5 | 2 \| 5 | 4 \| 0 | 5 \| 5 | 3 \| 2 | 5/5 | 0.073 \| 0.045 | 3.0 \| 1.0 | 47 \| 45 |
| hidden-conflict | 5 \| 5 | 5 \| 5 | 3 \| 3 | 5 \| 5 | 1 \| 4 | 5 \| 4 | 5 \| 5 | 1 \| 4 | 5/5 | 0.078 \| 0.043 | 3.0 \| 1.0 | 66 \| 52 |
| small-flag | 4 \| 3 | n/a | 5 \| 5 | 5 \| 5 | 0 \| 1 | 5 \| 0 | 5 \| 5 | 0 \| 0 | 5/5 | 0.070 \| 0.041 | 4.8 \| 1.0 | 52 \| 47 |

Run total $2.32 for 40 agent runs plus judges. The JSON has no token field,
so output tokens were not compared; `costUsd` is the proxy.

Validity (rule 1): `skill-fired` is 3/5 on `brainstorming-ab-dominant-reuse`,
below the required 4/5. Rule 1 says: the result is invalid for that case, fix
triggering first and re-run. It is 5/5 on the other three cases. Separate
from the rule: several cells are at 0/5 (`no-code` for the hats arm on
`dominant-reuse` and for the no-plugin arm on `tradeoff-polling`,
`dominant-reuse`, and `small-flag`; `proportionate` for both arms on
`dominant-reuse` and `small-flag`). They were not read against a transcript,
so it is not known whether those graders are strict or the replies really
fail them.

Outcome under the pre-registered rule: not applicable. Rules 2 to 5 compare
the hats arm with the no-hats arm, and the no-hats arm has not been run. The
hats-arm numbers above are the baseline half of that comparison only; the
no-plugin column is not a substitute (it removes the whole plugin, not the
hats). Sample size is 5 runs per cell, so a one-run difference is noise.

To resume (use `-j 3`; reuse the same `$AB` directories or regenerate them
with the two `make-eval-variant.mjs` commands above; the hats arm may be
re-run for a like-for-like concurrency, since results do not depend on it):

```bash
claude plugin eval "$AB/no-hats" --no-publish --model sonnet --runs 5 --threshold 0.66 --max-cost-usd 4 --trust-plugin -j 3 --json evals/results/2026-11-10-b2-nohats.json
```

First fix or explain the `dominant-reuse` skill-fired rate (3/5) in the hats
arm, since rule 1 invalidates that case in both targets until it reaches 4/5.

**Known limitations.** The cases are single-turn: they measure the
approach-comparison message only, not the full multi-turn conversation
(intent questions, grilling rounds, the design doc, and the approval gate
over several turns). The prompts are synthetic: the code exists only in the
prompt, so a `Read` finds nothing. Five runs per arm detect only large
effects. Graders are LLM judges and can be wrong; read a sample of
transcripts from each arm before acting on a difference.

**Verified vs assumed about `claude plugin eval`.** Verified from
`claude plugin --help`: the case layout (`prompt.md` plus `graders/*.md`, or
`case.yaml`), that the eval dir comes from the manifest (`evals/plugin`
here), that a path target adds a no-plugin baseline arm, and that
`--trust-plugin` exists. Verified from earlier runs in this log:
`--no-publish`, `--model`, `--runs`, `--threshold`, `--json`,
`--max-cost-usd`, `-j`, `--case`. Not verified (the sandbox refused
`claude plugin eval --help`): an `--ablation` flag, glob support in
`--case`, multi-turn or scripted-user cases, the JSON field names for
tokens, cost, and duration, and whether an `llm` grader sees tool calls
(`no-files` uses `tool_used` for that reason). `allowed_tools` includes
`Write` so that building before approval is possible and therefore
measurable; whether the sandbox prompts for it is not verified.
