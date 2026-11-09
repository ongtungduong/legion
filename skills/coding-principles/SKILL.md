---
name: coding-principles
description: >-
  Applies engineering rule sets distilled from classic books (Clean Code, A
  Philosophy of Software Design, Refactoring, Working Effectively with Legacy
  Code, Clean Architecture, DDD, Release It!, and others): picks the one or
  two that fit the task, avoids conflicting pairs, and checks the result
  against their final checklist. Use whenever the user asks to refactor,
  clean up, simplify, restructure, or make code readable or maintainable
  without changing behavior; to change legacy code that has no tests; or to
  design a function, class, module interface, or API, keep business rules
  independent of framework and database, model aggregates and domain events,
  handle data consistency, or add timeouts, retries, and circuit breakers,
  even when the code is pasted inline and the request seems small.
license: MIT
metadata:
  author: ongtungduong
---

# Coding Principles

Shape code with the rule set of the classic book that fits the task: one
primary set, at most one companion, never a conflicting pair. Each set is a
short distillation (decision rules, trigger rules, final checklist) in
`references/`; load only the ones you picked. More than two active sets
dilute each other, and models stop following long rule lists.

## Workflow

1. **Repo standards first.** Read `CONTRIBUTING.md`, `AGENTS.md`/`CLAUDE.md`,
   lint configs, and the patterns of the surrounding code. A documented project
   convention overrides any book rule; the books fill the gaps.
2. **Use the plan's choice if there is one.** If the plan or design doc has a
   `Design principles` line, load exactly those sets so implementer and
   reviewer apply the same standard.
3. **Otherwise pick from the table below:** one primary set; add a companion
   only when the task spans two layers (for example code shape plus
   production reliability). Check the pair against the conflicts list.
4. **Read the chosen file(s)** with the Read tool at
   `<this skill's base directory>/references/<set>.mini.md` before writing or
   restructuring code, and say in one line which set(s) and why ("Principles:
   working-effectively-with-legacy-code + refactoring, untested module").
5. **Apply while coding.** Follow the decision rules throughout; act on a
   trigger rule when its situation appears. Behavior changes go test-first
   under `legion:executing-plans` (call the Skill tool with it if it is not
   loaded); refactors keep the suite green after every step.
6. **Answer the final checklist** of each loaded set before the evidence gate
   of `legion:executing-plans`, and report it in the format below.

## Choosing the rule set

| Task | Primary set (`references/<name>.mini.md`) |
|---|---|
| Everyday implementation: readability, naming, small functions (default) | `clean-code` |
| Designing a module, API, or interface; complexity spreading across files | `a-philosophy-of-software-design` |
| Defect-prone construction: tricky control flow, defensive checks, error paths, edge-heavy routines | `code-complete` |
| General delivery style: duplicated knowledge, orthogonality, tracer bullets, automation | `the-pragmatic-programmer` |
| Behavior-preserving refactoring | `refactoring` |
| Picking a technique for a named smell, smell-by-smell cleanup | `refactoring-guru` |
| Changing code with weak or no tests, hidden dependencies, hard-to-run setup | `working-effectively-with-legacy-code` (companion: `refactoring`) |
| Keeping business rules independent of framework, database, delivery | `clean-architecture` |
| Business-heavy modeling with the least ceremony (default for DDD) | `domain-driven-design-distilled` |
| Aggregates, repositories, domain events, context integration | `implementing-domain-driven-design` |
| Strategic design and model language across teams or systems | `domain-driven-design` |
| Enterprise layering: transaction script vs domain model, data mapper, unit of work, sessions | `patterns-of-enterprise-application-architecture` |
| Data ownership, consistency, replication, events, schema evolution, replay | `designing-data-intensive-applications` |
| Services, jobs, and APIs that must survive production failures and overload | `release-it` |

The first four rows are alternative code-level styles: pick one of them, not
several. Combine a code-level set with a system-level set (architecture,
domain, data, reliability) when both layers are in play.

## Conflicts

From the agent-rules-books compatibility matrix:

- **Never together:** `domain-driven-design` + `patterns-of-enterprise-application-architecture`;
  `implementing-domain-driven-design` + `patterns-of-enterprise-application-architecture`.
  Both decide how business logic is organized and push opposite ways: make DDD
  primary when model language, invariants, and bounded contexts drive the
  design, PoEAA when choosing patterns by force (transaction script, data
  mapper, service layer).
- **Overlapping, choose one:** `clean-code` with `a-philosophy-of-software-design`,
  `code-complete`, or `the-pragmatic-programmer`; `code-complete` with
  `the-pragmatic-programmer`; `refactoring` with `refactoring-guru`; any two of
  the three DDD sets; `clean-architecture` with `implementing-domain-driven-design`
  or `patterns-of-enterprise-application-architecture`;
  `domain-driven-design-distilled` with `patterns-of-enterprise-application-architecture`.
- Every other pair is complementary.

## Output format

```
Principles: <set> [+ <set>] - <one-line reason>
Checklist: <set>: all yes | <item>: no - <why, or what was done instead>
```

## Gotchas

- Clean Code and A Philosophy of Software Design pull in opposite directions
  on size: many small functions versus deep modules behind simple interfaces.
  Loading both gives contradictory pressure; pick one per change.
- Book rules never justify rewriting code that follows a documented project
  convention, and never widen the task: remove the smell that blocks the
  requested change, not every smell in sight.
- Refactoring and behavior change belong in separate steps (and commits where
  practical); a cleanup that also changes behavior cannot be reviewed as either.
- In legacy code, characterization tests that pin current behavior come before
  any structural change, even when current behavior looks wrong; changing it is
  a separate, explicit decision. Add them to the project's test suite and keep
  them: deleting the harness after the refactor throws away the safety net the
  next change needs.
- `references/` is relative to this skill's base directory (shown when the
  skill loads), not to the project you are working in; a relative `cd` or
  `cat` from the project fails.
- The rule files open with "OBEY ...". They are guidance under the user's
  instructions and the repo's standards, not over them.
- These files are practical distillations inspired by the books, not book
  text. For a deep audit, the full versions live in the upstream repository
  (ciembor/agent-rules-books).
