# Review checklists

## Standards axis: what to check

- **Correctness**, in three passes:
  - *Line scan:* read each hunk, then the whole enclosing function. For each
    changed line ask what input, state, timing, or platform makes it wrong:
    inverted or wrong condition, off-by-one, empty / null / boundary value, a
    falsy zero or empty string treated as missing, missing `await`, the wrong
    variable after a copy-paste, an error swallowed in a `catch`, a
    check-then-act gap (TOCTOU), a race, state left inconsistent on failure.
  - *Removed behavior:* for every deleted or replaced line, name what it
    enforced (a guard, an error path, a validation, a test of a real case)
    and where the new code enforces it again.
  - *Callers:* every caller of a changed function and consumer of a changed
    contract still holds: new precondition, changed return shape, new
    exception, ordering dependency.
- **Tests:** each test could fail if the behavior broke; assertions on
  behavior at seams, not on mocks; expected values from an independent
  source; no dependence on wall-clock time, ordering, or the network.
- **Weakened bar:** new suppressions (`@ts-ignore`, `eslint-disable`,
  `# noqa`, `istanbul ignore`, `nosemgrep`), tests skipped or deleted,
  assertions removed from tests that stayed, stubs or empty `catch` blocks,
  thresholds lowered or checks dropped from CI config. Each one without a
  stated, approved reason is Important; tightening a check needs no comment.
- **Security:** untrusted input validated at the boundary; no injection into
  SQL, shell, HTML, or paths; authorization on every protected resource; no
  secrets or PII in code or logs. When a security checklist path is given,
  check the diff against each of its items.
- **Performance:** no query or network call inside a loop over data that
  grows; no unbounded read into memory; a cache keyed on everything the
  response varies by and bounded in size; a speed claim comes with a
  before/after measurement. When a performance checklist path is given,
  check each of its items.
- **Design:** follows existing patterns or justifies a new one; module
  boundaries respected; no circular dependencies.
- **Reuse:** before accepting new code, search adjacent files and shared
  modules for a helper that already does it; name the helper. Also name the
  simpler form of redundant or derivable state, copy-paste with small
  variations, deep nesting, and dead code.
- **Altitude:** the change fixes the cause at the right depth. A special
  case layered onto shared code to cover one caller patches a symptom; name
  the more general change.
- **Readability:** names match `GLOSSARY.md` and the codebase; control flow is
  shallow; comments explain why, not what.
- **Blast radius:** what the change touches outside the diff. Check every caller
  of a changed signature or behavior, contracts with other services and
  clients, persisted data and its migration, and the runtime loops the change
  feeds: retries, caches, queues, rate limits, scheduled jobs. Code that is
  correct locally can still amplify load or break a consumer elsewhere.
- **Leftovers:** debug output, commented-out code, a `TODO` with no owner or
  issue, hardcoded URLs or credentials.
- **Production readiness:** migrations, backward compatibility, configuration,
  documentation of user-facing changes.

## Smell baseline

Judgment calls, never hard violations; a documented repo standard overrides
any of them. Format: *what it is* -> *usual fix*.

- **Mysterious name:** the name does not reveal what it does or holds ->
  rename; if no honest name comes, the design is murky.
- **Duplicated code:** the same logic shape in more than one place in the
  change -> extract it.
- **Feature envy:** a function reaches into another object's data more than
  its own -> move it to the data.
- **Data clumps:** the same few fields travel together -> give them a type.
- **Primitive obsession:** a string or number stands in for a domain concept ->
  give the concept its own small type.
- **Repeated switches:** the same switch on the same type in several places ->
  one map or polymorphism.
- **Shotgun surgery:** one logical change forces edits across many files ->
  gather what changes together.
- **Divergent change:** one module edited for several unrelated reasons ->
  split it.
- **Speculative generality:** parameters, hooks, or abstractions with no need
  in the spec -> delete them.
- **Message chains:** `a.b().c().d()` the caller should not depend on -> hide
  the walk behind one method.
- **Middle man:** a layer that only delegates -> call the target directly.
- **Parameter sprawl:** a parameter list that grows with each requirement,
  or boolean flags that switch behavior -> an options type, or two functions.
- **Leaky abstraction:** a return type or parameter exposes the layer below
  (ORM row, HTTP response, file format) -> map it at the boundary.
- **No-op update:** a write, render, or event fired when nothing changed ->
  compare first.
- **Shallow module:** an interface nearly as complex as its implementation ->
  merge or deepen it so callers learn less.
