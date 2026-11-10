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
| 2026-11-09 | 2.1.319 | sonnet | executing-plans-loads-security-on-auth-change (Task 5) | RED 1, GREEN 3 x 2 arms | 0.41 | 1/1, no quality delta |
| 2026-11-09 | 2.1.319 | sonnet | executing-plans-loads-security-on-auth-change after review fixes | 3 x 2 arms | 0.36 | 1/1 |
| 2026-11-09 | 2.1.319 | sonnet | security-audit-on-system (Task 6) | RED 1, GREEN 3 x 2 arms twice | 0.77 | 1/1 |
| 2026-11-09 | 2.1.319 | sonnet | code-review cases (Task 8) | RED 1-2, GREEN 3 x 2 arms | 1.79 | 5/5 |
| 2026-11-09 | 2.1.319 | sonnet | generated-code cases (Task 13) + 2 fixes | 3 x 2 arms | 2.35 | 2/4, 2 pressure cases open |
| 2026-11-09 | 2.1.319 | sonnet | smoke: 9 fires + 9 stays-quiet cases (Task 14) | 1, with plugin only | 1.31 | 18/18 |
| 2026-11-09 | 2.1.319 | sonnet | pressure cases after the maintainer's decision | 3 x 2 arms | 0.65 | 2/2 |
| 2026-11-09 | 2.1.319 | sonnet | full suite, 30 cases, concurrency 4 | 3 x 2 arms | 6.76 | 20/20 scored; 10 not scored (account limit) |
| 2026-11-09 | 2.1.319 | sonnet | the 10 unscored cases, after the final-review fixes | 3 x 2 arms | 3.93 | 10/10 |

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

## Open measurements

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
claude plugin eval "$AB/hats" --no-publish --model sonnet --runs 5 --threshold 0.67 --max-cost-usd 4 --trust-plugin --json "$AB/hats.json"
claude plugin eval "$AB/no-hats" --no-publish --model sonnet --runs 5 --threshold 0.67 --max-cost-usd 4 --trust-plugin --json "$AB/no-hats.json"
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
