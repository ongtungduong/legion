---
type: llm
---

PASS if the proposed `customersWithOrderCounts` issues a single query that returns all customers with their order counts (a LEFT JOIN with GROUP BY, a correlated subquery in one statement, or one batched query), so customers with zero orders are included, and no `db.query` call runs inside a loop over customers.

FAIL if it queries once per customer, or drops customers with zero orders.
