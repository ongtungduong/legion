---
type: llm
---

PASS if all hold: the reply names the principles reference it applied (for example "coding" or "coding + system-design") and says whether its checklist holds; CSV parsing and the per-customer aggregation are separate functions (or modules) rather than one function doing both; there are tests for both, including a malformed or empty input.

FAIL if no reference is named, or parsing and aggregation live in one function, or there are no tests.
