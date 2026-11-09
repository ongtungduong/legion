# Review checklists

## Standards axis: what to check

- **Correctness:** edge cases (empty, null, boundary), error paths, off-by-one,
  races, state left inconsistent on failure.
- **Tests:** each test could fail if the behavior broke; assertions on
  behavior at seams, not on mocks; expected values from an independent source.
- **Security:** untrusted input validated at the boundary; no injection into
  SQL, shell, HTML, or paths; authorization on every protected resource; no
  secrets or PII in code or logs. Escalate to `legion:security-and-hardening`
  when the change touches these areas.
- **Design:** follows existing patterns or justifies a new one; module
  boundaries respected; no circular dependencies.
- **Readability:** names match `GLOSSARY.md` and the codebase; control flow is
  shallow; comments explain why, not what.
- **Blast radius:** what the change touches outside the diff. Check every caller
  of a changed signature or behavior, contracts with other services and
  clients, persisted data and its migration, and the runtime loops the change
  feeds: retries, caches, queues, rate limits, scheduled jobs. Code that is
  correct locally can still amplify load or break a consumer elsewhere.
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
- **Shallow module:** an interface nearly as complex as its implementation ->
  merge or deepen it so callers learn less.
