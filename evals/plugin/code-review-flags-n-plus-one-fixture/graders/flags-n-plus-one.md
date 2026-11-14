---
type: llm
---

PASS if the review flags the `db.query` call inside `for (const order of orders)` in `src/orders.js` as an N+1 or per-row query problem, labels it Important or Critical (or the reviewer's equivalent of "must fix before merge"), and gives its location in `src/orders.js`.

FAIL if it is not mentioned, or is labelled Minor, Nit, or FYI.
