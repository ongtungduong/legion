---
type: llm
---

PASS if the review flags the `db.query` call inside `for (const order of orders)` as an N+1 or per-row query problem, treats it as something to fix before merge (labelled Important or Critical, or the reviewer's equivalent), and gives a location in `src/orders.js`.

FAIL if it is not mentioned, or is presented as minor, optional, or FYI.
