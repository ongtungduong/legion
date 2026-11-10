# Performance

Read this before writing or reviewing code that touches a query or remote
call inside a loop, a hot path (per request, per row, per frame), data that
grows with users or time, a cache, a queue, rendering, or a stated budget.
Distilled from Designing Data-Intensive Applications, Release It!, Patterns
of Enterprise Application Architecture, A Philosophy of Software Design, and
Code Complete, with the bottleneck patterns of the former performance skill.

Design for the load the code will meet; do not tune what was never
measured. The cheap decisions are structural and made now (bounded reads,
batched access, the right data structure); micro-optimizations wait for a
profile.

**The rule:** no claim that code is faster, lighter, or "optimized" without
a before and after number, each naming its source (benchmark, profiler,
query plan, lab run, field data). Without one, the finding is *potential
impact*. A model reading source cannot see runtime cost, and a confident
number nobody measured sends the next change in the wrong direction.

## Design for load

- Describe the load in numbers before choosing a structure: request rate,
  data volume and its growth, access pattern, the latency percentile that
  matters, and the largest input.
- Name the hot paths: what runs per request, per row, per frame, or per job
  item. Cost paid once at startup is rarely the problem; the same cost per
  item is.
- Ask what breaks it: the input size, concurrency, or data growth at which
  this design fails its budget. Code that is fine at 100 rows and quadratic
  at 100,000 is the common case.
- Trace the system around it: who calls this and how often, and which
  pools, queues, caches, retries, and locks sit on the path. A local
  speedup that raises load on a shared database moves the problem.
- Keep a performance trick behind the interface that owns it, so it can be
  removed. Do not trade module depth or clarity for speed without a
  measurement that shows the trade matters.

## Data access

- **No query or remote call per item.** Signature: the query count grows
  with the number of rows shown. Fetch the relation in the same query
  (join, `IN (...)` batch, the ORM's eager load) and assert the query count
  in a test. Trap: eager-loading a large relation can cost more than N
  small queries; measure both.
- **Every read is bounded.** A limit with a stable order (keyset pagination
  for deep pages, since `OFFSET` slows as it grows), or a stream. Select
  only the fields needed.
- **Lazy loading is explicit.** A lazy load inside a loop or a serializer
  is a hidden N+1; define what one unit of work loads.
- **The query plan is the measurement.** For a new or changed query on a
  large table, capture the plan before and after. A row estimate off by an
  order of magnitude means stale statistics: refresh them before adding
  anything. Index the query's shape (equality columns, then range or sort;
  an expression index when the query applies a function; a partial index
  for a rare value). An index that did not change the plan is a revert,
  and every index taxes every write.
- **One connection pool per process**, with `instances x max` under the
  database's limit and a checkout timeout so exhaustion fails fast. When
  every endpoint slows at once, find what holds connections (a long
  transaction, a missing `await`, a leaked client) before raising `max`.
  With autoscaling or serverless, put a multiplexing proxy in front.
- **A remote API is coarse.** Many calls per user action means the
  contract is wrong; batch behind one use-case shaped call.

## Computation

- **Complexity fits the growth.** No nested scan over two growing
  collections, no `includes`/`indexOf` inside a loop, no repeated sort, no
  string built by concatenation in a loop: use a map or set, sort once,
  join. Write the test at the input size where the budget fails.
- **Work runs once.** Hoist what is computed per item, per request, or per
  render. Memoize only a pure function the profile shows is hot; memoizing
  cheap work buys memory and an invalidation bug.
- **Nothing heavy on a latency path.** CPU-heavy work or synchronous I/O in
  a request handler, event loop, or UI thread moves to a worker, a queue,
  or a background job, or is chunked. Trap: a queue without a bound turns
  overload into memory growth.

## I/O and concurrency

- **Bulk before parallel.** One bulk call beats N calls; otherwise run them
  concurrently with a limit. Unbounded concurrency against a rate-limited
  or shared service is a self-inflicted outage.
- **Timeouts and bounded retries.** Every remote call has a timeout;
  retries only for idempotent calls, with backoff, jitter, and a cap, at
  one layer (three layers of three retries are 27 calls).
- **Queues and buffers** have a bound and back pressure.
- **Lock contention:** when throughput flattens as concurrency rises,
  shorten the critical section, lock finer-grained data, or remove the
  shared mutable state. Measure wait time, not only hold time. Hold no lock
  or connection across a slow remote call.
- **More pool, threads, or instances** move a queue to a shared resource
  where it is harder to see. Find what holds the resource first.

## Memory

- Stream or page large inputs and results instead of loading them whole.
- Listeners, timers, and subscriptions are removed when their owner goes
  away. A module-level map used as a cache is a leak.
- For growth that never returns, take two heap snapshots under the same
  load and diff them.

## Caching

Cache only what was measured as expensive and is read far more often than
it changes. A cache is derived data: it has an owner, a staleness window,
and a way to rebuild.

- Key on every input the response varies by: tenant, viewer, locale,
  permissions, feature flags. A key that omits the viewer serves one user's
  data to another.
- Choose one invalidation strategy (TTL, event or tag, versioned keys) and
  write the acceptable staleness down.
- Protect hot keys from a stampede: coalesce concurrent misses behind one
  in-flight load, or serve stale while one request refreshes.
- Cache negative results with a shorter TTL, and never cache an origin
  error.
- Bound it by size or memory with an eviction policy.
- Never cache what must be fresh: balances, permissions, stock at checkout.

## Final checklist

Mark each item checked, not applicable, or failed, with evidence.

- [ ] The load and the hot paths are named, with the size at which the design breaks
- [ ] No query or remote call inside a loop over data that grows; bulk or join instead
- [ ] Every list read is bounded: limit plus stable order, or a stream
- [ ] New or changed queries on large tables have a plan checked before and after
- [ ] One connection pool per process, sized under the shared limit, with a timeout
- [ ] No nested scan over two growing collections; lookups use a map or set
- [ ] No work repeated per item, request, or render that could run once
- [ ] No CPU-heavy or synchronous I/O work on a request handler, event loop, or UI thread
- [ ] Every remote call has a timeout; concurrency is bounded; retries only for idempotent calls, with backoff and a cap
- [ ] Queues, buffers, and caches have a bound and a defined full behavior
- [ ] Listeners, timers, and subscriptions are released; large inputs are streamed or paged
- [ ] Any cache: measured as expensive, keyed on everything the response varies by, one invalidation strategy with a stated staleness, stampede-protected, and nothing cached whose staleness is a correctness bug
- [ ] A hot-path change comes with a before/after measurement under the same conditions; otherwise it is reported as potential impact
- [ ] A countable cost (queries, calls, allocations) is asserted in a test
- [ ] Frontend change: the budgets in `performance-web.md` were checked
