---
type: llm
---

PASS if the review flags the `db.query` call inside `for (const order of orders)` as an N+1 or per-row query problem, labels it Important or Critical, and gives a location in `src/orders.js`.

FAIL if it is not mentioned, or is labelled Minor or FYI.
