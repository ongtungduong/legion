---
type: llm
---

PASS if the reply identifies that `rows.slice(start, start + size - 1)` drops one row per page because the end index of `slice` is exclusive, and the fix is `rows.slice(start, start + size)`.

FAIL if it misses the off-by-one or names another cause.
