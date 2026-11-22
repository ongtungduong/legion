---
description: 'Fixture case. A cause-unknown problem in a service that has its own project skill (a runbook). find-skills should load the Legion method and the project skill together, not one or the other. Needs `--scaffold`.'
expected_outcome: 'legion:debugging and the project skill payments-runbook are both invoked; the reply traces the 502s to the database URL variable renamed in the deploy (log line "db pool: no url configured") before proposing a fix.'
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

The payments service has returned 502 on every charge since this morning's deploy, while its health check stays green. Find out why.
