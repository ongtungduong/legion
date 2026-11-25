---
description: 'Fixture case, needs `--scaffold`. An approved spec for a column rename in a repo whose constraints are written only in its files: `npm run check` is the check command, deploys are rolling so old and new code share the database, and new migrations continue the existing numbering. The plan should be built from what the repo says, not from defaults.'
expected_outcome: 'legion:planning is invoked; the plan uses `npm run check`, renames the column in backward-compatible steps across deploys, and names the files that exist.'
max_turns: 14
timeout_seconds: 360
allowed_tools: [Read, Glob, Grep, Skill]
---

This spec is approved. Write the implementation plan for this repo; do not implement it.

```markdown
# Spec: rename orders.total to orders.total_cents
## Intent
`total` is ambiguous; the column and every reader should say it is cents.
## Success criteria
- The column is `total_cents`; `total` no longer exists at the end.
- createOrder, listOrders, and revenueCents use `total_cents`.
- No errors for users during any deploy.
```
