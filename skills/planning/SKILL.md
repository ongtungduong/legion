---
name: planning
description: >-
  Turns an approved design, a settled goal, or clear requirements into a
  plan of small, concrete tasks, in any domain: each task produces one
  checkable result, names its inputs, what it depends on, what may run
  beside it, and how its done state is checked, ordered by dependency with
  shared decisions first, worked back from the done state, with checkpoints,
  a reversible path for what cannot be taken back, and a pre-mortem. For
  software, infrastructure, or data work it reads the commands and paths of
  the repo and keeps every step green and safe to ship. Use when the
  direction is settled and the next step is the order of work: "write the
  plan", "break this into tasks", "split this into small steps", "sequence
  the PRs", "plan the rollout", "plan backward from the deadline", "what is
  the critical path", "so several agents can work in parallel", for a
  feature, a refactor, an event, a launch, a process change, or a hire, even
  when the work looks small enough to just do.
license: MIT
metadata:
  author: ongtungduong
---

# Planning

Write the plan for a capable doer, a person or an agent, who has never seen
the conversation behind it. They will carry out a task well once they know
exactly what it must produce and how it is checked; what they cannot know is
what was decided, what the surrounding system or organization already
enforces, what each task depends on, and which tasks may run at the same
time. Write those down, and nothing they could decide alone.

The plan's unit is the **task**: small enough for one doer in one sitting
(one context window for an agent), producing one result someone else can
check. How the tasks are then carried out (by you, by people, or by
subagents) is decided after approval, not in the plan.

Planning is read-only: nothing is built, booked, sent, or changed until the
user approves the plan, since work done now pins choices the review has not
seen.

## Backward planning and the lenses

The method that carries the lenses is **backward planning**: from the done
state, ask "what must be true just before this?" milestone by milestone back
to today, then turn the chain forward, estimate it, and detail it to the
horizon. Read [references/backward-planning.md](references/backward-planning.md)
and run its procedure at step 3.

Fifteen lenses in five groups. Use each where it changes a task, the order,
or an estimate, and drop it where it does not; they are not headings in the
plan. When a lens needs depth, read [references/lenses.md](references/lenses.md)
for its procedure.

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

## Plan size

| Size | When | What applies |
|---|---|---|
| Small | One coherent change or deliverable: up to about five tasks, one team or doer, nothing irreversible, done within days | Done state, `Not doing`, Checks, and the task list. The task order is the critical path; buffer is one line; no rolling wave; the only checkpoint is the end. Pre-mortem: one or two reasons. Template header: Goal, Done state, Source, Checks, Not doing; drop the other header fields and the sections that would stay empty |
| Project | Several deliverables, teams, or systems, an irreversible step, several people or agents, outside dependencies, or weeks of work | Everything in this skill and the full template |

## Workflow

**Gate: a settled direction comes first.** If what to do and why is still
open (only a request such as "plan X" with no agreed goal, spec, or design),
call the Skill tool with `legion:brainstorming` and plan only after the
direction is settled. A plan built on guessed intent pins every guess into
tasks, owners, and dates. Make that call before you write any question to
the user: a list of questions from here is your framing of the goal, while
brainstorming asks one at a time in the user's words and settles the rest.
If the work is a software, infrastructure, or data defect whose cause is
unknown, call the Skill tool with `legion:debugging` first; a plan for a fix
needs the cause.

1. **Scope check and size.** If the work covers several independent streams,
   propose one plan per stream; each must deliver something usable alone.
   Then say the plan's size (table above); it sets how much of steps 3 to 8
   applies. If the work grows mid-plan, step up a size.
2. **Read the facts before planning.** Tasks written from the goal alone
   name things that do not exist, checks nobody runs, and changes the
   surroundings cannot absorb. Read, and record what you found:
   - the spec or design, and the closest piece of past work done the same
     way: its structure is the pattern the new tasks follow;
   - the standing bar every result must clear (house rules, templates,
     policies, contributing docs, approval rules): it goes into Global
     constraints verbatim, as the definition of done every task inherits;
   - the checks that already exist and how results are accepted (a review,
     a sign-off, a test suite, a budget approval);
   - who depends on what changes, and what cannot be taken back once done;
   - existing plans in `.legion/plans/` and the project's tracker. An
     unfinished plan for other work is never overwritten: it may be in
     progress in another session. A replan of the same work updates it in
     place;
   - the parties outside the doers: who must approve (each approval becomes
     a task), and who must be told before a change reaches them (that
     telling goes into the task that makes the change).

   When the work changes software, infrastructure, or data, read
   [references/engineering.md](references/engineering.md) now: it names
   what to read in the repo (code paths, the project's own commands, deploy
   style, consumers) and the engineering rules for steps 4, 5, and 8. If a
   fact cannot be found, it is an assumption in the plan and a question at
   hand-off, not a default.
3. **Work back from the done state**, per
   [references/backward-planning.md](references/backward-planning.md): the
   milestone chain, what is not being done, the critical path, estimates with
   buffer, the detail horizon, and the checkpoints.
4. **Order by dependency, then break into small tasks.** Draw the dependency
   graph of what the work changes or produces. Fix the decisions several
   tasks share first, as their own small task, so later tasks build against
   a decided answer and can run in parallel. Then break the near milestones
   into tasks that each deliver one working result end to end, not one layer
   or one department at a time. The first task is the thinnest pass that
   proves the approach, or a timeboxed probe of the biggest unknown.

   A task is small enough when one doer can finish it in one sitting and
   someone else can check it against its Done line. Split a task whose
   acceptance needs more than three bullets, that touches two independent
   areas, whose title needs an "and", or that would take a person more than
   a day or an agent more than one context window. Each task states:
   - **Produces**: the exact result later tasks rely on (a name, a
     document, a decision, an interface, a booking);
   - **Inputs**: pointers to what it reads (files, documents, earlier
     tasks' Produces lines), so a doer with no history can start;
   - **Depends on / Parallel with**: earlier tasks, and the tasks it may
     run beside once its inputs exist;
   - **Scope**: what it may change, and what it must leave alone;
   - **Done when**: the checkable condition, and the check that shows it.

   Mark what must run in sequence (shared state, a chain of dependencies,
   anything two doers would change at once) and say why the first tasks
   come first in the plan's `Order` line. Name the low-value tail and, at
   hand-off, propose moving it to a later plan; the agreed scope stays until
   the user agrees.
5. **Make irreversible changes reversible.** A task that cannot be taken
   back once done (stored data in a new shape, a public interface others
   use, money paid, a contract signed, an announcement made) is staged:
   the reversible part first, a point to confirm, then the irreversible
   part, with what undoes or limits it and the signal that says it is safe
   to go on. For a schema, data, API, config, or infrastructure change, read
   [references/rollout-safety.md](references/rollout-safety.md).
6. **Write the plan** from [assets/plan-template.md](assets/plan-template.md)
   into `.legion/plans/YYYY-MM-DD-<topic>.md`, unless the project names
   another place or a tracker (then one tracker item per task, with the plan
   file as the ordered index). Copy the work-wide requirements and the
   standing bar from step 2 verbatim into Global constraints, list the
   checks, the decisions with their reason, and the assumptions, and list in
   Watch points up to five situations the spec implies but never states,
   each with the task that handles it. Every detailed task decides exactly
   one thing, with the fields from step 4 and its rollback when step 5
   applies. A reference to another task points at that task's Produces
   line. Place a checkpoint every two or three tasks and at each milestone:
   the whole checked end to end, and a review before the next tasks.
7. **Pre-mortem.** Assume the plan was carried out exactly and the goal still
   failed. List five or more candidate reasons, each naming the task,
   decision, party, or assumption at fault, and rate each for likelihood and
   damage (high, medium, low). Keep the three with the highest likelihood
   times damage (one or two for a small plan) in the plan's `Pre-mortem`
   section with their ratings, and give each a countermeasure: a check in
   its owning task, a Watch point, a reordered task, a staged change,
   buffer, or a question for the user at hand-off.
8. **Self-review, then fix inline:**
   - [ ] every requirement maps to a task or to `Not doing`, and every
         task's Done line names the requirement it serves;
   - [ ] no task decides nothing ("handle edge cases", "TBD", "wire it up",
         "finalize details", "coordinate as needed");
   - [ ] every thing a task names exists as written or is produced by an
         earlier task's Produces line, and the names match;
   - [ ] every task is small enough by the step 4 rule, and its Inputs let
         a doer with no history start;
   - [ ] every task leaves the work usable, and the order honors the
         dependency graph; no two parallel tasks change the same thing;
   - [ ] every task that step 5 covers names its way back;
   - [ ] every estimate names its basis: a source you actually read, or
         "judgment" with a range;
   - [ ] every party who must approve or be told appears in a task;
   - [ ] (project) the critical path and the parallel streams are marked,
         and buffer protects the end date;
   - [ ] (project) every far milestone has a done criterion and the
         checkpoint where it gets detailed;
   - [ ] every Watch point has its task, and every pre-mortem reason has a
         countermeasure in the plan.
9. **Hand off.** Link the plan and ask the user to review it. Ask the
   decisions only the user can make as one selection call (`AskUserQuestion`
   in Claude Code, up to 4 questions; carry the rest): the low-value tail and
   each `Not doing` item (defer or keep), the pre-mortem questions, open
   facts from step 2, and the approval itself (approve, or change
   something). Each question stands alone, since the dialog may hide the
   plan text; put your recommendation first, labeled "(Recommended)", with
   its reason and what it costs in the description. Estimates on the
   critical path whose basis is "judgment" go in the same call. Without a
   selection tool, ask the same questions as text with lettered options.

   Do not start the work until the user has approved the plan. Then offer
   how to carry it out: when agents will do the tasks, call the Skill tool
   with `legion:orchestrating-subagents`, which takes the plan's tasks as
   its pieces and decides for each whether it runs inline or on a subagent,
   on which tier, and in which parallel group; for a task that builds or
   changes behavior in software, offer `legion:implementing-stdd` for that
   task. When a checkpoint later hits a replan trigger, update the plan
   deliberately: what changed, what moves, and the user's agreement.

## Gotchas

- The most common plan bug is a name that drifts between tasks (one name in
  task 3, another in task 6) or was never checked against what exists; the
  Produces lines and step 2 exist to catch it.
- A plan longer than the work it describes has done the work instead. Write
  results, inputs, and checks, not the content of each result.
- Layered or departmental tasks ("all the research", then "all the
  drafting", then "all the review") cannot be checked until the end, so
  mistakes surface late and nothing is usable alone.
- A task sized for a person can be too big for an agent: one context window
  is the agent's sitting. A plan that agents will carry out keeps every
  task within it, so each one can start fresh from its Inputs.
- A pre-mortem of generic risks ("delays", "miscommunication") changes
  nothing. A reason that names no task, decision, or assumption, and so gets
  no countermeasure, should be replaced with a specific one.
- Scope creep enters through Watch points. A situation the source implies
  is handled inside the task that owns it; something the source did not ask
  for (a hardening, a convenience, a format) is not a task but a question at
  hand-off, with your recommendation, until the user adds it.
- Setup folded into the task that needs it beats a standalone "setup" task
  that no reviewer can meaningfully reject.
- Owners and dates you do not know are open questions for the user, not
  values to invent. The same holds for estimates: "from comparable work"
  written over a number you did not take from a source is an invented
  value with a citation attached.
