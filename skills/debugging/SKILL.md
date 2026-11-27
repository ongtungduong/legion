---
name: debugging
description: >-
  Finds the root cause of a problem, or the contributing causes when several
  line up, in software and the systems around it (code, builds and CI,
  infrastructure, data pipelines, integrations) by first building a fast
  reproduction or an evidence timeline, minimizing it, ranking falsifiable
  hypotheses, instrumenting, fixing the cause, and adding a control. Use when something behaves
  wrongly and the cause is unknown: a bug, failing or flaky test, crash,
  error message, stack trace, build or CI failure, outage, systems that
  stopped syncing, data that no longer matches, numbers that look wrong,
  jobs that get stuck, something that stopped working or got slow since a
  change, and when asked what broke, why something fails, for a root cause
  analysis, the 5 whys, or a postmortem, before proposing any fix, even when the code
  or a diff is pasted inline, the fix looks obvious, or a retry is requested
  to turn CI green. Not for a business process or team problem with no
  software, infrastructure, or data system.
license: MIT
metadata:
  author: ongtungduong
---

# Debugging

Build a feedback loop that shows this exact failure, then use it to find and
prove the root cause. With a fast loop, bisection and hypotheses become
mechanical; without one, reading the system produces stories, and a fix for a
symptom is a guess that made the symptom go quiet. The method is the same for
code, builds, infrastructure, and data; only the loop changes.

**The rule:** no fix until there is a loop that shows the failure and a
confirmed cause. Containment is not a fix: when harm is ongoing, contain it
first (step 1), then find the cause.

## Five whys and the lenses

The method that carries the lenses is **five whys**: from the observed
symptom, ask "why?" link by link, prove each answer with the lenses before
the next, and at the confirmed cause switch to "why was this possible?" until
you reach a cause the team controls. When the cause is not obvious at step 4,
or at step 6, read [references/five-whys.md](references/five-whys.md) and run
its procedure.

The chain is a **why tree**, not a line. A failure in a complex system (an
incident, an outage, a pipeline that keeps failing) rarely has one root cause: latent
conditions and a trigger line up, and each is a contributing cause with its
own control. Keep every branch that has evidence; pruning the tree to one
"root cause" for a tidier story leaves the other causes in place.

Ten lenses in four groups. Use each where it changes a hypothesis, a
probe, or the fix, and drop it where it does not; they are not headings in
your reply. When a lens needs depth, or the first hypotheses all fail, read
[references/lenses.md](references/lenses.md) for its procedure.

| Group | Lens | What it forces | Steps |
|---|---|---|---|
| Evidence | Facts vs. assumptions | Every inference anchors to something observed or measured; what "should" be true, or "worked yesterday", is checked before it carries weight | 2-4 |
| Evidence | Falsification | The fastest check that would prove each hypothesis wrong, not one that agrees with it; each one ruled out is progress | 4-5 |
| Evidence | Nothing is obviously fine | When the failure is strange, the simplest and most trusted things get checked too, including what people understood from each other | 4-5 |
| Isolation | Bisection | For anything ordered (a path, a history, a timeline): check the midpoint; each check rules out half | 4-5 |
| Isolation | Minimization | For an unordered set (inputs, settings, parts, participants): take one element away at a time while the problem stays, until only what it needs remains | 3 |
| Isolation | One variable at a time | One change per try, so the result says which change mattered | 5, 7 |
| Time and systems | Delta | Something new or different appeared before it started; walk the timeline back from the first sign | 2, 4 |
| Time and systems | Bottom-up | Confirm the basic conditions before the complex ones; do not jump to the suspect | 5 |
| Probability and containment | Common before rare | Simple, frequent causes are checked before complex, unlikely ones | 4 |
| Probability and containment | Contain before fixing | While damage is spreading, stop it and preserve the scene first; find the cause after | 1 |

## Workflow

1. **Contain, preserve, redact.** If harm is ongoing, contain it first (pause,
   roll back, switch to a fallback, cut off the affected part), say you are
   in the containment phase, and get the user's go-ahead for anything hard
   to undo. Before changing anything, record the current state: what it
   shows, the time, the affected items, logs and settings as they are now;
   a restart or cleanup can erase the evidence. Replace secrets in what you
   show with `<REDACTED>`, and build loops that read credentials from the
   environment.
2. **Build the loop**: a command or check that shows this exact failure. Pin
   down its scope first: always or intermittent, everywhere or in one place,
   since when, and for whom; the answers shape the loop. For
   code, default to a failing test at the seam that reaches the bug. For a
   system you cannot re-run on demand (a live outage, a data mismatch, a
   job that keeps stalling), the loop is a check that shows the symptom on
   current data plus an **evidence timeline** of what changed around when it
   started. When only a person can trigger the failure, the loop is a
   numbered checklist of steps for the user plus the observations to report,
   asked as a selection (`AskUserQuestion` in Claude Code) or as text; reuse
   the same checklist to verify the fix.
   Tighten it: faster (narrow scope), sharper (assert the user's exact symptom,
   not "it did not crash"), deterministic (pin what varies: time, randomness,
   environment, ordering).
   **Exit when** the loop for your kind of system holds, already run and
   shown with output:
   - *Re-runnable* (code, a build, a reproducible setup): one command that
     drives the real path, asserts the symptom, gives the same verdict every
     run (for an intermittent bug, it repeats the trigger until one
     invocation fails reliably), and finishes in seconds.
   - *Evidence timeline* (live system, data, scheduled jobs): a symptom check on
     current data that shows the symptom in numbers or records (a query, a
     count, a diff of two copies), cheap enough to re-run after every probe
     and after the fix, plus a timeline with the first sign, each change in
     the window with its source, and the affected set.
   - *Person-triggered*: the checklist gives the same observation each time
     the user repeats it.

   If you cannot build one, stop: list what you tried and ask for
   environment access, a redacted artifact, or permission to add temporary
   instrumentation.
3. **Reproduce and minimize.** Confirm the loop shows the failure the *user*
   described, not a nearby one, then minimize it. For an evidence timeline,
   narrow the window and the affected set until the pattern is sharp.
4. **Hypothesize.** Write ranked hypotheses before testing any (three to five
   for a cause that is open; one when a stack trace, a bisect, or the repro
   already names the line), each with a prediction ("if X is the cause, changing Y makes it disappear").
   Rank common causes before rare ones, and by likelihood for the cost of
   checking: a likely cause that a quick probe settles goes before a slightly
   likelier one that needs a new environment.
   Check what changed and a similar case that works. When a known-good
   version or state exists, bisect between it and now first: the change it
   names replaces most of the list, and the hypotheses then explain that one
   change. Show the list to the user without blocking on them; they often
   re-rank it instantly.
5. **Instrument.** One probe per prediction. Prefer a direct look at the
   live state (a debugger, a query, the item itself); otherwise observe the
   boundaries that separate hypotheses. Across several components, record
   what enters and leaves each boundary once to find *where* it breaks. For
   performance, measure a baseline first.
6. **Ask why it was possible.** Once a prediction holds, the confirmed cause
   is where the failure happened. Continue the five-whys chain with "why was
   this possible?", each answer backed by evidence, until every branch
   reaches a cause the team controls: a missing check, guard, test, review,
   alert, or procedure step. A person's mistake is never the last why.
7. **Fix,** in this order:
   1. Choose the recurrence control that would have caught this earliest,
      aimed at the last why of each branch: a failing test at a seam that exercises the
      real bug pattern for code; otherwise a check, monitor, alert,
      validation, guard, or a documented step in the procedure. If none can
      be placed, report that as a finding.
   2. Apply one fix at the confirmed cause, watch the control go from red to
      green, run the wider checks (the full suite, the full reconciliation),
      and re-run the original unminimized loop. A fix to the last why beyond
      the control (a process or design change) is a proposal for the user,
      not part of this fix.
8. **Clean up:**
   - [ ] the original reproduction or symptom check no longer fails;
   - [ ] each branch's recurrence control is in place, or its absence is
         documented;
   - [ ] all debug lines and temporary probes are removed;
   - [ ] throwaway harnesses are deleted or clearly marked;
   - [ ] the confirmed cause is recorded where the fix is (commit, PR,
         ticket, or incident note).
9. **Report** in the output format below, also when the session ends
   before a fix (a "why does this fail" question, a read-only session).
   For an incident (step 1 had to contain ongoing harm), offer a postmortem;
   when the user asks for one, or for a written RCA, fill
   [assets/postmortem-template.md](assets/postmortem-template.md) from what
   the session established, mark what it did not, and save it where the
   project keeps postmortems, or ask where.

## Gotchas

- "Just try a quick fix" (a retry, a sleep, a skip) is the first ask, not
  insistence. Lead with the loop and the ranked hypotheses; if you also give
  the stopgap, label it as hiding the cause. Ship the stopgap alone only if
  the user insists after seeing that.
- Three failed fixes, each revealing a new problem elsewhere, means the design
  is the bug. Stop and discuss the architecture with the user before a fourth.
- A failure that shows up 1% of the time is not debuggable. Repeat the
  trigger, add stress, or narrow timing until it fails reliably.
- For performance, logs mislead; a timing harness or profiler on a fixed
  input, against a good baseline, is the loop.
- A mismatch between two systems has three suspects: the source, the copy,
  and the path between them. Check each boundary before blaming one.
- Untagged debug logs survive cleanup. Prefix every one with a unique tag such
  as `[DEBUG-a4f2]` so removal is a single grep.
- A symptom that moves, recurs elsewhere, or grows under load is a feedback
  loop, not a single fault: something amplifying its own load, serving stale
  state, backing up, or two parts correcting each other. Trace the loop end
  to end.
- Captured artifacts (request dumps, exports, screenshots) carry credentials
  or personal data; quote only the lines with the signal.
- Without tools to run anything (a pasted diff, a description of the
  problem, a read-only session), the loop still comes first in the reply: the
  test or check that shows the symptom and what it will show, then the
  ranked hypotheses, the cause, and the fix, marked unverified. Give it in the
  output format below, labels and all.

## Output format

Every reply carries all the labels below, in this order, including a read-only one
where nothing could be run. Write `none` or `not applicable: <why>` for a line
with nothing to say, never drop it: a missing line reads as "not checked", and
a reader looking for the cause finds it in the same place each time. Put
explanation after the labelled lines, not in place of them. Read
[assets/example-reply.md](assets/example-reply.md) for a filled-in reply when
unsure how much detail each line needs.

```
Loop: `<command or check>` -> <output that shows the symptom> | not run: `<the check>` -> <what it will show>
Cause: <the confirmed cause, at file:line or the exact step, record, or change> | not confirmed: <leading hypothesis and the probe that would settle it>
Contributing: <each other cause on the why tree, with its evidence> | none
Why chain: <cause> <- <why it was possible> <- ... <- <the cause you control> (one line per branch)
Evidence: <the prediction that held, and the probe output>
Fix: <the change> | not applied: <why>
Recurrence control: <test, check, monitor, or procedure step> RED -> GREEN | none possible: <why>
Unverified: <what could not be run or checked here, or "none">
```
