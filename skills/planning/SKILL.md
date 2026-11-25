---
name: planning
description: >-
  Turns an approved design or clear requirements for engineering work (a
  feature, refactor, integration, infrastructure or data change) into a
  plan read from the codebase: the repo's own commands and
  real paths, steps ordered by dependency with shared contracts first,
  vertical slices that each leave the code compiling and checks green, a staged
  rollout with a rollback where old and new versions run side by side,
  parallel streams, checkpoints, and a pre-mortem. Use when the direction is
  settled and the next step is the order of work: "write the
  plan", "break this into tasks", "sequence the PRs", "plan the
  rollout", "what is the critical path", "so several agents can work in
  parallel", ahead of writing code, even when the change looks small enough
  to just code it.
license: MIT
metadata:
  author: ongtungduong
---

# Planning

Write the plan for a capable engineer, or an agent, who has never seen this
codebase or the conversation behind the spec. They will carry out a step well
once they know exactly what it must produce and how it is checked; what they
cannot know is what was decided or what the repo already enforces: file
paths, interfaces, names, the commands that prove a step, how the system is
deployed, and which steps are safe to run in parallel. Write those down, and
nothing they could decide alone.

Planning is read-only: no code, migration, or config is written until the
user approves the plan, since code written now pins choices the review has
not seen.

## Backward planning and the lenses

The method that carries the lenses is **backward planning**: from the done
state, ask "what must be true just before this?" milestone by milestone back
to today, then turn the chain forward, estimate it, and detail it to the
horizon. Read [references/backward-planning.md](references/backward-planning.md)
and run its procedure at step 3.

Fifteen lenses in five groups. Use each where it changes a step, the order,
or an estimate, and drop it where it does not; they are not headings in the
plan. When a lens needs depth, read [references/lenses.md](references/lenses.md)
for its procedure.

| Group | Lens | What it forces | Steps |
|---|---|---|---|
| Outcome and backward | Begin with the end | The finished state is defined first; milestones are worked back from it | 3 |
| Outcome and backward | Outcome vs. output | Every step says what it contributes to the outcome; merged PRs are not the goal | 3-4 |
| Outcome and backward | Definition of done | Every step has a checkable acceptance criterion and clears the project's standing bar | 2, 4-6 |
| Engineering | Working state | Every step leaves the system building, its checks green, and mergeable on its own | 4 |
| Engineering | Contract first | Shared interfaces (schema, types, API, event shape) are fixed before the slices that use them | 4 |
| Engineering | Reversible rollout | A change the running system or its data cannot take back ships in compatible stages with a rollback | 5 |
| Prioritization and trade-off | Saying no | The plan states what it will not do and what each inclusion displaces | 3 |
| Prioritization and trade-off | Leverage | The steps that carry most of the value or retire the biggest unknown go first | 4 |
| Prioritization and trade-off | Critical path | The chain of dependent steps that sets the end date is marked; parallel streams are named | 3-4 |
| Realism and risk | Planning fallacy | Estimates come from evidence of similar work, not the best case | 3 |
| Realism and risk | Pre-mortem | Assume it failed; each likely reason gets a countermeasure built in now | 7 |
| Realism and risk | Buffer | No plan runs at full capacity; visible buffer protects the end date | 3 |
| Adaptive and iterative | Plan as compass | Assumptions are written down, so a change is a deliberate replan, not drift | 6, 9 |
| Adaptive and iterative | Rolling wave | Near work in full detail, far work as milestones detailed later | 3, 6 |
| Adaptive and iterative | Checkpoints | Every few steps the full checks run and actual is compared against plan | 3, 6 |

## Plan size

| Size | When | What applies |
|---|---|---|
| Small | One reviewable change: up to about five steps, one service, no migration or contract change, done within days | Done state, `Not doing`, Commands, and the step list. The step order is the critical path; buffer is one line; no rolling wave; the only checkpoint is the end. Pre-mortem: one or two reasons. Template header: Goal, Done state, Source, Commands, Not doing; drop the other header fields and the sections that would stay empty |
| Project | Several PRs or services, a schema, data, or public-contract change, several people or agents, outside dependencies, or weeks of work | Everything in this skill and the full template |

## Workflow

**Gate: a settled direction comes first.** If what to build and why is still
open (only a request such as "plan X" with no agreed goal, spec, or design),
call the Skill tool with `legion:brainstorming` and plan only after the
direction is settled. A plan built on guessed intent pins every guess into
files, interfaces, and dates. Make that call before you write any question to
the user: a list of questions from here is your framing of the goal, while
brainstorming asks one at a time in the user's words and settles the rest.
If the work is a defect whose cause is unknown, call the Skill tool with
`legion:debugging` first; a plan for a fix needs the cause.

1. **Scope check and size.** If the spec covers several independent streams
   (separate services, separate features), propose one plan per stream; each
   must ship something usable alone. Then say the plan's size (table above);
   it sets how much of steps 3 to 8 applies. If the work grows mid-plan, step
   up a size.
2. **Read the codebase before planning it.** Steps written from the spec
   alone name files that do not exist, commands the repo does not have, and
   changes its deploy cannot survive. Read, and record what you found:
   - the code paths the spec touches, and the closest existing feature built
     the same way: its files, layering, naming, and tests are the pattern the
     new steps follow;
   - the project's own commands (test, lint, typecheck, build, migrate,
     run) from its scripts, CI configuration, and contributing docs. Never
     assume a default such as `npm test`;
   - the standing bar every change must clear (contributing docs, agent
     instructions, CI gates, PR template): it goes into Global constraints
     verbatim, as the definition of done every step inherits;
   - how the work ships and who depends on it: deploy style (rolling,
     blue-green, clients that update late, scheduled jobs), and every
     consumer of a schema, API, event, or config the spec changes. These
     decide whether step 5 applies;
   - existing plans in `.legion/plans/` and the project's tracker. An
     unfinished plan for other work is never overwritten: it may be
     mid-build in another session. A replan of the same work updates it in
     place;
   - the parties outside the doers: who must review or approve (code owners,
     security, data owners; each approval becomes a step), and who must be
     told before a change reaches them (that telling goes into the step that
     makes the change).
   If a fact cannot be found (no CI, no deploy docs), it is an assumption in
   the plan and a question at hand-off, not a default.
3. **Work back from the done state**, per
   [references/backward-planning.md](references/backward-planning.md): the
   milestone chain, what is not being done, the critical path, estimates with
   buffer, the detail horizon, and the checkpoints.
4. **Order by dependency, then slice vertically.** Draw the dependency graph
   of what the work changes (schema, types, services, clients). Fix the
   contracts the slices share first, as their own small step, so later
   slices build against a decided interface and can run in parallel. Then
   slice the near milestones into steps that each deliver one working path
   through every layer it touches (storage, logic, interface, test), not one
   layer at a time. Every step leaves the system building with the check
   command green and could merge alone; a step that breaks the build until a
   later one lands is two steps in the wrong order, or needs a flag. The
   first step is the thinnest end-to-end pass that proves the approach, or a
   timeboxed spike on the biggest unknown. Size each step and split anything
   large:

   | Size | Files touched | Example |
   |---|---|---|
   | XS | 1 | One validation rule, one config value |
   | S | 1-2 | One endpoint or component with its test |
   | M | 3-5 | One feature slice through every layer |
   | L, XL | 6+ | Split it |

   Also split a step whose acceptance needs more than three bullets, that
   touches two independent subsystems, or whose title needs an "and". Mark
   what can run in parallel (independent slices after their contract) and
   what must run in sequence (migrations, shared state, a chain of
   dependencies), and say why the first steps come first in the plan's
   `Order` line. Name the low-value tail and, at hand-off, propose moving it
   to a later plan; the agreed scope stays until the user agrees.
5. **Make irreversible changes reversible.** A step that changes a schema,
   stored data, a public API or event, shared config, or infrastructure
   while an older version still runs (rolling deploys, other services,
   clients that update late) ships in compatible stages: expand, migrate,
   switch, and contract in a later deploy, or behind a flag. Each such step
   names its rollback and the signal that says the stage is safe to keep.
   Data written in a new shape often cannot be rolled back by redeploying
   old code. Read [references/rollout-safety.md](references/rollout-safety.md)
   when any step does one of these.
6. **Write the plan** from [assets/plan-template.md](assets/plan-template.md)
   into `.legion/plans/YYYY-MM-DD-<topic>.md`, unless the project names
   another place or a tracker (then one tracker item per step, with the plan
   file as the ordered index). Copy the spec's work-wide requirements and the
   standing bar from step 2 verbatim into Global constraints, list the
   commands, the architecture decisions with their reason, and the
   assumptions, and list in Watch points up to five situations the spec
   implies but never states (empty input, concurrent writes, permissions,
   existing data that breaks the new rule), each with the step that handles
   it. Every detailed step decides exactly one thing: the exact files to
   create or change, the interfaces and names it produces, the failing test
   it starts with, the command that proves it with the expected result, and
   its rollback when step 5 applies. A reference to another step points at
   that step's Produces line. Place a checkpoint every two or three steps
   and at each milestone: the full check command, the end-to-end path, and
   a review before the next steps.
7. **Pre-mortem.** Assume the plan was carried out exactly and the goal still
   failed: an outage during deploy, data lost or corrupted, a consumer
   broken, a regression the checks missed, or the feature unused. List five
   or more candidate reasons, each naming the step, file, interface, deploy
   stage, party, or assumption at fault, and rate each for likelihood and
   damage (high, medium, low). Keep the three with the highest likelihood
   times damage (one or two for a small plan) in the plan's `Pre-mortem`
   section with their ratings, and give each a countermeasure: a check in
   its owning step, a Watch point, a reordered step, a flag or staged
   rollout, buffer, or a question for the user at hand-off.
8. **Self-review, then fix inline:**
   - [ ] every requirement of the spec maps to a step or to `Not doing`,
         and every step's done-check names the requirement it serves;
   - [ ] no step decides nothing ("handle edge cases", "TBD", "wire it up",
         "refactor as needed");
   - [ ] every file, function, command, and migration number a step names
         exists as written or is created by an earlier step's Produces line;
   - [ ] every verification uses a command from the plan's Commands line;
   - [ ] every step leaves the build and checks green, and the order honors
         the dependency graph;
   - [ ] every step that step 5 covers is compatible with the version running
         beside it and names its rollback;
   - [ ] names and interfaces in later steps match what earlier steps
         produce;
   - [ ] every estimate names its basis: a source you actually read, or
         "judgment" with a range;
   - [ ] every party who must approve or be told appears in a step;
   - [ ] (project) the critical path and the parallel streams are marked,
         and buffer protects the end date;
   - [ ] (project) every far milestone has a done criterion and the
         checkpoint where it gets detailed;
   - [ ] every Watch point has its step, and every pre-mortem reason has a
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
   selection tool, ask the same questions as text with lettered options. Do
   not start the work until the user has approved the plan; then offer to
   build it one step at a time with `legion:std-development`. When a
   checkpoint later hits a replan trigger, update the plan deliberately:
   what changed, what moves, and the user's agreement.

## Gotchas

- The most common plan bug is a name or path that drifts between steps
  (`orderTotal` in step 3, `totalCents` in step 6) or was never checked
  against the repo; the Produces lines and step 2 exist to catch it.
- A plan longer than the change it describes has done the work instead.
  Write interfaces, files, and checks, not function bodies.
- Layered steps ("all migrations", then "all API", then "all UI") cannot be
  checked until the end, so mistakes surface late and nothing merges alone.
- A rename or a column drop in one migration looks atomic in the diff and is
  not atomic in production: the old version still runs during the deploy.
- A pre-mortem of generic risks ("bugs", "delays") changes nothing. A reason
  that names no step, interface, or assumption, and so gets no
  countermeasure, should be replaced with a specific one.
- Setup folded into the step that needs it (the dependency added with its
  first use, the table with its first reader) beats a standalone "setup"
  step that no reviewer can meaningfully reject.
- Owners and dates you do not know are open questions for the user, not
  values to invent. The same holds for estimates: "from comparable work"
  written over a number you did not take from a source is an invented
  value with a citation attached.
