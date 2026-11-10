---
description: 'A new module written from scratch. The chain should load coding-principles, name its references, and answer their checklist; the code should keep parsing and aggregation apart.'
expected_outcome: 'The reply has a "Principles:" line naming a reference and answers its checklist; parsing and per-customer totals are separate functions with tests.'
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a small Node module that reads a CSV string of orders (`order_id,customer_id,total_cents`) and returns the total spent per customer. Show the code and its tests.
