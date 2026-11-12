# Changing existing code

Read this before refactoring, cleaning up, or changing code that already
exists, and first of all when the code has weak or no tests. Distilled from
Refactoring, Refactoring.Guru, and Working Effectively with Legacy Code.
The rules for the code you end up with are in `coding.md`; this file is
about getting there safely.

## Rules for any change

- Say which it is: refactoring (behavior stays), a feature, or a bug fix.
  Keep structural edits and behavior edits in separate steps, and separate
  commits where practical. A change that does both cannot be reviewed as
  either.
- State the behavior that must stay before editing.
- Take small, reversible steps that build and pass after each one. When
  tempted to rewrite, pick the next small behavior-preserving move instead.
- Remove the smell that blocks the requested change, not every smell in
  sight. Record the others; do not fix them in this change.
- Around a feature: reshape the local structure first if that makes the
  change easy, make the change, then clean up what the change introduced.
- Never delete or weaken a failing test to finish a cleanup.
- Stop when the requested change is easy, the named smell is gone, and the
  next step would be speculative.

## Refactoring

Diagnose before treating: the symptom, what it costs, the scope, the
intended end state, how it will be verified, and where to stop. Then use
the smallest treatment that fits, escalating only when it is blocked.

| Smell | Smallest treatment first |
|---|---|
| Long function, needs comments or scrolling | Extract function; replace a temp with a query when locals block the extraction |
| Class with several reasons to change | Extract class; a subclass or interface only for stable variants |
| Long parameter list, values that travel together | Pass the whole object; a parameter object only for a real recurring concept |
| Primitive, magic number, or type code carrying rules | A value type, only when it adds naming, validation, or behavior |
| One change needs edits in many files | Move behavior and data to the owner of the changing concept |
| Method envies another object's data, or callers navigate a chain | Move the behavior next to the data; hide the delegate |
| Repeated switch or conditional on a type | Decompose and consolidate first; polymorphism or a table only when the variation is stable and repeated |
| Function both answers and changes state | Separate query from modifier, unless atomic read-modify is the contract |
| Class that only forwards | Remove the middle man, unless it guards a real boundary |
| Null checks everywhere | A null object only when absence can obey the same interface; an absence that is an error stays explicit |
| Inheritance with unused or refused behavior | Push members down, or replace inheritance with delegation |
| Dead or speculative code | Delete it, after checking public, reflective, serialized, generated, and plugin uses |

Before a move, check what it can break:

- Extract or move: inputs, outputs, mutated variables, callers, visibility,
  and construction paths.
- Consolidating conditions or replacing an algorithm: side effects,
  ordering, the truth table, edge cases, and performance-sensitive paths.
- Reshaping data: identity or value semantics, mutability, equality, and
  lifecycle ownership.
- Changing a signature, constructor, visibility, or hierarchy: keep
  compatibility or provide a transition path.

Keep error semantics unless changing them is the stated intent. Adding
getters and setters is not encapsulation: move the behavior inward. A plain
conditional or a little clear duplication can beat a mechanical treatment.

## Code without trustworthy tests

Any area without tests you trust is legacy code. Gain control before
improving the design:

1. Find the change point, and state the behavior to change and the behavior
   to keep.
2. Find test points by tracing effects outward from the change point:
   return values, calls, fields, outputs, collaborators.
3. Pin current behavior with characterization tests, including behavior
   that looks wrong. Changing it is a separate, explicit decision.
4. If the code cannot be put under test, create the smallest seam and break
   only the dependency in the way: constructor work, a hidden `new`, a
   global or static, time, randomness, the environment, files, the network,
   a framework object. Inject it or wrap it.
5. Make the change. When editing in place is too risky, add the behavior
   beside the old code (sprout a function or class, or wrap the old one)
   and fold it in once tests allow.
6. Refactor locally under the tests, and keep the tests in the suite.

- Prefer fast, focused tests around the slice being changed; a broad
  integration test only when it is the safest first place to observe.
- Hard-to-test code: split construction from use, extract pure computation
  first, and put side effects behind a collaborator.
- A seam that is public-for-test, subclass-only, or otherwise a trick
  carries a cleanup obligation: record it and remove it once the structure
  is better.
- Do not mock around untestable structure without improving it, rename and
  reformat while the dependency knot stays, or bring in a new architecture
  before basic seams exist.
- Exploratory restructuring done only to understand the code is thrown
  away, not committed.

## Final checklist

- Is this change clearly refactoring, a feature, or a fix, with structural
  and behavioral edits separated?
- Was the behavior to preserve stated, and is it protected by tests or
  characterization (or is the gap recorded)?
- Which smell was diagnosed, and was the smallest suitable treatment used?
- Did behavior and error semantics stay the same under the relevant checks?
- Were public compatibility, state flow, and external reachability checked
  before moving or deleting?
- Does any temporary seam have a cleanup path?
- Is the touched area easier to understand, test, or change, and did the
  cleanup stop before speculative abstraction?
- Are untreated smells recorded instead of hidden?
