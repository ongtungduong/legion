---
description: 'A feature whose natural first draft queries once per customer. The generated code should use one query.'
expected_outcome: 'One SQL query (JOIN or GROUP BY, or one batched IN query) returns every customer with an order count; no query runs inside a loop over customers.'
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a function `customersWithOrderCounts(db)` that returns every customer's name with how many orders they have. `db.query(sql, params)` runs a Postgres query and resolves to rows. Tables: `customers(id, name)` and `orders(id, customer_id)`. Show the code and its test.
