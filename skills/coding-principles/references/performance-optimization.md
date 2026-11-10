# Optimizing toward a measured goal

Read this when the task is to make existing code faster or lighter: an
endpoint, a query, a job, memory, bundle size. Measure, find the one
bottleneck that dominates, fix it, measure again. An optimization without a
measurement is a guess, and a guess that lands adds complexity the codebase
pays for forever.

A regression ("it got slower since yesterday's deploy") is a bug: call the
Skill tool with `legion:systematic-debugging`, whose baseline-then-bisect
loop fits better. When it hands back a found cause, enter at step 6 with
its baseline.

## Workflow

1. **Set the budget.** What number, on what workload, counts as done ("p95
   under 200 ms at 50 requests/s", "import of a 1 GB CSV in under 2 GB of
   memory"). Take it from the spec's or the plan's `Performance` line;
   otherwise propose one and confirm it. Without a budget there is no
   stopping point. For browser-facing work, take targets and tools from
   `performance-web.md`.
2. **Measure the baseline** with the project's own tools, on a realistic
   workload, repeated enough to see the noise. Record the command, the
   conditions, and the result with its spread.
3. **Find what dominates (first principles, Pareto).** Profile, trace, or
   read the query plan before naming a cause; the obvious suspect is often
   wrong. Rank costs by share of the total: fixing a step that takes 5% of
   the time saves at most 5%. Work on the largest share first.
4. **Trace the system around it (systems thinking).** Follow the cost
   upstream and downstream: who calls this per request, row, or frame, and
   which queues, retries, caches, pools, and locks sit on the path. A cache
   that turns a slow read into a stale one moves the problem instead of
   solving it.
5. **Ask what load breaks it (inversion).** Name the input size,
   concurrency, or data growth at which the current code fails the budget,
   and the one at which your fix would.
6. **Fix the one bottleneck, test-first.** Call the Skill tool with
   `legion:executing-plans`: existing behavior is pinned by tests
   (characterization tests if there are none) before the fix and stays
   green after it. Where the cost is countable (queries per request,
   allocations, calls), assert the count in a test. Take the fix from the
   matching section of `performance.md`.
7. **Re-measure the same way** as the baseline: same command, conditions,
   and sample size. Keep the change only if it beats the noise and the
   budget moves; neutral or worse is a revert.
8. **Guard it.** Leave a check that fails when the number regresses: a
   count assertion, a benchmark with a threshold, a CI budget.

## Gotchas

- A cold-cache baseline against a warm-cache result measures the cache.
  Warm both or neither, and say which.
- One run is one sample. Compare the delta with run-to-run variance; a 3%
  gain inside 5% noise is not a gain.
- Several optimizations landed together produce one number you cannot
  attribute. Measure each alone first.
- An "optimization" that drops work the product needs (a validation, a
  freshness guarantee, an `await` that ordered writes) is a regression with
  a better benchmark.
- "Add an index" is a guess; the query plan before and after is the
  measurement.
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
