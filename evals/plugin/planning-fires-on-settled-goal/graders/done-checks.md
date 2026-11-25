---
type: llm
---

PASS if each step or milestone of the plan ends in a result someone can check (for example "staging cluster up and a smoke test passes", "first service serving production traffic from the cluster", "database restored from backup in under N minutes") and at least most of them say how that is checked.

FAIL if the steps are activities with no checkable end ("work on the cluster", "migrate services", "handle the database").
