---
description: 'A batch of subagents with a validator on every output has a 12% failure rate, and the user plans to move the whole batch to the largest model at maximum effort. Checks the escalation from the model-selection guidance: re-run only the failures, and escalate one step at a time.'
expected_outcome: 'The reply advises against moving the whole batch to Fable 5.2 at max, recommends re-running only the failed files, and escalates stepwise (first check why they fail or give the agent the validator, then one effort level up, then the next model up at a lower effort).'
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Every night, Sonnet 5.5 subagents at default effort convert about 400 legacy config files to our new schema, one file per subagent, and a validator checks each output. About 12% fail validation. I'm planning to switch the whole batch to Fable 5.2 at max effort. Good idea? Give me your recommendation.
