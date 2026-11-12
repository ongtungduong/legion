---
name: principles
description: >-
  Gets design and code right the first time with three rule references
  distilled from classic engineering books: system design (boundaries, domain
  model, data consistency, failure handling), coding (readable construction,
  refactoring, legacy code), and performance (designing for load, measured
  optimization). Use when designing a function, class, module interface, API,
  service, domain model, or data flow; when asked to refactor, clean up,
  simplify, restructure, or make code maintainable without changing behavior;
  to change legacy code that has no tests; to add timeouts, retries, or
  circuit breakers; or to make code, an endpoint, or a query faster, cut
  latency, memory, or bundle size, fix an N+1 query, profile, or get Core Web
  Vitals (LCP, INP, CLS) under a target, even when the code is pasted
  inline.
license: MIT
metadata:
  author: ongtungduong
---

# Principles

Decide the design before the code, then write the code to rules that hold
it there. The rules live in three references (system design, coding,
performance), each a synthesis of the classic books with their
contradictions already settled, each ending in a final checklist. Load only
the ones the change needs: a design fixed after the code exists costs a
rewrite, and a rule list nobody needed dilutes the ones that matter.

## Workflow

1. **Repo standards first.** Read `CONTRIBUTING.md`,
   `AGENTS.md`/`CLAUDE.md`, lint configs, and the patterns of the
   surrounding code. They are facts; a documented project convention
   overrides any rule here, and the references fill the gaps.
2. **Pick the references** from the table below, or load exactly the ones
   on the plan's `Design principles` line so implementer and reviewer apply
   the same standard. Read each with the Read tool at
   `<this skill's base directory>/references/<name>.md` before writing or
   restructuring code, and say in one line which and why ("Principles:
   coding + system-design, new webhook consumer").
3. **Design before code.** When `system-design` is
   loaded, answer its "Decide before coding" questions in a few lines:
   owner of each new rule and state, dependency direction, source of truth,
   behavior when a dependency fails, load, trust boundaries. When
   `performance` is loaded, name the hot path and the data that grows. An
   open answer is settled now, with the user if it is theirs to decide.
4. **Secure by design.** If the change crosses a trust boundary (the cases in
   the `legion:security-principles` description), call the Skill
   tool with `legion:security-principles` before the design is fixed and follow its build mode. Its trust boundaries, abuse cases,
   and always / ask-first / never boundaries are design inputs: they decide
   where validation and authorization sit, and its first abuse case is the
   first test. Its rules win over a structural preference here.
5. **Break the design once.** Name the input, load, failure, or
   future change most likely to make this design wrong, and adjust or
   record why it holds. Spend the effort on the one decision that is
   expensive to reverse (public contract, schema, data ownership); keep
   everything else the simplest thing that satisfies the rules.
6. **Apply while coding.** Follow the rules throughout and act on a `When`
   trigger as its situation appears. Behavior changes go test-first under
   `legion:executing-plans` (call the Skill tool with it if it is not
   loaded); refactors keep the suite green after every step.
7. **Answer the final checklist** of each loaded reference before the
   evidence gate of `legion:executing-plans`, and report in the format
   below.

## Choosing the references

| The change | Read (`references/<name>.md`) |
|---|---|
| Writes or reshapes a function, class, or module (default for any code) | `coding` |
| Refactors, cleans up, or modifies code that exists; code with weak or no tests | `coding-existing-code` (with `coding`) |
| Adds or moves a boundary: module, API, or service; domain model; data store, schema, cache, queue, or event; a call that can fail (timeouts, retries, circuit breakers) | `system-design` |
| Touches a query or remote call in a loop, a hot path, data that grows, a cache, rendering, or a stated budget | `performance` |
| Makes existing code faster or lighter toward a goal | `performance-optimization` (with `performance`) |
| Browser-facing: page load, interaction latency, layout shift, bundle size | `performance-web` (with `performance`) |

Most changes need `coding` alone. New work with a boundary reads
`system-design` first, because it decides what the code will be. Loading
everything by default defeats the split.

## Output format

```
Principles: <reference> [+ <reference>] - <one-line reason>
Design: <owner; dependency direction; source of truth; failure behavior; load>   (when system-design was loaded)
Security: legion:security-principles applied | no trust boundary crossed
Checklist: <reference>: all yes | <item>: no - <why, or what was done instead>
```

A measured optimization reports in the format at the end of
`references/performance-optimization.md` instead of the `Design` line.

## Gotchas

- Right the first time means the design questions are answered before the
  first test, not that the design is large. For a single function the
  answer is one line; do not invent layers, ports, or aggregates the
  change does not need.
- The rules never justify rewriting code that follows a documented project
  convention, and never widen the task: remove the smell that blocks the
  requested change, not every smell in sight.
- Refactoring and behavior change belong in separate steps (and commits
  where practical); a cleanup that also changes behavior cannot be reviewed
  as either.
- In code without tests, characterization tests that pin current behavior
  come before any structural change, even when the behavior looks wrong.
  Add them to the project's suite and keep them: deleting the harness
  after the refactor throws away the safety net the next change needs.
- No claim that code is faster or "optimized" without a before and after
  number and its source; otherwise call it potential impact. A slowdown
  that appeared after a change is a regression: call the Skill tool with
  `legion:systematic-debugging` first.
- Security is not a later pass. A validation layer, an authorization check,
  or a tenant key added after the structure is fixed ends up bolted onto
  the wrong layer; that is why step 4 comes before the code.
- `references/` is relative to this skill's base directory (shown when the
  skill loads), not to the project you are working in; a relative `cd` or
  `cat` from the project fails.
- The references are practical distillations inspired by the books, not
  book text. The per-book rule sets they were built from live upstream
  (ciembor/agent-rules-books).
