---
name: executing-plans
description: >-
  Implements code spec-first and test-first, writing a failing test before
  each change and driving it through red-green-refactor at public seams, and
  gates every completion claim on fresh evidence; executes a written plan task
  by task, inline or through fresh subagents, with a ledger that survives
  compaction. Use when a plan is ready to execute, implement, or resume; when
  writing or changing production code without a plan, such as a feature, a bug
  fix whose cause is known, a pasted function, or unit tests for code that has
  none, even when the request never mentions tests; and before saying work is
  done, fixed, passing, or ready to commit, or opening a PR.
license: MIT
metadata:
  author: ongtungduong
---

# Executing Plans

Every code change takes one path: pin what it must do, watch a test fail for
that, write the least code that passes, shape it with the chosen design
principles, and prove the result before claiming it. With a written plan you
take that path once per task; without one, the request is a plan of one task.

## The four rules

1. **Spec first.** Every change traces to an acceptance criterion; code that
   no criterion asks for is scope creep.
2. **Test first.** No production code without a test you watched fail for the
   expected reason. A test you never saw fail may pass for reasons unrelated
   to your change. Code written before its test is set aside and rebuilt from
   the test, because adapting it turns test-first into test-after. Only the
   user grants exceptions (throwaway spike, generated code, pure config).
3. **Principles.** Code follows the rule set loaded with
   `legion:coding-principles`, or for an XS change inside existing code, the
   surrounding code's conventions; a documented repo convention wins where
   they disagree.
4. **Evidence.** No "done", "fixed", or "passing" without a check run in the
   same message and its output read; code and state change between the check
   and the claim.

## Pick the path

| Situation | Path |
|---|---|
| A written plan exists | Plan workflow |
| No plan, one or two seams: a function, a bug whose cause is known, tests for untested code | Quick path |
| No plan, several independent pieces, or the design is still open | Call the Skill tool with `legion:brainstorming` (intent unsettled) or `legion:writing-plans` (spec settled), then come back |
| A bug whose cause is unknown | Call the Skill tool with `legion:systematic-debugging` first; its regression test is your first RED |

## Quick path

1. **Pin the criteria** from the request, issue, or spec. If there are none and
   the change is not trivial, write them in one to three lines and confirm
   them with the user before coding.
2. **Load the principles** before the first test when the change adds or
   reshapes a function, class, module, or interface: call the Skill tool with
   `legion:coding-principles`; it names the set in one line and its rules
   shape the GREEN and REFACTOR steps. An XS change inside existing code (a
   condition, a value, one call) follows the surrounding code's conventions
   instead; say so in the report's `Principles:` line.
3. **Run the TDD cycle** below, inline.
4. **Review if risky.** For a change to auth, secrets, untrusted input,
   persisted data, money, or concurrency, call the Skill tool with
   `legion:code-review` before claiming it.
5. **Run the evidence gate** and report in its format.

## Plan workflow

With a written plan, read
[references/plan-workflow.md](references/plan-workflow.md) before setup and
follow it: branch, ledger, the per-task choice of inline or subagent work,
reviews, integration, final review, and finish. Read it again after a
compaction; the ledger it defines is how you resume.

## The TDD cycle

1. **Name the seams.** A seam is a public boundary where behavior is observed
   without reaching inside: a function signature, module interface, endpoint,
   or CLI. Use the plan's seams if it names them. If the right seam is
   unclear, say so: a hard test is design feedback. Use `GLOSSARY.md` terms in
   test names when it exists.
2. **RED:** one minimal test for one behavior, named for the behavior ("rejects
   an empty cart"). Before writing it, name the production change that would
   make it fail; if you cannot, the test proves nothing. Before the first test
   of a session, read [references/good-tests.md](references/good-tests.md).
3. **Verify RED:** run it. It must fail (not error) because the behavior is
   missing, with the message you expected.
4. **GREEN:** the simplest code that passes. No options, parameters, or
   features the test does not demand.
5. **Verify GREEN:** run the test, then the project's **full** suite. Report
   every failure by name, including ones you did not cause.
6. **REFACTOR** only while green, by the loaded principles: remove the smell
   that most blocks the next change, re-run after each step, add no behavior.
7. **Next slice:** one seam, one test, one minimal implementation per cycle.

For a bug, the first test reproduces the reported symptom. For existing code
without tests, first write characterization tests that pin what it does today,
even where that looks wrong, then change it (the
`working-effectively-with-legacy-code` set covers breaking dependencies to get
a seam). Those tests stay in the suite; they are the point, not scaffolding.

## The evidence gate

1. **Identify** the command that proves the exact claim (table below).
2. **Run** it fresh and complete, not a narrower subset.
3. **Read** the whole output: exit code, failure count, warnings.
4. **Report** the result. If the output contradicts the claim, lead with the
   actual status; what you could not check here is unverified, never done.

| Claim | Evidence required | Not enough |
|---|---|---|
| Tests pass | The suite's output showing 0 failures | An earlier run; "should pass" |
| Build succeeds | The build command exiting 0 | Lint passing; logs looking fine |
| Bug fixed | The original symptom's reproduction now passing | The code changed |
| Regression test works | Seen failing without the fix, passing with it | Passing once |
| Requirements met | A line-by-line check against the spec or plan | Tests passing |
| Subagent finished | The diff in version control, inspected | Its report |

```
Verified: `npm test` -> 48 passed, 0 failed; `npm run build` -> exit 0.
Criteria: <each acceptance criterion> -> <test that proves it>.
Principles: <set(s)>; final checklist answered. (XS: surrounding conventions)
Unverified: deploy to staging (needs your credentials).
```

## Rulings, not stalls

Conflicts, ambiguities, and plan defects are yours to decide: the spec is the
binding authority, the plan argues from it, and your judgment settles what
neither answers. Ledger each as `Ruling: <decision> - <why> - <cost if wrong>`
and continue; an unledgered deviation is a decision the user never sees.
Do not pause between tasks to ask "should I continue?".

Stop and ask only for: an irreversible or destructive operation; a
security-sensitive action; a side effect outside the working tree that needs
consent (merge, push to a shared branch, publish); a plan so broken that every
path is a guess.

## Gotchas

- "The request didn't ask for tests" does not lift the test-first rule: it
  governs how code gets written, not what was asked.
- A new test that passes on its first run is testing existing behavior or
  nothing; fix the test before writing code. An erroring test (import
  failure, typo) is not RED either.
- A green run of one test file is not a green suite. The task bounds what you
  change, not what you verify.
- "Should", "probably", and "looks good" are claims without evidence; replace
  them with the command and its output.
