# System design

Read this before coding a change that adds or moves a boundary: a module,
API, or service; a domain model; a data store, schema, cache, queue, or
event; a call to something that can fail. Distilled from Clean Architecture,
A Philosophy of Software Design, the three Domain-Driven Design books,
Patterns of Enterprise Application Architecture, Designing Data-Intensive
Applications, and Release It!.

Each section holds rules that always apply, then `When` triggers to act on
as the situation appears. The repo's documented conventions win over all of
them.

## Decide before coding

Answer these in a few lines before the first test. A question you cannot
answer is design work still owed, and it is cheaper now than after the code
exists.

1. **Forces.** Which business capability is this, and what does it need:
   request rate, data volume and growth, latency, consistency, who calls it?
   Separate the durable need from the solution someone proposed.
2. **Owner.** Which module owns each new rule, piece of state, and decision?
   One owner per fact.
3. **Direction.** What does the new code depend on, and does anything
   volatile (framework, database, vendor) reach into the rules?
4. **Truth.** Which store is the source of truth, and which copies are
   derived? When is a write durable, and when is it visible?
5. **Failure.** For each thing this calls: what happens when it is slow,
   down, or answers twice?
6. **Trust.** Does data from a lower-trust source cross into this code, or
   does it touch credentials, personal data, or privileged actions? If so,
   security-principles shapes the design (the skill's workflow says how).
7. **Reversal.** Which decision here is expensive to undo (public contract,
   schema, data ownership, a vendor)? Compare two options for that one and
   keep the rest simple.

When uncertainty is high, build one thin end-to-end slice that is real
enough to test the architecture and its integration, instead of finished
pieces that have never met.

## Boundaries and dependencies

- Dependencies point from detail to policy. Business rules import no
  framework, ORM, web, queue, or vendor type; the inner layer owns the
  interface it needs, the outer layer implements it, and wiring happens in
  one composition root.
- Plain data crosses a boundary. Requests, ORM rows, and vendor payloads are
  translated at the edge, and adapters (controllers, handlers, gateways)
  translate without deciding.
- Prefer deep modules: a small interface that hides real complexity. A
  caller should not need to know sequencing, storage shape, protocol, or
  caching. Pull complexity down into the module that owns the knowledge.
- A layer, wrapper, service, or option must hide more than it adds. Reject
  pass-through layers, generic repositories, and `common`/`utils`/`core`
  packages used as an escape hatch.
- Organize by business capability or use case before technical bucket, and
  enforce the boundary with something that fails (package visibility, a
  dependency rule, a test), not with a diagram.
- Choose a boundary by volatility and cost, the lightest one that can be
  enforced. Do not merge two use cases to remove duplication when they
  change for different reasons or different people.
- Do not distribute by default. A remote boundary gets a coarse, use-case
  shaped contract with its own latency, versioning, and partial-failure
  budget; it never mirrors local object calls.

When

- a controller, job, handler, SQL script, or serializer holds a business
  branch: move the rule inward to its owner.
- a use case constructs infrastructure or calls a vendor directly: add a
  port the use case owns and wire the detail at the edge.
- one change spreads across many files: a boundary is missing or a module
  is leaking what it knows; fix that before adding code.
- a test of a business rule needs the framework, database, or network: the
  rule is in the wrong layer.
- a shortcut is unavoidable: keep it in the outermost layer and write the
  violation down.

## Domain model

- Match the pattern to the complexity. A short independent flow is a
  transaction script; table-shaped logic stays tabular; a domain model is
  for real invariants, lifecycle, and collaboration. Simple CRUD stays
  simple, and the modeling effort goes to the core domain.
- Name the bounded context first. One term per concept inside it, used in
  code, tests, events, and APIs; the same word in another context is
  another concept, translated at the boundary and never shared as a class.
- Entities carry identity and guard their transitions with
  intention-revealing methods instead of setters. Value objects are
  immutable, validated at construction, compared by value, and replace
  primitives that carry rules (money, ranges, identifiers, statuses).
- An aggregate is a consistency boundary, not an object graph: small,
  changed only through its root, referring to other aggregates by identity,
  one aggregate per transaction. Anything that may be eventually consistent
  goes through an event or a process.
- A domain event is a completed business fact named in the past tense, not
  a field change and not a command in disguise.
- Application services coordinate (load, call domain behavior, save,
  publish) and own the transaction; they make no business decision.
  Repositories serve aggregate roots in domain terms, not tables.
- When the read side needs a different shape, add a projection, DTO, or
  query; do not enlarge or expose the aggregate.

When

- a term is fuzzy, overloaded, or imported from another context: sharpen
  and rename it before adding behavior.
- an upstream schema, API payload, or UI starts shaping the model: put a
  translation layer in front, with a test on the translation.
- one request wants to change several aggregates: list the invariant that
  needs it to be immediate; otherwise coordinate by identity and events.
- a flag, status code, or boolean carries domain rules: promote it to a
  type.

## Data and consistency

- Each fact has one source of truth. Indexes, caches, search copies, read
  models, and denormalized fields are derived data with a stated way to
  propagate, a known lag, and a way to rebuild.
- Assume crashes, partial writes, timeouts, duplicates, reordering, and
  unknown success. Accepted, persisted, applied, and durable are different
  states.
- Every command, job, consumer, and retried call is idempotent: a
  deduplication key, a naturally idempotent transition, or an explicit
  recovery contract. Exactly-once delivery is not a design.
- Keep only the ordering the business needs, scoped per key or entity.
- Match transaction scope and isolation to the invariant: name the anomaly
  (lost update, write skew, phantom) that would break it and the guard
  (constraint, lock, compare-and-set, version). Transactions are short and
  explicit, with no remote call inside and no ownership hidden in a helper.
- Schemas, events, APIs, and enums are contracts read by old and new code
  at once: plan for old readers, old writers, stored data, and messages in
  flight during a rolling upgrade.
- Service boundaries follow data ownership. One tightly consistent concept
  is not split across services, and no chatty cross-service join sits on a
  hot path.
- Choose storage, indexes, replication, and partition keys from the actual
  access pattern. Reaching for consensus, a distributed lock, or
  linearizability needs a named coordination problem and an accepted cost.

When

- changing a write path: state the source of truth, the durability and
  visibility points, the downstream effects, and what happens after a
  timeout with unknown outcome.
- reading from a replica or an async copy: decide whether read-your-writes
  and monotonic reads are needed.
- relying on timestamps, leases, or leadership: state the clock assumption
  and use fencing against a stale holder.
- lazy loading or auto-persistence can fire inside a loop or a serializer:
  make the loading explicit.

## Integration and failure

- Every outbound call and wait has an explicit, finite timeout; library
  defaults do not count.
- Retry only what is safe to repeat, with a bound on count and total time,
  backoff, and jitter, at one layer only. Never retry a validation error or
  a permanent failure.
- Isolate failure: circuit breakers, fast failure, bulkheads, and separate
  pools, so one slow dependency cannot take every thread, connection, or
  worker.
- Bound everything that grows (queues, buffers, pools, caches, result sets,
  payloads) and decide what a full one does: back pressure, load shedding,
  rejecting low-value work first.
- Hold no lock or scarce connection across a slow remote call, and release
  resources on every path.
- Validate what comes back from a dependency (shape, status, plausibility)
  before it reaches state, a cache, a queue, or a downstream system.
- Fail visibly. Boundaries and failure points emit structured context:
  correlation id, latency, errors, saturation, queue depth, retry and
  breaker state, with no secrets and no log storm during retries.
- Startup, health checks, migrations, one-off jobs, and admin controls are
  part of the system: idempotent or restartable, authorized, audited, and
  with a way back. A health check reports real ability to serve.
- Contracts state their failures: which are retryable, the timeout, the
  version, and the compatibility promise.

When

- adding an outbound call, pool checkout, or queue consumer: define the
  timeout, retry eligibility and bounds, fallback or degraded mode, and how
  the caller survives.
- adding a queue, cache, background job, or list endpoint: define capacity,
  the full or miss behavior, staleness, pagination or streaming, and the
  saturation signal.
- a scheduled job or a retry can fire on every instance at once: add
  jitter and pacing.

## Final checklist

- Is every new rule, state, and decision owned by one named module, and
  does each interface hide more than it exposes?
- Do dependencies point toward policy, with frameworks, storage, and
  vendors behind an edge that is enforced?
- Does the business-logic pattern match the real complexity, with
  aggregates small and consistency boundaries explicit?
- Is the source of truth named, and is each derived copy rebuildable with a
  known lag?
- Are retried and replayed operations idempotent, and do changed contracts
  work with old readers and writers?
- Does every outbound call have a timeout, bounded safe retries, and
  isolation, and is everything that grows bounded?
- Can an operator see a failure and trace it to its cause?
- Were the trust boundaries named, and was security-principles applied
  where one is crossed?
- Is the one hard-to-reverse decision made deliberately, and can a business
  rule be tested without the framework, database, or network?
