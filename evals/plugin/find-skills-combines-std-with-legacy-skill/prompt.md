---
description: 'Fixture case. A behavior change to an untested legacy module in a repo that has its own project skill for legacy seams. find-skills should combine the Legion method (std-development) with the project skill: pin the current total before adding the fee, through the house seams. Needs `--scaffold`.'
expected_outcome: 'legion:std-development and the project skill legacy-seams are both used; the reply gives a characterization test of the current total (no fee) that passes before the change, injects the clock and the rates through the constructor as the project skill says, then adds the late fee with its tests.'
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a late fee to `InvoiceService.total` in `src/invoice.js`: 5% of the subtotal when the invoice's `dueDate` is more than 30 days before today. There are no tests for this file yet. Show me the changed code and the tests.
