---
name: writing-plans
description: >-
  Turns an approved spec or design doc into an implementation plan of
  vertical-slice tasks, each with exact files, interfaces, failing tests,
  commands, and expected output, ordered so the first slices deliver most of
  the value, and stress-tested with a pre-mortem. Use when a spec, design
  doc, issue, or settled requirements describe multi-step work and the next
  step is planning, including "break this into tasks", "write the plan", or
  "how should we implement this", before any code is touched.
license: MIT
metadata:
  author: ongtungduong
---

# Writing Plans

Write the plan for a capable engineer who has never seen this codebase or
spec. They will write idiomatic code once they know the exact interface and
test; what they cannot know is what you decided: files, names, signatures,
values from the spec, and the tests that prove each task. Write those down,
and nothing they could decide alone.

## Workflow

**Gate: an approved design comes first.** If there is no spec, design doc,
or issue whose intent the user has approved (only a request such as "write
the plan for X"), call the Skill tool with `legion:brainstorming` and plan
only after it hands back an approved design. A plan built on guessed intent
pins every guess into files, signatures, and tests.

1. **Scope check.** If the spec covers several independent subsystems, propose
   one plan per subsystem; each must yield working, testable software alone.
2. **Map the files** to create or modify, with one responsibility each. Split
   by responsibility, not by technical layer; follow existing patterns.
   **Choose the design principles** with `legion:principles` (call the
   Skill tool with it) and record them in the plan's `Design principles` line,
   so the implementer and the reviewer apply the same standard. Fill the
   `Security` and `Performance` lines from the spec's `Non-functional`
   section, or, when the spec has none, from the trigger lists in
   `legion:executing-plans`; `none` is a decision, so write it only when no
   trigger matches. They tell the implementer which checklists to load: the
   `security` reference of `legion:principles` for `Security`, its
   `performance` reference for `Performance`.
3. **Slice vertically.** Each task is one complete, testable path through the
   system (schema + logic + interface for one capability). The first task is
   the thinnest end-to-end tracer bullet. Size each task; split anything L or
   larger:

   | Size | Files | Example |
   |---|---|---|
   | XS | 1 | One validation rule |
   | S | 1-2 | One endpoint or component |
   | M | 3-5 | One feature slice |
   | L, XL | 5+ | Split it |

   **Order by value.** After the tracer bullet, put first the slices
   that deliver most of the spec's goal or retire its biggest risk, and say
   why in the plan's `Slice order` line. Name the low-value tail and, at
   hand-off, propose moving it to a later plan; the spec's scope stays until
   the user agrees.

4. **Write the plan** from [assets/plan-template.md](assets/plan-template.md)
   into `.legion/plans/YYYY-MM-DD-<topic>.md` (unless the user or repo
   prefers another place). Copy the spec's project-wide requirements verbatim
   into Global constraints, and list in Review focus up to five inputs or
   failure modes the spec implies but never states, each with a test added
   to the owning task. They are where an implementer following the spec's
   letter goes wrong, so the final reviewer looks there first.
5. **Make every step decide exactly one thing:**
   - test step: the test name and assertions with the spec's exact values;
   - code step: the exact signature, file, and pinned values (a body only for
     an algorithm the signature and tests do not determine);
   - verification step: the command and the output that means it passed;
   - cross-task reference: point at the other task's Interfaces block.
6. **Pre-mortem.** Assume the plan was executed exactly and the
   feature still failed: rejected by the user, broken in production, or
   unmergeable. Write the three most likely reasons in the plan's
   `Pre-mortem` section, each naming the component or assumption at fault,
   and give each a countermeasure: a test in its owning task, a Review focus
   line, a reordered task, or a question for the user at hand-off.
7. **Self-review, then fix inline:**
   - [ ] every spec requirement maps to a task, and every task's acceptance
         names the spec requirement it implements;
   - [ ] no step decides nothing ("handle edge cases", "TBD");
   - [ ] no step transcribes code its signature and test already determine;
   - [ ] names and types in later tasks match what earlier tasks produce;
   - [ ] every file to modify exists at the path written, and every command
         is one the repo defines (its manifest, Makefile, or CI config), so
         no step sends the executor after a guess;
   - [ ] every Review focus line has its test;
   - [ ] every pre-mortem reason has a countermeasure in the plan.
8. **Hand off.** Link the plan and ask the user to review it. Execution runs
   under `legion:executing-plans`, which chooses inline or subagent work per
   task itself; the user may still set the mode. In the same message, list
   the low-value tail you propose to defer and the pre-mortem questions
   only the user can answer. Do not start implementing
   until the user has reviewed the plan.

## Gotchas

- Name drift between tasks (`clearLayers()` in Task 3, `clearFullLayers()` in
  Task 7) is the most common plan bug; the Interfaces blocks exist to catch it.
- A plan longer than the code it describes has written the code instead.
  Replace bodies with signatures and assertions.
- Horizontal tasks ("all tables", then "all endpoints") cannot be tested until
  the end, so mistakes surface late.
- A pre-mortem of generic risks ("bugs", "performance issues") changes
  nothing. A reason that names no component, and so gets no countermeasure,
  should be replaced with a specific one.
- Setup, configuration, and docs folded into the task that needs them beat
  standalone "setup" tasks that no reviewer can meaningfully reject.
