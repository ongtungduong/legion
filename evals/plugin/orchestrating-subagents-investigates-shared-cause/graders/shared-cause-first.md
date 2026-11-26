---
type: llm
---

PASS if, before any per-test fixing agents, the reply proposes finding out whether the six failures share a cause (for example by looking at the `billing-refactor` merge, or one triage pass over all six failures, done by the main session or a single agent), and only splits into parallel fixers if the failures turn out independent.

FAIL if the reply's plan dispatches one fixing agent per test (or per module) straight away, with no step that checks for a shared cause first.
