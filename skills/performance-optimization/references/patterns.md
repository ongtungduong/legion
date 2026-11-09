# Performance patterns

Read the section for the bottleneck the profile, plan, or trace named. Each
gives the signature that identifies it, the usual fix, and the trap.

## Queries and data access

- **N+1 queries.** Signature: query count grows with the number of rows
  shown (one query for the list, one per item for its children). Fix: fetch
  the relation in the same query (join, `IN (...)` batch, the ORM's eager
  load). Assert the query count in a test. Trap: an eager load of a large
  relation can be worse than N small queries; measure both.
- **Unbounded reads.** Signature: a list endpoint or job reads a whole
  table, or memory grows with the data. Fix: paginate with a limit and a
  stable order (keyset pagination for deep pages); stream large files and
  results instead of loading them. Trap: `OFFSET` pagination slows as the
  offset grows.
- **Queries that ignore their index.** Signature: the plan shows a
  sequential scan where an index was expected, a `rows=` estimate off by an
  order of magnitude, or a sort above the scan. Fix: capture the plan
  (`EXPLAIN ANALYZE` or the engine's equivalent) before; a bad estimate
  means stale statistics (refresh them before adding anything); index the
  query's shape, equality columns first, then range or sort; index an
  expression when the query applies a function (`lower(email)`); trigram or
  full-text for a leading wildcard; a partial index for a rare value of a
  low-selectivity column. Re-check the plan after; an index that did not
  change it is a revert.
- **Connection pool exhaustion.** Signature: every endpoint slows at once,
  time goes to waiting for a connection, the database shows idle sessions.
  Fix: one pool per process, `instances x max` under the database's
  connection limit, a connection timeout so exhaustion fails fast; find what
  holds connections (long transactions, a missing `await`, leaked clients).
  With autoscaling or serverless, put a multiplexing proxy in front instead
  of raising `max`.

## Computation

- **Algorithmic complexity.** Signature: time grows faster than input
  (nested loops over two collections, `includes`/`indexOf` inside a loop,
  repeated sorting, string concatenation in a loop). Fix: a map or set for
  lookups, sort once, build strings with a buffer or join. Write the test at
  the input size where the budget fails.
- **Repeated work.** Signature: the same value computed per item, per
  request, or per render. Fix: hoist it out of the loop, compute once per
  request, memoize a pure function the profile shows is hot. Trap:
  memoizing cheap work adds memory and a cache-invalidation bug.
- **Blocking work on a latency path.** Signature: a request handler, event
  loop, or UI thread does CPU-heavy work or synchronous I/O. Fix: move it to
  a worker, a queue, or a background job; chunk long loops. Trap: a queue
  without a bound or backpressure turns overload into memory growth.

## I/O and concurrency

- **I/O in a loop.** Signature: a network, file, or database call per item,
  awaited one after another. Fix: one bulk call; or run them concurrently
  with a limit (a pool of N), never unbounded. Trap: unbounded concurrency
  against a rate-limited or shared service is a self-inflicted outage.
- **Retries and timeouts.** Signature: latency spikes under partial
  failure; load multiplies during an incident. Fix: a timeout on every
  remote call, retries only for idempotent operations, with backoff,
  jitter, and a cap. Trap: retries at several layers multiply (3 x 3 x 3 =
  27 calls).
- **Lock contention.** Signature: throughput flattens as concurrency rises;
  intermittent slowness under load. Fix: shorten the critical section, lock
  finer-grained data, or avoid shared mutable state. Measure wait time, not
  only hold time.

## Memory

- **Leaks.** Signature: memory grows across requests and never returns.
  Usual sources: listeners, timers, and subscriptions not removed; a global
  or module-level map used as a cache; closures holding large objects. Fix:
  take two heap snapshots under the same load and diff them.
- **Large payloads.** Signature: memory spikes on one request or job. Fix:
  stream, page, or select only the needed fields.

## Caching

Cache only what was measured as expensive and is read far more often than it
changes.

- Key on every input the response varies by: tenant, viewer, locale,
  permissions, feature flags. A key that omits the viewer leaks data.
- Choose one invalidation strategy (TTL, event or tag, versioned keys) and
  write the acceptable staleness down.
- Protect hot keys from a stampede: coalesce concurrent misses behind one
  in-flight load, or serve stale while one request refreshes.
- Cache negative results with a shorter TTL; never cache an origin error.
- Bound the cache (size or memory) with an eviction policy; an unbounded
  cache is a leak.
- Never cache what must be fresh: balances, permissions, stock at checkout.
