---
type: llm
---

PASS if the review points out that `rows.slice(start, start + size - 1)` returns one row fewer than `size` on every page and treats it as something that must be fixed before merge (labelled Critical or Important, or the reviewer's equivalent).

FAIL if the review misses that pages come back one row short, or presents it as minor, optional, or FYI.
