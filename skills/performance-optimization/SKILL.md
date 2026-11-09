---
name: performance-optimization
description: >-
  Speeds up code toward a measured goal: sets a budget, measures a baseline,
  profiles to the real bottleneck, fixes it test-first, and re-measures,
  never claiming a gain without a number and its source. Use when asked to
  make code, an endpoint, a query, or a job faster; to cut latency, memory,
  CPU, or bundle size; to fix an N+1 query, a query in a loop, or missing
  caching; to optimize or profile; to improve Core Web Vitals (LCP, INP, CLS)
  or throughput; or when the code handles data that grows with users or
  time, even when the code is pasted inline.
license: MIT
metadata:
  author: ongtungduong
---

# Performance Optimization

Measure, find the one bottleneck that dominates, fix it, measure again. An
optimization without a measurement is a guess, and a guess that lands adds
complexity the codebase pays for forever.

**The rule:** no claim that code is faster, lighter, or "optimized" without a
before and after number, each naming its source (benchmark, profiler, query
plan, lab run, field data). Without one, the finding is *potential impact*.
The reason: a model reading source cannot see runtime cost, and a confident
number nobody measured sends the next change in the wrong direction.

A regression ("it got slower since yesterday's deploy") is a bug: call the
Skill tool with `legion:systematic-debugging`; its baseline-then-bisect loop
fits better. This skill is for improving toward a goal.

## Workflow

1. **Set the budget.** What number, on what workload, counts as done
   ("p95 under 200 ms at 50 requests/s", "import of a 1 GB CSV in under
   2 GB of memory"). Take it from the spec's `Performance` line or the
   plan's; otherwise propose one and confirm it. Without a budget there is
   no stopping point.
2. **Measure the baseline** with the project's own tools, on a realistic
   workload, repeated enough to see the noise. Record command, conditions,
   and the result with its spread.
3. **Find what dominates (first principles, Pareto).** Profile, trace, or
   read the query plan before naming a cause; the obvious suspect is often
   wrong. Rank costs by share of the total: fixing a step that takes 5% of
   the time can save at most 5%. Work on the largest share first.
4. **Trace the system around it (systems thinking).** Follow the cost
   upstream and downstream: who calls this per request, row, or frame; what
   queues, retries, caches, pools, and locks sit on the path. A local speedup
   that raises load on a shared database, or a cache that turns a slow read
   into a stale one, moves the problem instead of solving it.
5. **Ask what load breaks it (inversion).** Before fixing, name the input
   size, concurrency, or data growth at which the current code fails the
   budget, and the one at which your fix would. Code that is fine at 100 rows
   and quadratic at 100,000 is the common case.
6. **Fix the one bottleneck, test-first.** Call the Skill tool with
   `legion:executing-plans`: the existing behavior is pinned by tests (add
   characterization tests if there are none) before the fix, and stays green
   after it. Where the cost is countable (queries per request, allocations,
   calls), assert the count in a test so a regression fails the suite.
   Before naming the fix, read
   [references/patterns.md](references/patterns.md) for the bottleneck you
   found.
7. **Re-measure the same way** as the baseline: same command, conditions,
   and sample size. Keep the change only if it beats the noise and the
   budget moves; neutral or worse is a revert.
8. **Guard it.** Leave a check that fails when the number regresses: a count
   assertion, a benchmark with a threshold, a CI budget. Report in the format
   below.

When writing or reviewing code rather than optimizing (the chain loaded this
skill because a change touches a query in a loop, a hot path, growing data,
or rendering), skip steps 1, 2, and 7: apply the patterns and answer
[references/performance-checklist.md](references/performance-checklist.md)
item by item.

For browser-facing work (page load, interaction latency, layout shift,
bundle size, rendering), read [references/web.md](references/web.md) at
step 1 for its targets and tools. To audit a whole system, directory, or
repository rather than one change (no diff), read
[references/audit.md](references/audit.md) and follow it; its report format
is shared with the security audit.

## Gotchas

- A cold-cache baseline against a warm-cache result measures the cache.
  Warm both or neither, and say which.
- One run is one sample. Repeat and compare the delta with run-to-run
  variance; a 3% gain inside 5% noise is not a gain.
- Several optimizations landed together produce one number you cannot
  attribute. Measure each alone first.
- An "optimization" that drops work the product needs (a validation, a
  freshness guarantee, an `await` that ordered writes) is a regression with
  a better benchmark.
- "Add an index" is a guess; the query plan before and after is the
  measurement. Every index taxes every write.
- Bigger pools, more threads, and more instances move a queue to a shared
  resource where it is harder to see. Find what holds the resource first.
- Caching a cheap call buys a staleness bug and nothing else. A cache key
  that omits the viewer (tenant, permissions, locale) serves one user's data
  to another.
- Log reverted attempts with their numbers (in the PR or a `PERF.md`), so
  the same dead idea is not retried next quarter.

## Output format

```
Budget: <metric and target, on what workload>
Baseline: <value +/- spread> (source: <command or tool>, <conditions>)
Bottleneck: <what dominates, share of total> (source: <profile/plan/trace>)
Change: <the one fix>; tests: <command> -> <result>
Result: <value +/- spread> (same source and conditions) -> kept | reverted
Guard: <test or CI check that fails on regression>
Unmeasured: <each potential-impact finding, or "none">
```
