---
type: llm
---

The request leaves cases open: other accented scripts (French, German), characters that still have no ASCII form, and empty results.

PASS if the reply explicitly states at least one assumption or decision about such an unspecified case as an expected result (for example "other Latin accents are stripped the same way: 'Crème Brûlée' -> 'creme-brulee'" or "a title with no ASCII form returns ''"), marked as its own call for the user to confirm or correct.

FAIL if the reply makes no such case explicit.
