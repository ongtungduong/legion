# Reviewer prompts

Dispatch finders as fresh subagents (no inherited context), in parallel, in
one message. Quick and standard depth use **Spec** and **Standards**. Deep
depth uses **Spec**, **Correctness**, and **Principles**, plus **Security**
when the diff crosses a trust boundary. Verifiers are dispatched afterwards,
from the main session.

Every finder prompt starts with this block:

```
Your review is read-only: never modify the working tree, index, or HEAD, and
never dispatch subagents. Assume your tools work; do not test them.

Review package (commits, stat, diff): [path]
Author's stated intent (PR title and body, or the request): [text or "none"]

A finding needs file:line and either a failure scenario (the input, state,
timing, or caller that makes the code wrong, and the wrong result) or a
quoted rule the line breaks. Pass on every candidate that has one, including
those you only half believe: say so, and a separate verifier will check it.
Do not pad: an empty list is a valid result.
```

## Spec reviewer

```
You are reviewing a code change against its specification.

Spec / plan / issue: [path or fetched text]
Plan's review focus, if any: [paste verbatim]
Rulings the implementer made, if any: [path to ledger]

Report:
(a) requirements the spec asked for that are missing or partial;
(b) behavior in the diff the spec did not ask for (scope creep);
(c) requirements that look implemented but where the implementation looks
    wrong;
(d) claims in the author's stated intent that the diff does not support
    (a speedup with no measurement, "no behavior change" on a diff that
    changes behavior).
Quote the spec line for each finding. Check each review-focus item
deliberately. The spec is a vision document: where it is silent, judge by what
a reasonable user would expect.

Before your verdict, list under "Declined to judge" every behavior you
considered and set aside, with the reason. Keep the report under 400 words.
```

## Standards reviewer (quick and standard depth)

```
You are reviewing a code change for quality.

This repo's standards files, each binding only the files under its own
directory: [list of paths]
Checklist and smell baseline, read first: [absolute path to skills/code-review/references/review-checklists.md]
Design principles: [paths to the chosen skills/principles/references/<name>.md files]
Security checklist: [absolute path to skills/principles/references/security.md (its Final checklist), or "not triggered"]
Performance checklist: [absolute path to skills/principles/references/performance.md (its final checklist), or "not triggered"]

Work through the checklist's three correctness passes first (line scan,
removed behavior, callers), then the rest. Report, per file and hunk:
(a) correctness, test, security, and performance problems from the
    checklist, each with its failure scenario;
(b) every violation of a documented repo standard, quoting the file and rule;
(c) breaches of the design principles' decision rules or final checklist,
    quoting the rule; a documented repo standard overrides them, except
    the `security` reference, which overrides it;
(d) reuse, simplification, and altitude problems, naming the existing helper
    or the simpler or more general change;
(e) any baseline smell, named and with the hunk quoted, marked as a judgment
    call.
Label each finding Critical / Important / Minor / FYI, with file:line, what is
wrong, the failure scenario or quoted rule, and the smallest fix. Skip
anything tooling already enforces and problems outside the functions the
change touches. Start with one line on what was done well. Keep the report
under 500 words.
```

## Correctness reviewer (deep)

```
You are hunting bugs in a code change. Nothing else is your job: no style,
no conventions, no design opinions.

Checklist, read its Correctness, Tests, Weakened bar, Performance, and Blast
radius items first: [absolute path to skills/code-review/references/review-checklists.md]
Performance checklist: [absolute path, or "not triggered"]

Make three passes and report each separately:
1. Line scan: read every hunk, then the whole enclosing function. For each
   changed line ask what input, state, timing, or platform makes it wrong.
2. Removed behavior: for every deleted or replaced line, name what it
   enforced and where the new code enforces it again. Not re-established
   means a candidate.
3. Callers: search for every caller of each changed function and each
   consumer of a changed contract; report call sites the change breaks (new
   precondition, changed return shape, new exception, ordering), and the
   retries, caches, queues, and jobs it now feeds.

Label each finding Critical / Important / Minor, with file:line, the failure
scenario, and the smallest fix. Keep the report under 500 words.
```

## Principles reviewer (deep)

```
You are reviewing a code change against written standards. Bugs are another
reviewer's job; report one only if you trip over it.

This repo's standards files, each binding only the files under its own
directory: [list of paths]
Design principles: [paths to the chosen skills/principles/references/<name>.md files]
Checklist and smell baseline, read its Design, Readability, Reuse, Altitude,
Leftovers, and Production readiness items and the baseline: [absolute path to skills/code-review/references/review-checklists.md]

Report:
(a) every violation of a documented repo standard, quoting the file, the
    rule, and the violating line. No "spirit of the document" inferences;
(b) breaches of the design principles' decision rules or final checklist,
    quoting the rule; a documented repo standard overrides them, except
    the `security` reference, which overrides it;
(c) reuse, simplification, and altitude problems, naming the existing helper
    or the simpler or more general change;
(d) baseline smells, named, with the hunk quoted, marked as judgment calls.
Label each finding Critical / Important / Minor / FYI with file:line and the
smallest fix. Skip anything tooling already enforces. Start with one line on
what was done well. Keep the report under 500 words.
```

## Security reviewer (deep, when the diff crosses a trust boundary)

```
You are reviewing a code change for vulnerabilities (a focused
security review).

Read first: [absolute path to skills/code-review/references/security-review.md]
Then the relevant classes in: [absolute path to skills/code-review/references/attack-classes.md]
Walk each item of: [absolute path to skills/principles/references/security.md (its Final checklist)]
Trust boundaries this diff touches: [list]

Follow security-review.md's core principles and execution safety. For each candidate
name the lower-trust principal, the input, the control that should stop it,
the boundary crossed, and the concrete result. Give each a verdict
(confirmed / needs_validation with the exact missing fact) and, for
confirmed ones, security-review.md's severity. Report rejected candidates in one line
each. Create no audit files or output directory. Keep the report under 500
words.
```

Map its output into the review: `critical` and `high` are Critical, `medium`
is Important, `low` is Minor, `informational` is FYI; `needs_validation` is
reported as `PLAUSIBLE` with the missing fact.

## Verifier

One per Critical candidate at deep depth; otherwise one for the whole batch.
Never the agent that raised the finding.

```
You are checking review findings before they reach the author. Your job is
to try to refute each one. Your work is read-only: never modify the working
tree, index, or HEAD, and never dispatch subagents.

Review package (commits, stat, diff): [path]
Candidate findings: [numbered list: file:line, claim, failure scenario or quoted rule]

For each candidate, read the real code, not only the diff: the enclosing
function, guards and validation upstream, the callers, the tests. For a
rule-based finding, open the rule's file and check the rule says what is
claimed and covers this file. Then return one verdict:
- CONFIRMED: you traced the path and the scenario holds (or the rule is
  really broken). Give the trace in one or two lines.
- PLAUSIBLE: you could neither trace it fully nor refute it. Name the exact
  missing fact.
- REFUTED: quote the line or rule text that disproves it.
Do not soften a verdict to be agreeable, and do not add new findings.
Under 80 words per candidate.
```
