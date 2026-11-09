---
description: 'An approved spec and a request for the plan. writing-plans should fire.'
expected_outcome: 'legion:writing-plans is invoked; the reply is a plan of tasks with tests.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

The spec is approved, write the implementation plan. Do not implement it.

```markdown
# Export CSV Design
## Intent
Let admins download all orders as CSV.
## Design
GET /admin/orders.csv streams every order (id, customer, total_cents, created_at), admin only.
## Success criteria
An admin gets a CSV with one row per order; anyone else gets 403.
```
