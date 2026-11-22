---
name: debugging
description: >-
  Finds the root cause of a problem in any system (software, infrastructure,
  data, integrations, or an operational process) by first building a fast
  reproduction or an evidence timeline that shows the failure, then
  minimizing it, ranking falsifiable hypotheses, instrumenting, fixing the
  cause, and adding a control against recurrence. Use when something behaves
  wrongly and the cause is unknown: a bug, failing or flaky test, crash,
  error message, stack trace, build or CI failure, outage, systems that
  stopped syncing, data that no longer matches, numbers that look wrong,
  work that gets stuck, something that stopped working or got slow since a
  change, and when asked what broke or why something fails, before
  proposing any fix, even when the code is pasted inline and the fix looks
  obvious.
license: MIT
metadata:
  author: ongtungduong
---

# Debugging

Build a feedback loop that shows this exact failure, then use it to find and
prove the root cause. With a fast loop, bisection and hypotheses become
mechanical; without one, reading the system produces stories, and a fix for a
symptom is a guess that made the symptom go quiet. The method is the same for
code, infrastructure, data, and processes; only the loop changes.

**The rule:** no fix until there is a loop that shows the failure and a
confirmed cause. When people or customers are being harmed right now,
mitigate first (roll back, pause, route around), say you are in the
mitigation phase, then find the cause.

## Workflow

1. **Redact.** Replace secrets in commands, logs, and captured requests with
   `<REDACTED>` before showing them; build loops that read credentials from the
   environment.
2. **Build the loop.** For code, default to a failing test at the seam that
   reaches the bug. When no test can reach it, use, in this order: a curl/HTTP script
   against a dev server; a CLI run diffed against known-good output; a headless
   browser script; a replay of a captured payload; a throwaway harness; a
   fuzz loop for "sometimes wrong"; a differential run of old vs new; last,
   when only a person can trigger the bug, a human-in-the-loop script: copy
   [scripts/hitl-loop.sh](scripts/hitl-loop.sh) to `.legion/` (add
   `.legion/*`, `!.legion/specs/`, `!.legion/plans/` to `.gitignore` if
   missing and say so), write the steps, and ask the user to run it with
   `! bash .legion/<copy>.sh` (your Bash tool cannot answer its prompts);
   its `KEY=VALUE` output is the loop's verdict.
   For a system you cannot re-run on demand (a live outage, a data mismatch,
   a process that keeps stalling), the loop is a query or check that shows
   the symptom on current data (a count, a diff between source and copy, a
   list of stuck items), plus an **evidence timeline**: when it started,
   and what changed around then (deploys, config, data volume, vendors,
   people, rules), from logs, metrics, history, and the people involved.
   Tighten it: faster (narrow scope), sharper (assert the user's exact symptom,
   not "did not crash"), deterministic (pin time, seed randomness, isolate the
   filesystem).
   **Exit when** you have one command or check, already run and shown with
   output, that drives the real path, asserts the symptom, gives the same verdict every
   run (for an intermittent bug, the command repeats the trigger until one
   invocation fails reliably), and finishes in seconds. If you cannot build one, stop: list what you
   tried and ask for environment access, a redacted artifact, or permission to
   add temporary instrumentation.
3. **Reproduce and minimize.** Confirm the loop shows the failure the *user*
   described, not a nearby one. Cut inputs, callers, config, and steps one at a
   time, re-running after each, until every remaining element is load-bearing.
   For an evidence timeline, narrow the window and the affected set (which
   records, which accounts, which step) until the pattern is sharp.
4. **Hypothesize.** Write ranked hypotheses before testing any (three to five
   for a cause that is open; one when a stack trace, a bisect, or the repro
   already names the line), each with a prediction ("if X is the cause, changing Y makes it disappear").
   Rank by likelihood for the cost of checking: a likely cause that a
   one-line probe settles goes before a slightly likelier one that needs a
   new environment.
   Check recent changes (`git log`, diffs, dependency, config, data, vendor,
   and process changes) and a similar case that works. When a commit is known to be good, run
   `git bisect run <loop command>` first: the commit it names replaces most
   of the list, and the hypotheses then explain that one diff. Show the list to the user without blocking on them;
   they often re-rank it instantly.
5. **Instrument.** One probe per prediction, one variable at a time. Prefer a
   debugger or REPL; otherwise log or check at the boundaries that separate
   hypotheses. In multi-component systems (CI -> build -> deploy, API ->
   service -> DB, source -> pipeline -> report, request -> approval -> payment),
   log what enters and leaves each boundary once to find *where* it breaks.
   For performance, measure a baseline first, then bisect.
6. **Fix,** in this order:
   1. Choose the recurrence control that would have caught this earliest:
      a failing test at a seam that exercises the real bug pattern for code;
      otherwise a check, monitor, alert, validation, guard, or a documented
      step in the procedure. If none can be placed, report that as a finding.
   2. Apply one fix at the root cause, watch the control go from red to
      green, run the wider checks (the full suite, the full reconciliation),
      and re-run the original unminimized loop.
7. **Clean up:**
   - [ ] the original reproduction or symptom check no longer fails;
   - [ ] the recurrence control is in place, or its absence is documented;
   - [ ] all debug lines and temporary probes are removed;
   - [ ] throwaway harnesses are deleted or clearly marked;
   - [ ] the confirmed cause is recorded where the fix is (commit, PR,
         ticket, or incident note).
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
- "It started on Tuesday" is a lead, not a cause. Something changed near
  Tuesday; the timeline finds it, and the hypothesis must explain why it
  broke this and not everything else.
- A mismatch between two systems has three suspects: the source, the copy,
  and the path between them. Check each boundary before blaming one.
- Without tools to run anything (a pasted diff, a description of the
  problem, a read-only session), the loop still comes first in the reply: the
  test or check that shows the symptom and what it will show, then the
  ranked hypotheses, the cause, and the fix, marked unverified.

## Output format

```
Loop: `<command or check>` -> <output that shows the symptom>
Cause: <the confirmed root cause, at file:line or the exact step, record, or change> | not confirmed: <leading hypothesis and the probe that would settle it>
Evidence: <the prediction that held, and the probe output>
Fix: <the change> | not applied: <why>
Recurrence control: <test, check, monitor, or procedure step> RED -> GREEN | none possible: <why>
Unverified: <what could not be run or checked here, or "none">
```
