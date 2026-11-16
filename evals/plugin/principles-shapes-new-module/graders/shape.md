---
type: llm
---

PASS if both hold: CSV parsing and the per-customer aggregation are separate functions (or modules) rather than one function doing both; and there are tests for both, including a malformed or empty input.

FAIL if parsing and aggregation live in one function, or there are no tests, or no test covers a malformed or empty input.
