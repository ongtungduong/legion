---
description: 'Fixture case, needs `--scaffold` and `--allow-tools Write Edit`. The repo says plans live in tasks/plan.md, which already holds an unfinished plan for other work. The new plan must not replace it, and each of its steps must leave `npm test` green.'
expected_outcome: 'legion:planning is invoked; tasks/plan.md keeps the rate-limiting tasks (the new plan goes elsewhere, is added beside them, or the conflict is raised); every step of the new plan ends with the suite passing.'
max_turns: 16
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

This spec is approved. Write the implementation plan following the repo's conventions; do not implement it.

```markdown
# Spec: CSV export of orders
## Intent
Admins download all orders as CSV.
## Design
GET /api/orders.csv streams every order (id, customer, total_cents, created_at), admin only (header `x-role: admin`).
## Success criteria
An admin gets a CSV with a header row and one row per order; anyone else gets 403.
```
