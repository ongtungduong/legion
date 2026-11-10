---
name: systematic-debugging
description: >-
  Finds the root cause of a defect by first building a fast reproduction that
  goes red on the bug, then minimizing it, ranking falsifiable hypotheses,
  instrumenting, and fixing with a regression test. Use when facing a bug,
  failing or flaky test, crash, error message, stack trace, build or CI
  failure, or something that got slow or slower after a change or deploy,
  and when asked what broke or why something fails, before proposing any
  fix, even when the code is pasted inline and the fix looks obvious.
license: MIT
metadata:
  author: ongtungduong
---

# Systematic Debugging

Build a feedback loop that goes red on this exact bug, then use it to find and
prove the root cause. With a fast red-capable loop, bisection and hypotheses
become mechanical; without one, reading code produces stories, and a fix for
a symptom is a guess that made the symptom go quiet.

**The rule:** no fix until there is a red-capable reproduction and a confirmed
cause.

## Workflow

1. **Redact.** Replace secrets in commands, logs, and captured requests with
   `<REDACTED>` before showing them; build loops that read credentials from the
   environment.
2. **Build the loop.** Default to a failing test at the seam that reaches the
   bug. When no test can reach it, use, in this order: a curl/HTTP script
   against a dev server; a CLI run diffed against known-good output; a headless
   browser script; a replay of a captured payload; a throwaway harness; a
   fuzz loop for "sometimes wrong"; a differential run of old vs new; last,
   when only a person can trigger the bug, a human-in-the-loop script: copy
   [scripts/hitl-loop.sh](scripts/hitl-loop.sh) to `.legion/` (add
   `.legion/*`, `!.legion/specs/`, `!.legion/plans/` to `.gitignore` if
   missing and say so), write the steps, and ask the user to run it with
   `! bash .legion/<copy>.sh` (your Bash tool cannot answer its prompts);
   its `KEY=VALUE` output is the loop's verdict.
   Tighten it: faster (narrow scope), sharper (assert the user's exact symptom,
   not "did not crash"), deterministic (pin time, seed randomness, isolate the
   filesystem).
   **Exit when** you have one command, already run and shown with output, that
   drives the real code path, asserts the symptom, gives the same verdict every
   run (for an intermittent bug, the command repeats the trigger until one
   invocation fails reliably), and finishes in seconds. If you cannot build one, stop: list what you
   tried and ask for environment access, a redacted artifact, or permission to
   add temporary instrumentation.
3. **Reproduce and minimize.** Confirm the loop shows the failure the *user*
   described, not a nearby one. Cut inputs, callers, config, and steps one at a
   time, re-running after each, until every remaining element is load-bearing.
4. **Hypothesize.** Write three to five ranked hypotheses before testing any,
   each with a prediction ("if X is the cause, changing Y makes it disappear").
   Rank by likelihood for the cost of checking: a likely cause that a
   one-line probe settles goes before a slightly likelier one that needs a
   new environment.
   Check recent changes (`git log`, diffs, dependency and config changes) and
   similar code that works. When a commit is known to be good, run
   `git bisect run <loop command>` first: the commit it names replaces most
   of the list, and the hypotheses then explain that one diff. Show the list to the user without blocking on them;
   they often re-rank it instantly.
5. **Instrument.** One probe per prediction, one variable at a time. Prefer a
   debugger or REPL; otherwise log at the boundaries that separate hypotheses.
   In multi-component systems (CI -> build -> deploy, API -> service -> DB),
   log what enters and leaves each boundary once to find *where* it breaks.
   For performance, measure a baseline first, then bisect.
6. **Fix,** in this order:
   1. Call the Skill tool with the principle the cause calls for, before
      choosing the fix: `legion:security-principles` when the cause is a
      security flaw (injection, missing authorization, leaked secret), then
      look for the same flaw at the other trust boundaries;
      `legion:coding-principles` for a performance regression (its
      `performance-optimization` reference, entering at the fix step with
      the step 5 baseline, since the cause is already found) or when the
      root-cause fix restructures code rather than changing a line.
   2. Turn the minimized repro into a failing test at a seam that exercises
      the real bug pattern (call the Skill tool with
      `legion:executing-plans`; this test is its first RED); if no such
      seam exists, report that as a finding.
   3. Apply one fix at the root cause, watch the test pass, run the full
      suite, and re-run the original unminimized loop.
7. **Clean up:**
   - [ ] the original reproduction no longer fails;
   - [ ] the regression test passes, or the missing seam is documented;
   - [ ] all debug lines are removed;
   - [ ] throwaway harnesses are deleted or clearly marked;
   - [ ] the confirmed cause is stated in the commit or PR message.
8. **Report** in the output format below, also when the session ends
   before a fix (a "why does this fail" question, a read-only session).

## Gotchas

- "Just try a quick fix" (a retry, a sleep, a skip) is the first ask, not
  insistence. Lead with the loop and the ranked hypotheses; if you also give
  the stopgap, label it as hiding the cause. Ship the stopgap alone only if
  the user insists after seeing that.
- Three failed fixes, each revealing a new problem elsewhere, means the design
  is the bug. Stop and discuss the architecture with the user before a fourth.
- A symptom that moves, recurs elsewhere, or grows under load points to a
  loop in the system, not a bad line: retries amplifying load, a cache serving
  stale data, a queue backing up, two components correcting each other. Trace
  the loop end to end; the cause is often far from where the symptom shows.
- Untagged debug logs survive cleanup. Prefix every one with a unique tag such
  as `[DEBUG-a4f2]` so removal is a single grep.
- A 1% flaky bug is not debuggable; loop the trigger, add stress, or narrow
  timing until the reproduction rate is high enough to work with.
- Changing several things before re-running hides which one mattered.
- Captured artifacts (HAR files, request dumps) carry auth headers; quote only
  the lines with the signal.
- For performance regressions, logs usually mislead; a timing harness or
  profiler is the loop.
- Without tools to run code (a pasted diff, a read-only session), the loop
  still comes first in the reply: the failing test or check that goes red on
  the symptom and what it will show, then the cause and the fix, marked
  unverified.

## Output format

```
Loop: `<command>` -> <red output that shows the symptom>
Cause: <the confirmed root cause, at file:line> | not confirmed: <leading hypothesis and the probe that would settle it>
Evidence: <the prediction that held, and the probe output>
Fix: <the change> - regression test `<name>` RED -> GREEN | not applied: <why>
Unverified: <what could not be run or checked here, or "none">
```

After a fix, the evidence-gate report of `legion:executing-plans` follows
this block.
