---
type: llm
---

The prompt gives: three web services and a Postgres database on one VM, move to Kubernetes, hosting contract ends March 31, two backend engineers, no outage longer than 10 minutes. It gives no cloud provider, cluster size, budget, tool choices, or names.

PASS if every cloud provider, managed service, cluster size, budget figure, or person's name in the plan is marked as an assumption or left as an open question for the user, or the plan has none.

FAIL if it states invented specifics (a provider, a budget, a named owner, a node count) as if they were agreed facts.
