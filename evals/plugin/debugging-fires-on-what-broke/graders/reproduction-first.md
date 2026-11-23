---
type: llm
---

PASS if the reply ties the diagnosis to a reproduction before or alongside the fix: it runs or names the failing test as the check that goes red now and green after the fix, or gives a minimal check (for example 20 rows, page 1, size 20, expect 20) that shows the missing row.

FAIL if it states the cause and the fix with no check that shows the failure or confirms the fix.
