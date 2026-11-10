# Performance checklist

Mark each item checked, not applicable, or failed, with evidence. A claim of
speed needs a measured number and its source; without one, say "potential
impact".

## Data access
- [ ] No query or remote call inside a loop over data that grows; bulk or join instead
- [ ] Every list read is bounded: limit plus stable order, or a stream
- [ ] New or changed queries on large tables have a plan checked before and after
- [ ] One connection pool per process, sized under the shared limit, with a timeout

## Computation
- [ ] No nested scan over two growing collections; lookups use a map or set
- [ ] No work repeated per item, request, or render that could run once
- [ ] No CPU-heavy or synchronous I/O work on a request handler, event loop, or UI thread

## I/O and failure
- [ ] Every remote call has a timeout
- [ ] Concurrency is bounded; retries only for idempotent calls, with backoff and a cap
- [ ] Queues and buffers have a bound and backpressure

## Memory
- [ ] Listeners, timers, and subscriptions are removed when their owner goes away
- [ ] Large inputs are streamed or paged, not loaded whole

## Caching (if any)
- [ ] The cached call was measured as expensive and is re-read more than written
- [ ] The key includes tenant, viewer, locale, and permissions where the response varies by them
- [ ] One invalidation strategy and a stated staleness window
- [ ] Bounded size with eviction; hot keys protected from a stampede
- [ ] Nothing cached whose staleness is a correctness bug

## Proof
- [ ] A hot-path change comes with a before/after measurement, same conditions
- [ ] A countable cost (queries, calls, allocations) is asserted in a test
- [ ] Frontend change: `references/web.md` budgets checked
