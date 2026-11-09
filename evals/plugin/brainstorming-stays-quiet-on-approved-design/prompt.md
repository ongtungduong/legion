---
description: 'Near miss: the design is approved and the user wants tasks; that is writing-plans, not brainstorming.'
expected_outcome: 'legion:brainstorming is not invoked.'
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Here is the approved design doc. Break it into implementation tasks.

```markdown
# Export CSV Design
## Intent
Let admins download all orders as CSV.
## Design
GET /admin/orders.csv streams every order (id, customer, total_cents, created_at), admin only.
## Success criteria
An admin gets a CSV with one row per order; anyone else gets 403.
```
