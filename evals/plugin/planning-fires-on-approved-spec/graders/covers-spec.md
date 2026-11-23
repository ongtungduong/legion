---
type: llm
---

The spec: GET /admin/orders.csv streams every order with id, customer, total_cents, created_at; admin only; an admin gets one row per order; anyone else gets 403.

PASS if every part of the spec maps to a step or a test in the plan (streaming all orders, the four columns, the admin-only check, the 403 for non-admins) and the plan adds no feature the spec does not ask for (filters, pagination, scheduling, other formats).

FAIL if a requirement has no step or test, or the plan adds unrequested features.
