# Backward planning

Start from the finished state and work back to today: each milestone's
prerequisites become the milestone before it. Then turn the chain forward,
estimate it, and decide how much of it to detail now. The lenses apply at
every node; this is where they meet.

## Procedure

1. **Write the done state** (begin with the end): what is true on the last
   day, observable by someone else, with its acceptance criteria (definition
   of done) and the outcome it serves (outcome vs. output).
2. **Ask "what must be true just before this?"** The answers are the
   prerequisite milestones, each with its own done criterion. Repeat from each
   one until you reach what is already true today. Where several
   prerequisites are independent, they branch and can run in parallel.
3. **Cut what does not lead to the done state** (saying no): anything in the
   request or the source that no milestone needs goes into the plan's `Not
   doing` line, with what it would cost, so the user decides.
4. **Turn it forward.** Order milestones from today. Mark the critical path,
   the longest chain of dependent steps, which sets the end date. Within
   what dependencies allow, put first the steps that carry most of the value
   or retire the biggest risk (leverage).
5. **Estimate from evidence** (planning fallacy): each step from past data or
   comparable work, not the best case; where there is none, say so and use a
   range. Sum the critical path, then add buffer where it protects the end
   date (at the end of the critical path and before hard dates), not as
   padding hidden in every step.
6. **Detail to the horizon** (rolling wave): steps in the near horizon get
   full detail; later milestones keep their outcome, done criterion, rough
   size, and the checkpoint at which they get detailed.
7. **Place checkpoints**: at each milestone and at short regular intervals,
   compare actual against plan. Name the replan triggers: the critical path
   slips past its buffer, an assumption breaks, or a done criterion turns
   out wrong.
8. **If the chain does not fit the deadline or the resources**, the gap is a
   trade-off for the user (scope, date, people, money), never a reason to
   shrink estimates until it fits.

## Output format

Working notes for the plan's header and milestones:

```
Done state: <what is true on the last day> (done when: <criterion>)
<- M3: <milestone> (done when: <criterion>) [critical]
<- M2a: <milestone> [critical]   M2b: <milestone> (slack: <amount>)
<- M1: <milestone> (done when: <criterion>) [critical]
<- Today: <what is already true>
Critical path: M1 -> M2a -> M3 = <sum>; buffer: <amount, where>
Detailed to: <milestone>; next detailing at: <checkpoint>
```

## Gotchas

- Planning forward from today fills the plan with what is easy to start, not
  what the end needs.
- A milestone without a done criterion cannot be worked back from; its
  prerequisites are guesses.
- A prerequisite that is a person's decision or someone else's delivery is a
  milestone too, with an owner and a date, and is often on the critical path.
- Buffer that every step quietly carries gets spent by every step; visible
  buffer on the critical path gets managed.
