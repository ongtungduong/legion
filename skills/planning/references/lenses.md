# Planning lenses in depth

The procedure behind each lens in SKILL.md. Run the lens in front of you, not
all fifteen; each stops where it no longer changes a step, an order, or an
estimate.

## What each lens forces

| Group | Lens | What it forces | Steps |
|---|---|---|---|
| Outcome and backward | Begin with the end | The finished state is defined first; milestones are worked back from it | 3 |
| Outcome and backward | Outcome vs. output | Every task says what it contributes to the outcome; finished tasks are not the goal | 3-4 |
| Outcome and backward | Definition of done | Every task has a checkable acceptance criterion and clears the standing bar | 2, 4-6 |
| Execution | Working state | Every task leaves the work usable and consistent, never half-changed until a later task lands | 4 |
| Execution | Shared decisions first | What several tasks rely on (an interface, a format, a venue, a budget line) is fixed before the tasks that use it | 4 |
| Execution | Reversible change | A change that cannot be taken back is staged, with a way back and a signal to go on | 5 |
| Prioritization and trade-off | Saying no | The plan states what it will not do and what each inclusion displaces | 3 |
| Prioritization and trade-off | Leverage | The tasks that carry most of the value or retire the biggest unknown go first | 4 |
| Prioritization and trade-off | Critical path | The chain of dependent tasks that sets the end date is marked; parallel streams are named | 3-4 |
| Realism and risk | Planning fallacy | Estimates come from evidence of similar work, not the best case | 3 |
| Realism and risk | Pre-mortem | Assume it failed; each likely reason gets a countermeasure built in now | 7 |
| Realism and risk | Buffer | No plan runs at full capacity; visible buffer protects the end date | 3 |
| Adaptive and iterative | Plan as compass | Assumptions are written down, so a change is a deliberate replan, not drift | 6, 9 |
| Adaptive and iterative | Rolling wave | Near work in full detail, far work as milestones detailed later | 3, 6 |
| Adaptive and iterative | Checkpoints | Every few tasks the whole is checked and actual is compared against plan | 3, 6 |

## Outcome and backward

### Begin with the end

1. Describe the finished state as it will be on the last day: what exists,
   what has changed, who can do what they could not before.
2. Make it observable by someone who was not involved.
3. Work back from it (references/backward-planning.md), not forward from what
   can start today.

- "Launch the thing" is an event; the end state is what is true after it.

### Outcome vs. output

1. Name the outcome the plan exists for: the change in the world, not the
   deliverables.
2. For every step, answer "what does this contribute to the outcome?" in one
   line. A step that cannot answer is cut, deferred, or questioned.
3. Measure progress by outcome signals where they exist, not by steps
   completed.

- A plan can finish every step and miss the goal. Ask which steps would still
  be needed if the outcome were reached another way.

### Definition of done

1. For every milestone and step, write the condition under which someone else
   would accept it as done, with what "passed" looks like.
2. Replace activity words ("optimize", "prepare", "refactor", "wire up",
   "improve") with the result and its threshold.
3. Where a criterion depends on a judgment, name who judges and against what.
4. Above the per-task criteria sits the standing bar (what the house rules,
   policies, contributing docs, or CI require of every result).
   Copy it once into Global constraints; every step inherits it, so steps
   do not repeat it.

- Acceptance criteria answer "did we build this?"; the standing bar answers
  "is it finished to this project's standard?". A step needs both.
- A done criterion nobody can check is a hope; it surfaces at the end, when it
  is most expensive.

## Execution

### Working state

1. After every task the work is usable and consistent: nothing is left
   half-changed until a later task lands, and the task could be accepted on
   its own.
2. A task that leaves something broken until a later task lands is
   reordered (the later part first), split differently, or kept out of use
   until it is whole (for code, behind a flag).
3. Name the check that proves it in the task, with the expected result.

- "It will all fit together once task 5 is in" means tasks 1 to 4 cannot be
  reviewed, accepted, or undone on their own.
- For code this means the build and checks stay green after every task;
  `engineering.md` beside this file has the details.

### Shared decisions first

1. From the dependency graph, find what several tasks rely on: an
   interface or file format, a template, a venue and date, a budget line,
   a naming scheme.
2. Decide each one in an early, small task whose Produces line states it
   exactly; later tasks build against that line, not against a guess.
3. After that task, tasks that only depend on it can run in parallel
   (separate people or agents); mark them.

- Two parallel streams that each "settle the format as needed" produce two
  formats.

### Reversible change

1. For each task, ask what cannot be taken back once it is done: data
   written in a new shape, an interface others use, money paid, a contract
   signed, an announcement made.
2. Where something cannot, stage it: the reversible part first, a point to
   confirm, then the irreversible part (for a schema or API change:
   expand, migrate, switch, contract, per `rollout-safety.md` beside this
   file).
3. Give each staged task its way back or its limit, and the signal that
   says it is safe to go on.

- Redeploying old code does not undo data written in a new shape, and a
  retraction does not undo an announcement.

## Prioritization and trade-off

### Saying no

1. List what the plan will not do, including requests and nice-to-haves
   that no milestone needs.
2. For each inclusion that competes for the same people, time, or money, name
   what it displaces (opportunity cost).
3. Put the cuts in the plan's `Not doing` line; the user agrees to them,
   since a silent cut is a dropped requirement.

- A plan that includes everything has not been prioritized; it has been
  listed.

### Leverage

1. Score each step on the share of the outcome it delivers, roughly.
2. The few steps that carry most of the value get the best people and go as
   early as dependencies allow.
3. The low-value tail is named and proposed for later, not spread across the
   schedule.

- Effort is not value: the hardest step is often not the one that matters
  most.

### Critical path

1. From the dependencies, find the longest chain of steps that must happen in
   sequence; it sets the end date.
2. Mark it in the plan. Steps off it have slack: say how much.
3. Put attention, buffer, and the strongest owners on the critical path; a
   delay there delays everything, a delay elsewhere may not.

- Dependencies are not the only constraint. Two steps that need the same
  person, team, or resource cannot run in parallel; a shared resource turns
  branches into a sequence and lengthens the path.
- The critical path moves when estimates or dependencies change; re-check it
  at every checkpoint.
- Waiting (approvals, deliveries, lead times) belongs on the path as steps
  with durations, not as gaps.

## Realism and risk

### Planning fallacy

1. Estimate from what similar work actually took (past records, comparable
   projects, the people who did it), not from how it should go. Name the
   source you read; your own sense of how long things take is judgment, not
   history.
2. Where no history exists, give a range, mark its basis "judgment", and
   ask the people who will do the work, starting with the critical path.
3. Check the total against the outside view: how long do plans like this
   usually take, here or elsewhere?

- The best case feels like the typical case to the person estimating.
- Estimates squeezed to fit a deadline are a scope or date conversation that
  did not happen.

### Pre-mortem

1. Assume the plan was carried out and the goal failed badly, well into the
   future.
2. List five or more reasons, each naming the step, party, or assumption at
   fault, and rate each for likelihood and damage (high, medium, low).
3. Keep the ones with the highest likelihood times damage. Give each a
   countermeasure built into the plan now: a check in its step, a
   reordered step, a buffer, a watch point, or a question for the user.

- Generic risks ("delays", "scope creep") change nothing; a reason that names
  no step gets no countermeasure.

### Buffer

1. Do not schedule people or the timeline at full capacity; a plan with no
   spare room breaks at the first surprise and the delay cascades.
2. Size the buffer to the uncertainty: more for new work, outside
   dependencies, and long chains; when there is no history, a share of the
   critical path such as 15-20% is a common starting point.
3. Place it visibly where it protects the end date: at the end of the
   critical path and before hard dates, with a rule for who may spend it.

- Buffer is not a target. Track how fast it is being used; burning it early
  is a replan signal.

## Adaptive and iterative

### Plan as compass

1. Write down the assumptions the plan rests on, next to the steps that
   depend on them.
2. When reality differs, change the plan deliberately: say what changed,
   which steps and dates it moves, and get agreement, instead of drifting.
3. Keep the goal and done state fixed unless the user changes them; steps
   and dates are what move.

- A plan followed after its assumptions broke is worse than no plan: it
  carries the work confidently in the wrong direction.

### Rolling wave

1. Split the plan into a near horizon and a far one, sized to how far ahead
   the information is reliable.
2. Detail the near horizon fully: steps, owners, dates, done checks.
3. Keep the far horizon at milestone level: outcome, done criterion, rough
   size. Name the checkpoint at which each far milestone gets detailed.

- Detailing far work early spends effort on guesses and anchors people to
  them.

### Checkpoints

1. Set short, regular checkpoints and one at each milestone.
2. At each, compare actual against plan: done criteria met, critical path
   position, buffer used, assumptions still true.
3. Name in advance what triggers a replan, so the decision is not left to
   mood.

- A checkpoint that only reports status changes nothing; each one ends in
  "continue", "adjust", or "replan".
