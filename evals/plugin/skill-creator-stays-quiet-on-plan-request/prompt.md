---
description: 'Near miss: an implementation plan request, not a skill.'
expected_outcome: 'legion:skill-creator is not invoked.'
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the implementation plan for a new REST endpoint that returns a customer's last ten orders. The design is approved: GET /customers/:id/orders?limit=10, newest first.
