# Writing Checks

Read this when choosing the level of a check, deciding whether to replace a
dependency with a stand-in, or when a check is hard to write. The examples
use software tests, the most common case; the same rules hold for queries,
validators, and reader criteria.

## Contents

1. [Level: the smallest that reaches the behavior](#level-the-smallest-that-reaches-the-behavior)
2. [Real before stand-ins](#real-before-stand-ins)
3. [When a check is hard to write](#when-a-check-is-hard-to-write)
4. [Check the outcome, not the steps](#check-the-outcome-not-the-steps)
5. [One criterion per check](#one-criterion-per-check)
6. [Checks for work that does not run](#checks-for-work-that-does-not-run)
7. [Anti-patterns](#anti-patterns)

## Level: the smallest that reaches the behavior

| Level | Reaches | Cost | Use for |
|---|---|---|---|
| Small | One unit, no I/O, no network | Milliseconds | Rules, calculations, transformations: most checks |
| Medium | Several parts, local resources (a test database, a temp folder) | Seconds | Boundaries: storage, an API handler, a file format |
| Large | The whole flow, real external services | Minutes | The few critical paths end to end |

Most checks should be small. Go up a level only when the criterion is about
the boundary itself (the row is really written, the response really has
that status). A crash or rollback criterion needs the real boundary: an
injected exception is not a killed process, and a stubbed transaction is not
a database rollback.

## Real before stand-ins

Prefer, in order: the real implementation, a fake (a working in-memory
version), a stub (canned answers), a mock (asserts calls were made). Replace
a dependency only when the real one is slow, nondeterministic, or has side
effects you cannot undo (payments, email, a third-party API). Every stand-in
is a place where the check passes while production fails.

Pin what varies: inject the clock, seed randomness, fix the order of
anything unordered, and isolate state so each check sets up and cleans up
its own.

When a stand-in is needed:

- Learn every side effect of the real thing first, and replace only the slow
  or external layer below what the check depends on. A stand-in that also
  swallows a write the code later reads makes the check pass for the wrong
  reason.
- Give it the complete shape of the real data, not only the fields the check
  reads; code downstream reads the field you left out.
- Make it specific: when arguments, counts, or order are part of the
  contract, assert them, and give each branch (success, error, malformed)
  its own stand-in so the wrong branch cannot satisfy the check.
- Never assert on the stand-in itself (that it exists, that it was
  rendered); that passes whenever the stand-in is present.
- Cleanup or helpers that only checks use live with the checks, not in the
  work itself.

## When a check is hard to write

Difficulty is a finding about the work, not only about the check:

| Symptom | What it says | Try |
|---|---|---|
| You cannot say what the check should assert | The criterion is vague | Rewrite the criterion as a situation and a result |
| Everything must be replaced by stand-ins | The work is tightly coupled | Pass dependencies in instead of reaching for them |
| Setup is longer than the check | The interface asks too much | Simplify what the caller must provide |
| The stand-in setup outgrows the check | The stand-in is the wrong tool | Use the real components at a higher level |

## Check the outcome, not the steps

Assert on what the work produces, observed through the interface its
callers use (the returned value, the record read back the way a caller reads
it, the rendered text), not on which internal calls it made. A check that
asserts "the query contained ORDER BY" breaks on a harmless refactor and
passes on a wrong sort; a check that the first result is the newest does
neither.

The same holds for state: a check that reads the table behind `createUser`
breaks when the storage changes and says nothing about whether a caller can
get the user back; `getUser(created.id)` returning the name does. Read the
store directly only when the criterion is about the store itself (the row
survives a restart, the migration filled the new column).

## One criterion per check

Name each check after the criterion it proves, so a failure reads as a
broken requirement ("rejects units out of order", not "test 3"). Keep each
check readable on its own, even at the cost of repeating setup: a reader
should not trace shared helpers to see what is being proved. Arrange the
situation, act once, assert the expected result.

A range criterion ("for every n from 0 to 100000") gets a check over the
whole range when it is cheap, not a few samples.

## Checks for work that does not run

- **Data:** a query whose expected result is written down before the change
  (a count, a sum, an empty set of violating rows), or a diff against a copy
  known to be right.
- **A document or deliverable:** criteria a fresh reader answers yes or no
  ("every figure cites its source", "the procedure names an owner for each
  step"). For an important deliverable, give the criteria and the artifact
  to a reader who did not write it.
- **A process:** a dry run on a real case with the expected outcome at each
  step written in advance.

## Anti-patterns

| Anti-pattern | Why it fails | Instead |
|---|---|---|
| Check passes on its first run | It may not exercise the change at all | See it fail first, on the assertion |
| Expected value copied from the output, or computed by the code or helpers under test | Proves the work does what it does, not what it should | A literal derived by hand from the criterion |
| Change detector: asserts a constant's value, exact wording, or private structure | Fails on every deliberate redesign, sleeps through bugs | Assert the behavior that depends on the decision ("the sixth retry never happens", not "MAX_RETRIES is 5") |
| Asserting that a file or script contains some text | Proves only that the source is the source | Run it on a controlled input and assert its output or effect |
| Testing the framework or library | Spends checks on code you do not own | Check your use of it |
| Large snapshots nobody reads | Break on every change, get approved blindly | Assert the few fields the criterion names |
| Order- or time-dependent checks | Flaky, so failures get ignored | Isolate state, pin time and order |
| Mocking everything | Green checks, broken production | Real, then fake, then stub, then mock |
