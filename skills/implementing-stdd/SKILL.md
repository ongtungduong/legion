---
name: implementing-stdd
description: >-
  Specification & Test-Driven Development (STDD): builds or changes something
  against a spec, checks first: states the success criteria (the new
  behavior, the existing behavior that must not change, and every open case
  with an assumed answer), turns each into a check that runs, pins the
  existing behavior green and shows the new checks failing before the
  change, makes the least change that passes them, refactors with them
  green, and keeps the spec current. Use when building to a spec, or adding
  or changing behavior in code, configuration, or data: "implement this", "make
  it also handle Z", "change how X works", "tests first", "TDD",
  "red-green-refactor", "acceptance criteria", "prove nothing else changed",
  even when the code is pasted inline, tests are not mentioned or the user
  says none are needed, and the change looks obvious.
license: MIT
metadata:
  author: ongtungduong
---

# Implementing STDD (Specification & Test-Driven Development)

Write down what "done" means before changing anything, make every line of it
a check that runs, and change the work only until those checks pass. The spec
says what must be true; the checks prove it; the change is the smallest thing
that turns them green. A request usually names only the new behavior ("X
should become Y"). What breaks is everything next to it that the request takes
for granted, and the open cases someone decides silently while writing the
change. This skill makes both explicit.

A **check** is anything that returns pass or fail without your judgment: an
automated test, a script, a query with an expected result, a validator, a
diff against a known-good copy. Where nothing can be automated (a runbook, a
spec, a release procedure), a check is a criterion a fresh reader can apply to
the artifact and answer yes or no.

## Workflow

**Gate: what this skill does not own.** If the direction is not settled (what
to build and why is still open), call the Skill tool with
`legion:brainstorming`; the approved design doc is this skill's spec. If
something behaves wrongly and the cause is unknown, call the Skill tool with
`legion:debugging`; its reproduction is the failing check here once the cause
is known. If the work is finding vulnerabilities in existing work rather than changing
it, call the Skill tool with `legion:auditing-security`. If the work has many
steps and no plan, offer `legion:planning`
and build one plan step at a time with this skill. A change with no behavior
to check (a typo, a comment, a rename the tooling verifies) is done directly.

1. **Read before writing.** Read the spec or request, the current work it
   changes, and the checks that already exist for it. Find how this project
   runs its checks (its scripts, wrappers, CI configuration, README) and use
   those commands; never assume a default such as `npm test`. Read the code
   path or the artifact itself, not only its tests: the rules the change can
   break are often enforced in the work (an anchored pattern, an explicit
   guard, a required field) and tested nowhere.
2. **Write the criteria**, before any change, in three groups. Each line is a
   situation and its expected result, specific enough to check ("`'1.5h'`
   returns 5400", not "handles decimals"):
   - **New**: every behavior the spec or request asks for, one line each.
   - **Unchanged**: the existing behavior the change touches and must keep,
     above all what step 1 found enforced but unchecked.
   - **My call**: every case the request leaves open (other inputs of the
     same kind, empty and boundary values, what happens on invalid input),
     each with the answer you assume, for the user to confirm or correct.

   When the change accepts input or actions from someone less trusted than
   what it affects (another user or tenant, another process, an uploaded
   file, a model's output), add **New** lines for misuse next to the use
   cases: how each input could be abused, and the refusal you expect
   ("another customer's invoice id returns 404"). Read
   [references/trust-boundaries.md](references/trust-boundaries.md) when the
   change handles permissions, file paths it deletes or writes, outbound
   requests, secrets, dependencies, rate limits, or model output.

   Vague goals become measurable lines ("faster" becomes "the page loads in
   under 2 s on the reference data"). When a "my call" changes what gets
   built rather than an edge of it, ask before building; otherwise state it
   and proceed. Where the criteria live depends on size (table below); when
   the spec is a file, copy [assets/spec-template.md](assets/spec-template.md),
   which also has the delta form for changing work that already shipped.
3. **Turn every line into a check: the unchanged ones all at once, the new
   ones one slice at a time.** Read
   [references/writing-checks.md](references/writing-checks.md) when
   choosing the level of a check or deciding whether to fake a dependency.
   Before writing each check, name the wrong change to the work that would
   make it fail (a `>` for `>=`, a dropped guard, a default return). A check
   you cannot name one for catches nothing; one that only a deliberate
   redesign would fail (a constant's value, exact wording) catches no bug.
   - **Unchanged** checks come first, all of them, and must pass on the
     current work before anything changes. They describe behavior that
     exists, so writing them up front costs nothing. One that fails means
     the work does not behave as you thought: stop and report it before
     changing anything.
   - **New** checks (and the "my call" lines) go one criterion at a time
     when there are several: write the check for the next criterion, run it
     red, make it green (step 4), then write the next. A batch of new checks
     written before any of them is built pins the interface you imagine,
     not the one the first slices produce; the later checks then get bent to
     fit, or test a shape nobody calls. With a single criterion, the slice
     is the whole change.
   - Each new check must fail, for the expected reason (the behavior is
     missing, not a typo in the check). A new check that passes before the
     change proves nothing: fix the check or find out why the behavior
     already exists.
   - When the change already exists (the user wrote it, or you explored
     first), prove each new check by taking the change out: the check must
     fail without it and pass with it. Without that run, the check has only
     ever agreed with the work.
   - Where nothing can run (code pasted inline, no environment, no access),
     write the checks with their expected results and say they were not run.
4. **Make the least change that turns the current slice's check green**,
   then run the focused checks so far (every Unchanged check and the new
   ones already built) before starting the next slice. Anything the criteria
   do not ask for is out of scope, however small; an idea that comes up goes
   to the spec's Deferred list, not into the work.
5. **Refactor with the checks green.** Improve names, remove duplication,
   simplify; run the checks after each step, and change no behavior here.
6. **Verify and report.** Run the project's full check suite and the other
   gates it accepts work through (its build, linters, validators, whatever
   its CI or review runs), not only the focused checks. A new warning in
   their output is a failure to fix or report, and debug output or
   temporary scaffolding left in the work is Extra. Then review the result
   against the spec, not against your memory of it:
   - **Missing:** a criterion with no passing check, or claimed without one.
   - **Extra:** anything the work now does that no criterion asks for.
   - **Misread:** a check that passes but tests a different reading of the
     criterion than the spec's words.
   - **Unguarded:** go over the change line by line and imagine it wrong (a
     flipped comparison, a skipped branch, an empty or default result, no
     validation of empty, zero, or invalid input). Each realistic slip that no
     check would catch gets a check, or a line in the report.

   Fix what this finds, then report in the output format below.

| Size | Where the criteria live | Before the change |
|---|---|---|
| One behavior change | The three groups in your reply | Proceed; the "my call" lines are the user's to correct |
| A feature or several changes | A spec file in `.legion/specs/YYYY-MM-DD-<topic>-spec.md` (unless the project keeps specs elsewhere or uses its own spec tool) | The user approves the spec, unless it is an already approved design doc or plan step |
| Several capabilities, each of which could ship and be checked without the others | One spec per capability, and a short list of them in build order, each after what it depends on | The user approves the list, then each spec as above; offer `legion:planning` when the order needs more than a list |
| Change to shipped work that has a spec | A delta spec next to the original | Approval as above; after the change ships, fold it into the original spec |

When a spec needs approval, present it with its "my call" lines and end
the turn; build in a later turn, after the user approves. Building in the
same turn makes the approval a formality: every "my call" the user would
have corrected is already in the work.

## Keeping the spec true

- When a decision changes mid-work (the data model needs another field, a
  criterion proves wrong), update the spec first, then the checks, then the
  work. A spec that disagrees with the work misleads the next change.
- Scope moves between versions, not during one: a new idea goes to Deferred
  with one line of why, and comes back as its own spec or delta.
- For a feature-sized change, a check written by someone who has not seen
  the implementation tests the spec rather than the code. When that matters,
  dispatch a fresh `general-purpose` subagent on tier `session` with only the
  spec, the criterion of the next slice, and the paths to the existing
  checks, and have it write that slice's checks; run them red, then build
  the slice. Continue the same subagent for later slices, so it keeps the
  spec without ever seeing your implementation.

## Gotchas

- The example in the request is one criterion. The behavior next to it that
  nobody mentioned is where the regression lands; the Unchanged group exists
  for it.
- A check that fails because it cannot load or compile has not shown the
  behavior is missing. Make it fail on the assertion, or say that the
  missing function is the expected failure.
- Never loosen, skip, or delete a failing check to reach green, and never
  edit a check's expected result to match what the change produced. Either
  the work is wrong or the criterion is; if it is the criterion, update the
  spec and tell the user.
- Re-running an unchanged check suite after a clean run adds nothing. Run it
  again after a change, not for reassurance.
- "All checks pass" is a claim about a run. Quote the command and its
  result; a check that was not run is reported as not run. Every failure
  in the full run goes in the report by name, including one the change did
  not cause: a red line left out makes the report false by omission.
- "No tests needed" on a behavior change is a request to skip the cheap
  control, not a reason to drop the method. Give the change first, then the
  few check cases that would catch it being wrong (two or three lines with
  expected results, no suite), with one line on why. Drop even those if the
  user insists after seeing them.
- Trust follows who wrote a value, not the channel that delivered it. A
  value read from another process's command line, a shared folder, a job
  queue, or an imported file is as untrusted as a form field when someone
  less trusted could have written it.
- A "my call" you did not write down is a requirement the user could not
  reject. Every assumed answer goes in the report.

## Output format

```markdown
**Spec:** <path, or "inline below">

| # | Criterion | Group | Check | Before | After |
|---|---|---|---|---|---|
| 1 | <situation -> expected result> | New / Unchanged / My call | <test name, command, or reader criterion> | fail / pass / not run | pass / not run |

**Ran:** `<full-suite command>` -> <result line>
**My calls to confirm:** <each assumed answer, and what breaks if it is wrong, one line each>
**Deferred:** <ideas left out, one line each> (omit if none)
```

For a change where nothing could run, the Before and After columns say
`not run`, and the checks themselves follow the table.
