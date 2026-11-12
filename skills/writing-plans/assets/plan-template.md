# <Feature> Implementation Plan

> Execute with legion:executing-plans. Steps use `- [ ]` checkboxes.

**Goal:** <one sentence>
**Architecture:** <two or three sentences>
**Spec:** <path to the design doc; executors read it too>
**Design principles:** <references from legion:principles, e.g. "coding + system-design">
**Security:** none | <trust boundaries touched and the assets behind them>
**Performance:** none | <budget or hot path>
**Slice order:** <why the first slices come first: the value they deliver or the risk they retire; the low-value tail proposed for later, if any>

## Global constraints
<Project-wide requirements copied verbatim from the spec: versions, limits,
naming and copy rules. One line each. Every task implicitly includes these.>

## Review focus
<Up to five inputs or failure modes the spec implies but never states, most
likely first, each with the behavior a reasonable user would expect and the
task whose tests pin it.>

## Pre-mortem
<Assume the plan was executed and the feature failed. Three most likely
reasons, each with its countermeasure:
- <reason naming the component or assumption> -> <test in Task N / Review focus / reorder / question for the user>>

---

### Task 1: <capability>   (Size: S)

**Files:** Create `path/a.ts`; Modify `path/b.ts`; Test `tests/a.test.ts`

**Interfaces:**
- Consumes: <exact signatures from earlier tasks, or "none">
- Produces: <exact names and types later tasks rely on>

**Acceptance (spec: <section or requirement>):** <checkable conditions for this slice>

- [ ] Write the failing test `rejects an empty cart` asserting <exact values>
- [ ] Run `npm test -- cart.test.ts`; expected: FAIL, "checkout is not defined"
- [ ] Implement `checkout(cart: Cart): Receipt` in `src/cart.ts`
- [ ] Run `npm test -- cart.test.ts`; expected: PASS
- [ ] Run the full suite `npm test`; expected: all pass
- [ ] Commit `feat(cart): reject empty carts`
