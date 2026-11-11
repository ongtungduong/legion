---
type: llm
---

PASS if the review flags that listing orders now runs one extra query per order, and traces it to its source: `GET /orders` in `src/api/orders.js` runs `toOrderDto` for every order (`Promise.all(orders.map(toOrderDto))`), `toOrderDto` awaits `describeShipping(order)`, and that calls the lazy `order.getShipment()`, which runs `SELECT ... FROM shipments WHERE order_id = $1` once per order. The finding names an N+1 (or one query per order, or a lazy load inside a loop), cites `src/serializers/order.js`, `src/shipping/describe.js`, or `src/api/orders.js` as its location, and is labelled Important or Critical. A suggested fix (a join or one batched `WHERE order_id = ANY($1)` query for the page, or eager loading) is welcome but not required.

FAIL if the per-order shipment query is not mentioned, if it is only described as "the DTO is now async" or "Promise.all adds concurrency" without saying a query runs per order, or if it is labelled Minor or FYI.
