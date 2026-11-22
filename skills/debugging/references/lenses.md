# Debugging lenses in depth

The procedure behind each lens in SKILL.md. Run the lens in front of you, not
all ten; each stops where it no longer changes the next probe.

## Evidence

### Facts vs. assumptions

1. Sort every statement about the problem into **observed** (output of the
   loop, a record, a measurement, a log line, a document, something a person
   saw first-hand) or **assumed** (anything believed because it "should" be
   so, "has not changed", or "always works").
2. Mark each assumption the reasoning depends on, and the cheapest
   observation that would confirm or refute it.
3. Check the load-bearing assumptions before building on them. An inference
   that rests on an unchecked assumption is itself an assumption.

- Reports from other people are evidence of what they saw, not of the cause.
  "It's the network" is a hypothesis however confident it sounds.
- Absence of evidence counts only if you looked where it would show.

### Falsification

1. For each hypothesis, state what you would observe if it were **false**.
2. Design the cheapest probe that could show that observation.
3. Run it. A hypothesis that fails the probe is dropped, however attractive.
   One that survives several attempts to kill it is a candidate cause, not
   yet a confirmed one; confirmed means a change at that point flips the
   loop from red to green and back.

- A probe that can only agree with you proves nothing. If every outcome
  "fits", the probe is not a test.
- Confirmation bias peaks at the hypothesis you proposed first; aim the
  hardest probe at it.

### Nothing is obviously fine

When the failure is strange (it contradicts how things are supposed to
behave, it happens in one place only, or every visible part checks out),
stop treating anything as beyond suspicion.

1. List what the failing path relies on but nobody has looked at: the most
   basic conditions (supply, connection, settings, dates and clocks, wear),
   the parts and services underneath, what others supply, and what people
   told each other.
2. For each, get one direct observation of how it actually behaves here, not
   what its label, documentation, or owner says.
3. Compare against a case where it works; a difference in something
   "obviously fine" is a lead.

- The simplest explanation is often the one skipped because it seemed too
  simple to check.
- A misunderstanding between two people is a cause like any other: check
  what each one actually understood, not what was said.
- The measuring tool is suspect too: a broken gauge or a stale report can
  show a failure that is not there, or hide one that is.

## Isolation

### Bisection

1. Define the two ends: a known-good point and the failing point. That can be
   along the path (where the input enters, where the wrong result comes out)
   or along time (the last good version, state, or date, and now).
2. Check the midpoint: is the state there still correct?
3. Keep the half that contains the change from good to bad; repeat until one
   step, component, or change remains. For code history, `git bisect run
   <loop command>` does this mechanically.

- Bisection needs a reliable verdict at each point; a flaky loop sends it the
  wrong way. Fix the loop first.
- If no known-good point exists, compare against a similar case that works
  instead; the differences are the search space.

### Minimization

Take away what surrounds the problem to see whether it survives, so the
search shrinks to what it actually needs. It is for an unordered set with no
midpoint to bisect; for a path or a history, use Bisection.

1. Start from the failing case with the loop running.
2. Remove or separate one element at a time (an input, an attachment, a
   setting, a stage, a participant) and re-run after each.
3. Keep the removal if the failure stays; restore the element if the failure
   goes away. It is load-bearing.
4. Stop when every remaining element is load-bearing.

- Check the minimized case still shows the user's symptom, not a nearby one.
- What you had to keep is often the answer: the cause lives where the
  load-bearing elements meet.

### One variable at a time

1. Before each run, name the one thing you are changing and what you expect.
2. Change only that; re-run the loop; record the result.
3. Revert it before the next change unless it is the fix.

- After several changes and a pass, you do not know which one mattered and
  may have added a new fault. Undo back to the last known state and redo one
  by one.

## Time and systems

### Delta

A system that worked and now fails has had something change, inside it or
around it.

1. Fix the moment it started as tightly as the evidence allows.
2. List every change near that moment: to the thing itself, its settings, its
   inputs and their volume, what it depends on, what depends on it, its
   environment, the people and rules around it, and time itself (expiry dates,
   schedules, limits reached by slow growth).
3. For each candidate, ask why it would break this and not everything else
   that also saw the change.

- "Nothing changed" means nothing you know of changed; widen where you look.
- Slow drift (growth toward a limit, wear, accumulation) is a change with no
  single moment; look at trends, not events.

### Bottom-up

Confirm the basic conditions before the complex ones, instead of jumping to
the part you suspect.

1. Name the levels the problem depends on, from the most basic (what must
   exist for anything to work at all) up through what connects the parts, to
   the parts themselves, to how they are used or decided.
2. Start at the bottom and confirm each level holds on this path before
   moving up.
3. The first level that fails is where to dig; everything above it may only
   be reacting.

- Skipping a level because it is "obviously fine" is an assumption; check it
  cheaply rather than not at all.
- When a lower level is expensive to check, note it as unverified and come
  back if the levels above hold.

## Probability and containment

### Common before rare

1. Before ranking hypotheses, list the causes this kind of failure usually
   has, and check those first.
2. Prefer the explanation that needs the fewest new assumptions; a rare or
   elaborate scenario earns attention only once the common ones are ruled
   out or the evidence points to it.
3. Weigh likelihood against cost: a likely cause that a quick check settles
   goes first.

- Rare causes are real; the point is order, not exclusion. Evidence that
  points to the rare cause overrides the base rate.

### Contain before fixing

While the failure is causing damage, the first job is to stop it spreading,
not to understand it.

1. Ask whether harm is ongoing or growing: people affected, money, data,
   safety, trust.
2. If so, contain: pause, roll back, switch to a fallback, cut off the
   affected part. Prefer actions that are reversible, and ask before one
   that is not.
3. Preserve the scene before touching more: record what it shows, the time,
   what is affected, and the current state of logs, settings, and items. A
   restart, cleanup, or reset can erase the evidence the cause needs.
4. Say containment is in place and what it costs, then find the cause.

- Containment that works is not a fix; the cause is still there, and the
  workaround tends to become permanent unless the root cause is found.
