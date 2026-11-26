---
description: 'Six tests in three modules started failing after one merge, and the user asks for one subagent per test. Failures that appeared together may share one cause, which split agents would each patch around. Checks that the plan looks for the shared cause first.'
expected_outcome: 'The reply proposes first looking for a common cause of the six failures (the merge, a shared dependency) in one place, and only splitting into per-test agents if the failures turn out to be independent.'
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Six tests started failing right after yesterday's merge of the `billing-refactor` branch: two in `orders/`, two in `invoices/`, two in `payments/`. Use subagents, one per failing test, to fix them in parallel. How would you dispatch it? Don't edit anything yet.
