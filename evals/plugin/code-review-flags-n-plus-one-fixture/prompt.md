---
description: Fixture twin of `code-review-flags-n-plus-one`. A real git repo whose feature branch adds a query per order inside a loop; the reviewer must find it with git rather than read a pasted diff, flag it at Important or above, and leave the code alone. Needs `--scaffold --allow-tools Bash`.
expected_outcome: The review flags the per-order db.query inside the loop in src/orders.js as an N+1 at Important or Critical with a location; src/orders.js is left as committed; legion:code-review is invoked.
max_turns: 20
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, Bash]
---

Review my branch `feature/line-items` against `main` before I merge it. It adds line items to the orders list.
