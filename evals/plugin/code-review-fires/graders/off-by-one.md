---
type: llm
---

PASS if the review points out that `rows.slice(start, start + size - 1)` returns one row fewer than `size` on every page and files it as Critical or Important (must be fixed before merge).

FAIL if the review misses that pages come back one row short, or files it as Minor or FYI.
