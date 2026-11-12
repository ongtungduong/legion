# Performance audit

Read this when asked to audit a system, a directory, or a whole repository
(not a diff) for performance. Reading source shows where cost can come from,
not how much it costs: every finding without a measurement is "potential
impact", and no number appears in the report unless a tool produced it.

## Procedure

1. **Scope.** Name the paths and the hot paths: what runs per request, per
   row, per frame, or per job item, and which data grows with users or time.
   Read the baseline: existing budgets, benchmarks, dashboards, or a
   `PERF.md`, so a known trade-off is not reported as new.
2. **Measure what you can.** Run the project's own benchmarks, profilers, or
   load tests if they exist; read query plans for the heaviest queries; for a
   web front end, read [references/performance-web.md](performance-web.md) and use its tools. Record each number with its
   source and conditions. Nothing runnable: say so and continue from source.
3. **Scan the source** for the signatures in [references/performance.md](performance.md):
   queries and remote calls inside loops, unbounded reads, nested scans over
   growing collections, blocking work on latency paths, unbounded
   concurrency, retries without caps, caches without bounds or with keys
   missing the viewer, leaked listeners and timers.
4. **Trace the system.** For each candidate, follow it through callers and
   shared resources (database, pool, queue, cache, rate-limited APIs): a
   cost paid once at startup is not a finding; the same cost per request is.
5. **Verify each finding.** Confirm the code path really runs where you say
   (per request, per row) and that nothing upstream already bounds it
   (pagination, a cache, a batch loader). Drop what fails; move what you
   cannot settle to Not checked.
6. **Rank.** Order by expected share of the total cost: per-request
   and per-row costs on the busiest paths first, then growth risks (fine
   today, fails at 10x data), then one-off costs. Fold more than five Minor
   findings into one line per file.

## Report

```
### Scope
<paths, hot paths, growing data; baseline read>
### Method
<what was measured and how, what was read from source only>
### Findings
| Severity | Location | Finding | Evidence | Impact |
|---|---|---|---|---|
| Important | src/routes/orders.js:9 | query per order inside a loop | runs per request; orders grow per customer | measured: <value, source> / potential impact |
### Not checked
<what was out of reach, and what would settle it>
```

Severity: Critical (fails its budget or falls over at current load),
Important (fails at expected growth, or a measurable cost on a hot path),
Minor (small or one-off cost), FYI (context only).
