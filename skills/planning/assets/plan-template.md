# <Topic> Plan

> Tasks use `- [ ]` checkboxes. A small plan keeps only Goal, Done state,
> Source, Checks, Not doing, the Pre-mortem, and the tasks.

**Goal:** <one sentence: the outcome for the people or system it serves, not the deliverables>
**Done state:** <what is true after the last task, and how someone else checks it>
**Approach:** <two or three sentences>
**Source:** <path or link to the spec, design, or agreed goal; doers read it too>
**Checks:** <how results are accepted, as found in step 2: the reviews, sign-offs, or commands (for code: check `<cmd>`, test one file `<cmd>`, build `<cmd>`, migrate `<cmd>`)>
**Order:** <why the first tasks come first: the value they deliver or the risk they retire; the low-value tail proposed for later, if any>
**Not doing:** <what the plan leaves out and what each would cost; agreed with the user>
**Critical path:** <the chain of tasks that sets the end date, its estimate, and the buffer protecting it>
**Parallel streams:** <tasks that can run at the same time once their shared-decision task is done, and tasks that must run in sequence, with why>
**Detailed to:** <the last milestone in full detail; later milestones are detailed at their checkpoint>

## Global constraints
<Work-wide requirements copied verbatim from the source, and the standing
bar from the house rules, policies, contributing docs, or CI gates (the
definition of done every task inherits). One line each.>

## Decisions
<Each decision the tasks rely on, with its reason and the alternative
rejected.>

## Assumptions
<What the plan rests on, each with the tasks that depend on it: facts that
step 2 could not confirm. A broken assumption is a replan trigger.>

## Checkpoints
<Every two or three tasks and at each milestone: the whole checked end to
end, a review before going on. Replan triggers: critical path past its
buffer, a broken assumption, a wrong done criterion.>

## Watch points
<Up to five situations the source implies but never states, most likely
first, each with what a reasonable user would expect and the task that
handles it.>

## Pre-mortem
<Assume the plan was carried out and the goal failed. The three reasons with
the highest likelihood times damage, each with its countermeasure:
- <reason naming the task, decision, party, or assumption> (likelihood: <H/M/L>, damage: <H/M/L>) -> <check in Task N / Watch point / reorder / staged change / question for the user>>

---

## Milestone 1: <name>

### Task 1: <result>   (Size: S; estimate: <value or range>, basis: <source read, or "judgment">)

**Serves:** <the requirement or outcome this task contributes to>
**Doer:** <person, role, or agent; project size only>
**Depends on:** <earlier tasks, or "none">; **Parallel with:** <tasks, or "none">
**Inputs:** <pointers to what it reads: files, documents, Task N's Produces line>
**Scope:** <what it may change, and what it must leave alone (for code: create `path`; modify `path`; test `path`)>
**Produces:** <the exact result later tasks rely on: names, document, decision, interface, booking>
**Way back:** <only for a task that step 5 covers: how to undo or limit it, and the signal that says it is safe to go on>

**Done when (source: <section or requirement>):** <checkable condition and what "passed" looks like>

- [ ] <first action; for code: write the failing test <name> in `path`, run `<command>`, expected: fails because <reason>>
- [ ] <concrete action with its exact values>
- [ ] Check: <the check from the Checks line>; expected: <result>

## Milestone 2: <name>   (not yet detailed; detailed at: <checkpoint>)

**Done when:** <checkable condition>
**Rough size:** <estimate or range>
