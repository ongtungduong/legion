---
description: Fixture twin of `executing-plans-batches-queries`, in a small real project so the model writes and runs the code. A feature whose natural first draft queries once per customer; deterministic graders read the file it writes. Needs `--scaffold --allow-tools Write Edit Bash`.
expected_outcome: src/order-counts.js exports customersWithOrderCounts, which issues one db.query (LEFT JOIN with GROUP BY, or a COUNT subquery) that keeps customers with zero orders and never queries inside a loop; a test covers it and the reply reports a fresh full-suite run; legion:executing-plans is invoked.
max_turns: 25
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Add a function `customersWithOrderCounts(db)` in a new file `src/order-counts.js` that returns every customer's name with how many orders they have. `db.query(sql, params)` runs a Postgres query and resolves to rows, as in `src/customers.js`. Tables: `customers(id, name)` and `orders(id, customer_id)`.
