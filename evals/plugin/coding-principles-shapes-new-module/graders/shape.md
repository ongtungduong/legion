---
type: llm
---

PASS if all hold: the reply names a coding rule set it applied (for example "clean-code" or "a-philosophy-of-software-design") and says whether its checklist holds; CSV parsing and the per-customer aggregation are separate functions (or modules) rather than one function doing both; there are tests for both, including a malformed or empty input.

FAIL if no rule set is named, or parsing and aggregation live in one function, or there are no tests.
