---
name: planning
description: >-
  Turns a settled goal, approved design, or clear requirements into a
  detailed plan of steps that gets the work done, in any domain: worked back
  from the done state, each step with its outcome, concrete actions, owner,
  dependencies, a done-check that can be verified, and an evidence-based
  estimate, with the critical path, buffer, and checkpoints marked, ordered
  so the first steps deliver most of the value, and stress-tested with a
  pre-mortem. Use when the direction
  is settled and the next step is laying out how to get there, including
  "write the plan", "break this into steps or tasks", "how do we get this
  done", "plan the rollout", "plan backward from the deadline", "what is
  the critical path", or "turn this proposal into a work plan", before the
  work starts.
license: MIT
metadata:
  author: ongtungduong
---

# Planning

Write the plan for a capable person who has never seen this work or its
background. They will carry out a step well once they know exactly what it
must produce and how its completion is checked; what they cannot know is what
was decided: names, numbers, dates, owners, interfaces, and the checks that
prove each step. Write those down, and nothing they could decide alone.

## Backward planning and the lenses

The method that carries the lenses is **backward planning**: from the done
state, ask "what must be true just before this?" milestone by milestone back
to today, then turn the chain forward, estimate it, and detail it to the
horizon. Read [references/backward-planning.md](references/backward-planning.md)
and run its procedure at step 3.

Twelve lenses in four groups. Use each where it changes a step, the order, or
an estimate, and drop it where it does not; they are not headings in the plan.
When a lens needs depth, read [references/lenses.md](references/lenses.md)
for its procedure.

| Group | Lens | What it forces | Steps |
|---|---|---|---|
| Outcome and backward | Begin with the end | The finished state is defined first; milestones are worked back from it | 3 |
| Outcome and backward | Outcome vs. output | Every step says what it contributes to the outcome; finished steps are not the goal | 3-4 |
| Outcome and backward | Definition of done | Every milestone and step has a checkable acceptance criterion, not an activity word | 4-5 |
| Prioritization and trade-off | Saying no | The plan states what it will not do and what each inclusion displaces | 3 |
| Prioritization and trade-off | Leverage | The few steps that carry most of the value go first and get the best resources | 4 |
| Prioritization and trade-off | Critical path | The chain of dependent steps that sets the end date is marked and protected | 3-4 |
| Realism and risk | Planning fallacy | Estimates come from evidence of similar work, not the best case | 3 |
| Realism and risk | Pre-mortem | Assume it failed; each likely reason gets a countermeasure built in now | 6 |
| Realism and risk | Buffer | No plan runs at full capacity; visible buffer protects the end date | 3 |
| Adaptive and iterative | Plan as compass | Assumptions are written down, so a change is a deliberate replan, not drift | 5, 8 |
| Adaptive and iterative | Rolling wave | Near work in full detail, far work as milestones detailed later | 3, 5 |
| Adaptive and iterative | Checkpoints | Short cycles compare actual against plan, with replan triggers named in advance | 3, 5 |

## Plan size

| Size | When | What applies |
|---|---|---|
| Small | Up to about five steps, one owner or a fixed team, done within days | Done state, `Not doing`, and the step list. The step order is the critical path; buffer is one line; no rolling wave; the only checkpoint is the end. Pre-mortem: one or two reasons. Template header: Goal, Done state, Source, Not doing; drop the other header fields and the sections that would stay empty |
| Project | More steps, several owners, outside dependencies, or weeks of work | Everything in this skill and the full template |

## Workflow

**Gate: a settled direction comes first.** If what to do and why is still
open (only a request such as "plan X" with no agreed goal or design), call
the Skill tool with `legion:brainstorming` and plan only after the direction
is settled. A plan built on guessed intent pins every guess into steps,
owners, and dates.

1. **Scope check and size.** If the goal covers several independent streams
   of work, propose one plan per stream; each must deliver something usable
   alone. Then say the plan's size (table above); it sets how much of steps
   3 to 7 applies. If the work grows mid-plan, step up a size.
2. **Map what the work touches:** the deliverables, people or roles,
   systems, documents, and resources, each with one responsibility. Follow
   the conventions that already exist where the work happens. Mark the
   parties outside the doers: who must agree (each approval becomes a step
   with an owner and a date), who must be told before a change reaches them
   (the telling goes into the step that makes the change), and who is
   affected without being asked.
3. **Work back from the done state**, per
   [references/backward-planning.md](references/backward-planning.md): the
   milestone chain, what is not being done, the critical path, estimates with
   buffer, the detail horizon, and the checkpoints.
4. **Slice the near milestones into steps that each deliver something.**
   Each step ends in a result someone can check, not in an activity ("draft
   sent for sign-off", not "work on the draft"). The first step is the
   thinnest end-to-end pass that proves the approach works. Size each step;
   split anything large:

   | Size | Rough effort | Example |
   |---|---|---|
   | XS | under an hour | Send one decision for sign-off |
   | S | up to a day | One document section, one endpoint |
   | M | a few days | One workstream milestone, one feature slice |
   | L, XL | a week or more | Split it |

   Say why the first steps come first in the plan's `Order` line. Name the
   low-value tail and, at hand-off, propose moving it to a later plan; the
   agreed scope stays until the user agrees.
5. **Write the plan** from [assets/plan-template.md](assets/plan-template.md)
   into `.legion/plans/YYYY-MM-DD-<topic>.md` (unless the user or the project
   prefers another place). Copy the source's work-wide requirements verbatim
   into Global constraints, write the assumptions the plan rests on, and list
   in Watch points up to five situations the source implies but never
   states, each with the step that handles it. Every detailed step decides
   exactly one thing, at the precision the work needs: the outcome and its
   exact values (names, numbers, dates, owners), the actions, and a
   done-check with what "passed" looks like. For software that means the
   exact files, interfaces, and the failing test the step starts with and
   ends green, each step a slice through every layer it touches rather than
   one layer at a time; for other work, the document, decision, or measure
   that proves it. A reference to
   another step points at that step's Produces line.
6. **Pre-mortem.** Assume the plan was carried out exactly and the goal still
   failed: rejected, late, broken, or unused. List five or more candidate
   reasons, each naming the step, party, or assumption at fault, and rate
   each for likelihood and damage (high, medium, low). Keep the three with
   the highest likelihood times damage (one or two for a small plan) in the
   plan's `Pre-mortem` section with their ratings, and give each a
   countermeasure: a check in its owning step, a Watch point, a reordered
   step, buffer, or a question for the user at hand-off.
7. **Self-review, then fix inline:**
   - [ ] every requirement of the source maps to a step or to `Not doing`,
         and every step's done-check names the requirement it serves;
   - [ ] every step says what it contributes to the outcome;
   - [ ] no step decides nothing ("handle edge cases", "TBD", "coordinate");
   - [ ] names, numbers, and dates in later steps match what earlier steps
         produce;
   - [ ] every file, system, person, or command a step names exists as
         written, so no step sends the executor after a guess;
   - [ ] every estimate names its basis: a source you actually read, or
         "judgment" with a range;
   - [ ] every party who must agree or be told appears in a step;
   - [ ] (project) the critical path is marked, accounts for shared people
         or resources, and buffer protects the end date;
   - [ ] (project) every far milestone has a done criterion and the
         checkpoint where it gets detailed;
   - [ ] every Watch point has its step, and every pre-mortem reason has a
         countermeasure in the plan.
8. **Hand off.** Link the plan and ask the user to review it. Ask the
   decisions only the user can make as one selection call (`AskUserQuestion`
   in Claude Code, up to 4 questions; carry the rest): the low-value tail and
   each `Not doing` item (defer or keep), the pre-mortem questions, and the
   approval itself (approve, or change something). Each question stands
   alone, since the dialog may hide the plan text; put your recommendation
   first, labeled "(Recommended)", with its reason and what it costs in the
   description. Estimates on the critical path whose basis is "judgment"
   go in the same call: confirm the range, or the user gives a number from
   their experience. Without a selection tool, ask the same questions as
   text with lettered options. Do not start the work until the user has approved
   the plan. When a checkpoint later hits a
   replan trigger, update the plan deliberately: what changed, what moves,
   and the user's agreement.

## Gotchas

- Name drift between steps ("launch checklist" in step 3, "go-live list" in
  step 7) is the most common plan bug; the Produces lines exist to catch it.
- A plan longer than the work it describes has done the work instead.
  Replace bodies with outcomes and checks.
- Layered steps ("all research", then "all writing", then "all review")
  cannot be checked until the end, so mistakes surface late.
- A pre-mortem of generic risks ("delays", "bugs") changes nothing. A reason
  that names no step, party, or assumption, and so gets no countermeasure,
  should be replaced with a specific one.
- Setup and preparation folded into the step that needs them beat standalone
  "setup" steps that no reviewer can meaningfully reject.
- Owners and dates you do not know are open questions for the user, not
  values to invent. The same holds for estimates: "from comparable work"
  written over a number you did not take from a source is an invented
  value with a citation attached.
