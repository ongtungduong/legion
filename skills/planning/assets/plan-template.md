# <Topic> Plan

> Steps use `- [ ]` checkboxes. A small plan keeps only Goal, Done state,
> Source, Commands, Not doing, the Pre-mortem, and the steps.

**Goal:** <one sentence: the outcome for users or the system, not the deliverables>
**Done state:** <what is true after the last step ships, and how someone else checks it>
**Approach:** <two or three sentences>
**Source:** <path or link to the spec or design doc; executors read it too>
**Commands:** <the repo's own commands, as found in step 2: check `<cmd>`, test one file `<cmd>`, build `<cmd>`, migrate `<cmd>`>
**Order:** <why the first steps come first: the value they deliver or the risk they retire; the low-value tail proposed for later, if any>
**Not doing:** <what the plan leaves out and what each would cost; agreed with the user>
**Critical path:** <the chain of steps that sets the end date, its estimate, and the buffer protecting it>
**Parallel streams:** <steps that can run at the same time once their contract step is done, and steps that must run in sequence, with why>
**Detailed to:** <the last milestone in full detail; later milestones are detailed at their checkpoint>

## Global constraints
<Work-wide requirements copied verbatim from the spec, and the project's
standing bar from its contributing docs, agent instructions, and CI gates
(the definition of done every step inherits). One line each.>

## Architecture decisions
<Each decision the steps rely on, with its reason and the alternative
rejected: data shape, where logic lives, the pattern copied from an existing
feature.>

## Assumptions
<What the plan rests on, each with the steps that depend on it: facts that
step 2 could not confirm (deploy style, consumers, data volume). A broken
assumption is a replan trigger.>

## Checkpoints
<Every two or three steps and at each milestone: the full check command, the
end-to-end path, a review before going on. Replan triggers: critical path
past its buffer, a broken assumption, a wrong done criterion.>

## Watch points
<Up to five situations the spec implies but never states, most likely
first, each with what a reasonable user would expect and the step that
handles it.>

## Pre-mortem
<Assume the plan was carried out and the goal failed. The three reasons with
the highest likelihood times damage, each with its countermeasure:
- <reason naming the step, interface, deploy stage, party, or assumption> (likelihood: <H/M/L>, damage: <H/M/L>) -> <check in Step N / Watch point / reorder / flag / question for the user>>

---

## Milestone 1: <name>

### Step 1: <outcome>   (Size: S; estimate: <value or range>, basis: <source read, or "judgment">)

**Serves:** <the requirement or outcome this step contributes to>
**Owner:** <person, role, or agent; project size only>
**Depends on:** <earlier steps, or "none">; **Parallel with:** <steps, or "none">
**Files:** <create `path`; modify `path`; test `path`>
**Produces:** <exact names, signatures, columns, endpoints, or flags later steps rely on>
**Rollback:** <only for a step that step 5 covers: how to undo it and the signal that says the stage is safe to keep>

**Done when (source: <spec section or requirement>):** <checkable condition and what "passed" looks like>

- [ ] Write the failing test: <test name in `path`>; run `<command>`; expected: fails because <reason>
- [ ] <concrete change with its exact values>
- [ ] Check: `<command from Commands>`; expected: <result>

## Milestone 2: <name>   (not yet detailed; detailed at: <checkpoint>)

**Done when:** <checkable condition>
**Rough size:** <estimate or range>
