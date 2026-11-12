---
type: llm
---

PASS if both hold: (a) the per-order `order_items` query inside the loop is replaced by a single query for all orders (a join, or one `WHERE order_id = ANY($1)` / `IN (...)` query grouped in code); and (b) the reply names at least one way to measure before and after the change: timing the endpoint, counting queries per request, a benchmark, a profiler, or a query plan.

FAIL if the per-order query stays inside the loop, or if the reply states the new code's latency or speedup as a fact (for example "now takes 50 ms" or "10x faster") without saying it was measured. A proposed target or budget ("aim for p95 under 200 ms"), a query count derived from the code ("2 queries instead of N+1"), and the user's own figures are not such claims.
